/**
 * Postgres Decision Graph store — implements DecisionGraphStore against
 * migrations/001_decision_graph.sql. No competing schema shapes.
 *
 * Invariants enforced here:
 * - tenantId required before any persist (tenant-before-persist)
 * - evidence INSERT only (append-only; id conflict = no-op)
 * - activity is a projection write (activity_events), not source ledger
 * - nonces tenant-agnostic per operator but durable in operator_ingest_nonces
 *
 * Does not enable Eve, remote models, daemon feature flags, or external writes.
 */
import type { Pool, PoolConfig } from 'pg'
import {
  mapActivity,
  mapArtifact,
  mapChange,
  mapContribution,
  mapDecision,
  mapEvaluation,
  mapEvidence,
  mapOperator,
  mapPolicy,
  mapSource,
  mapValidation,
  mapVersion,
} from './mappers'
import { buildProfile, filterActivity } from './profile'
import type { SqlClient, SqlPool } from './sql'
import type {
  ActivityEventV2,
  Artifact,
  DecisionGraphSnapshot,
  EvidenceRecord,
} from './types'
import type { DecisionGraphStore } from './store-types'

export type PostgresStoreOptions = {
  /** Injected client (tests) or live pool */
  client: SqlClient
  /**
   * Optional default tenant scope for list* helpers.
   * Cross-tenant reads must pass explicit tenantId.
   */
  defaultTenantId?: string
}

function requireTenant(tenantId: string | undefined, op: string): string {
  const t = (tenantId || '').trim()
  if (!t) {
    throw new Error(
      `tenant-before-persist: ${op} requires a non-empty tenantId`,
    )
  }
  return t
}

/**
 * Create a Postgres-backed Decision Graph store.
 * Schema must match migrations/001_decision_graph.sql.
 */
export function createPostgresStore(
  options: PostgresStoreOptions,
): DecisionGraphStore {
  const { client, defaultTenantId } = options

  async function loadSnapshot(
    tenantId?: string,
  ): Promise<DecisionGraphSnapshot> {
    const tenant = tenantId || defaultTenantId

    const artifactSql = tenant
      ? 'SELECT * FROM artifacts WHERE tenant_id = $1 ORDER BY created_at'
      : 'SELECT * FROM artifacts ORDER BY created_at'
    const artifactParams = tenant ? [tenant] : []

    const artifacts = (
      await client.query(artifactSql, artifactParams)
    ).rows.map(mapArtifact)
    const artifactIds = artifacts.map((a) => a.id)

    if (artifactIds.length === 0) {
      return emptySnapshot()
    }

    // Child tables: filter by artifact membership (tenant isolation via parent)
    const versions = (
      await client.query(
        `SELECT * FROM artifact_versions WHERE artifact_id = ANY($1::text[])`,
        [artifactIds],
      )
    ).rows.map(mapVersion)

    const sources = (
      await client.query(
        `SELECT * FROM artifact_sources WHERE artifact_id = ANY($1::text[])`,
        [artifactIds],
      )
    ).rows.map(mapSource)

    const evidenceSql = tenant
      ? `SELECT * FROM evidence_records WHERE tenant_id = $1 ORDER BY observed_at`
      : `SELECT * FROM evidence_records WHERE artifact_id = ANY($1::text[]) ORDER BY observed_at`
    const evidence = (
      await client.query(
        evidenceSql,
        tenant ? [tenant] : [artifactIds],
      )
    ).rows.map(mapEvidence)

    const policies = (await client.query(`SELECT * FROM policies`)).rows.map(
      mapPolicy,
    )

    const evalSql = tenant
      ? `SELECT * FROM policy_evaluations WHERE tenant_id = $1 ORDER BY evaluated_at`
      : `SELECT * FROM policy_evaluations WHERE artifact_id = ANY($1::text[]) ORDER BY evaluated_at`
    const evaluations = (
      await client.query(evalSql, tenant ? [tenant] : [artifactIds])
    ).rows.map(mapEvaluation)

    const decSql = tenant
      ? `SELECT * FROM decisions WHERE tenant_id = $1 ORDER BY decided_at`
      : `SELECT * FROM decisions WHERE artifact_id = ANY($1::text[]) ORDER BY decided_at`
    const decisions = (
      await client.query(decSql, tenant ? [tenant] : [artifactIds])
    ).rows.map(mapDecision)

    const valSql = tenant
      ? `SELECT * FROM validation_runs WHERE tenant_id = $1 ORDER BY ran_at`
      : `SELECT * FROM validation_runs WHERE artifact_id = ANY($1::text[]) ORDER BY ran_at`
    const validations = (
      await client.query(valSql, tenant ? [tenant] : [artifactIds])
    ).rows.map(mapValidation)

    const contribSql = tenant
      ? `SELECT * FROM contribution_records WHERE tenant_id = $1 ORDER BY created_at`
      : `SELECT * FROM contribution_records WHERE artifact_id = ANY($1::text[]) ORDER BY created_at`
    const contributions = (
      await client.query(contribSql, tenant ? [tenant] : [artifactIds])
    ).rows.map(mapContribution)

    const chgSql = tenant
      ? `SELECT * FROM change_events WHERE tenant_id = $1 ORDER BY occurred_at`
      : `SELECT * FROM change_events WHERE artifact_id = ANY($1::text[]) ORDER BY occurred_at`
    const changes = (
      await client.query(chgSql, tenant ? [tenant] : [artifactIds])
    ).rows.map(mapChange)

    const actSql = tenant
      ? `SELECT * FROM activity_events WHERE tenant_id = $1 ORDER BY occurred_at DESC`
      : `SELECT * FROM activity_events ORDER BY occurred_at DESC`
    const activity = (
      await client.query(actSql, tenant ? [tenant] : [])
    ).rows.map(mapActivity)

    const opSql = tenant
      ? `SELECT * FROM operator_agents WHERE tenant_id = $1`
      : `SELECT * FROM operator_agents`
    const operators = (
      await client.query(opSql, tenant ? [tenant] : [])
    ).rows.map(mapOperator)

    return {
      artifacts,
      versions,
      sources,
      evidence,
      policies,
      evaluations,
      decisions,
      validations,
      contributions,
      changes,
      activity,
      operators,
    }
  }

  return {
    async getSnapshot(tenantId?: string) {
      return loadSnapshot(tenantId)
    },

    async getArtifact(id: string, tenantId?: string) {
      if (tenantId) {
        const r = await client.query(
          `SELECT * FROM artifacts WHERE id = $1 AND tenant_id = $2`,
          [id, tenantId],
        )
        return r.rows[0] ? mapArtifact(r.rows[0]) : undefined
      }
      if (defaultTenantId) {
        const r = await client.query(
          `SELECT * FROM artifacts WHERE id = $1 AND tenant_id = $2`,
          [id, defaultTenantId],
        )
        return r.rows[0] ? mapArtifact(r.rows[0]) : undefined
      }
      const r = await client.query(`SELECT * FROM artifacts WHERE id = $1`, [
        id,
      ])
      return r.rows[0] ? mapArtifact(r.rows[0]) : undefined
    },

    async getProfile(id: string, tenantId?: string) {
      const snap = await loadSnapshot(tenantId)
      return buildProfile(snap, id)
    },

    async listArtifacts(tenantId?: string) {
      const snap = await loadSnapshot(tenantId)
      return snap.artifacts
    },

    async listEvidence(artifactId: string, tenantId?: string) {
      if (tenantId) {
        const r = await client.query(
          `SELECT * FROM evidence_records
           WHERE artifact_id = $1 AND tenant_id = $2
           ORDER BY observed_at`,
          [artifactId, tenantId],
        )
        return r.rows.map(mapEvidence)
      }
      const r = await client.query(
        `SELECT * FROM evidence_records WHERE artifact_id = $1 ORDER BY observed_at`,
        [artifactId],
      )
      return r.rows.map(mapEvidence)
    },

    async listEvaluations(artifactId: string, tenantId?: string) {
      if (tenantId) {
        const r = await client.query(
          `SELECT * FROM policy_evaluations
           WHERE artifact_id = $1 AND tenant_id = $2
           ORDER BY evaluated_at`,
          [artifactId, tenantId],
        )
        return r.rows.map(mapEvaluation)
      }
      const r = await client.query(
        `SELECT * FROM policy_evaluations WHERE artifact_id = $1 ORDER BY evaluated_at`,
        [artifactId],
      )
      return r.rows.map(mapEvaluation)
    },

    async listActivity(filter?: {
      publicOnly?: boolean
      tenantId?: string
    }) {
      const tenant = filter?.tenantId || defaultTenantId
      let sql = `SELECT * FROM activity_events`
      const params: unknown[] = []
      if (tenant) {
        sql += ` WHERE tenant_id = $1`
        params.push(tenant)
      }
      sql += ` ORDER BY occurred_at DESC`
      const rows = (await client.query(sql, params)).rows.map(mapActivity)
      return filterActivity(rows, {
        publicOnly: filter?.publicOnly,
        // already scoped in SQL when tenant present
      })
    },

    async appendActivity(event: ActivityEventV2) {
      const tenantId = requireTenant(event.tenantId, 'appendActivity')
      // Projection write — never invent source facts
      await client.query(
        `INSERT INTO activity_events (
           id, tenant_id, source, verification, artifact_id,
           what_happened, why_it_matters, securist_action,
           visibility, occurred_at, is_seed
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
         )
         ON CONFLICT (id) DO NOTHING`,
        [
          event.id,
          tenantId,
          event.source,
          event.verification,
          event.artifactId ?? null,
          event.whatHappened,
          event.whyItMatters,
          event.securistAction,
          event.visibility,
          event.occurredAt,
          event.isSeed,
        ],
      )
    },

    async appendEvidence(record: EvidenceRecord) {
      const tenantId = requireTenant(record.tenantId, 'appendEvidence')
      // Append-only: never UPDATE assertion rows
      await client.query(
        `INSERT INTO evidence_records (
           id, tenant_id, artifact_id, version_id, domain, assertion,
           source, observed_at, verification, content_hash,
           framework_hint, is_seed
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
         )
         ON CONFLICT (id) DO NOTHING`,
        [
          record.id,
          tenantId,
          record.artifactId,
          record.versionId ?? null,
          record.domain,
          record.assertion,
          record.source,
          record.observedAt,
          record.verification,
          record.contentHash,
          record.frameworkHint ?? null,
          record.isSeed,
        ],
      )
    },

    async consumeNonce(
      operatorId: string,
      nonce: string,
      maxAgeMs = 15 * 60 * 1000,
    ) {
      if (!operatorId || !nonce) return false
      // Purge expired nonces for this operator
      await client.query(
        `DELETE FROM operator_ingest_nonces
         WHERE operator_id = $1
           AND consumed_at < NOW() - ($2::double precision * INTERVAL '1 millisecond')`,
        [operatorId, maxAgeMs],
      )
      try {
        const r = await client.query(
          `INSERT INTO operator_ingest_nonces (operator_id, nonce, consumed_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (operator_id, nonce) DO NOTHING
           RETURNING nonce`,
          [operatorId, nonce],
        )
        return (r.rowCount ?? 0) > 0 || r.rows.length > 0
      } catch {
        return false
      }
    },
  }
}

function emptySnapshot(): DecisionGraphSnapshot {
  return {
    artifacts: [],
    versions: [],
    sources: [],
    evidence: [],
    policies: [],
    evaluations: [],
    decisions: [],
    validations: [],
    contributions: [],
    changes: [],
    activity: [],
    operators: [],
  }
}

/** Lazy pg Pool factory — only constructed when mode=postgres. */
export async function createPgPool(connectionString: string): Promise<SqlPool> {
  const { default: pg } = await import('pg')
  const config: PoolConfig = {
    connectionString,
    // Serverless-friendly defaults; override via pooler URL if needed
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  }
  const pool: Pool = new pg.Pool(config)
  return {
    query: async <T = Record<string, unknown>>(text: string, params?: unknown[]) => {
      const r = await pool.query(text, params)
      return { rows: r.rows as T[], rowCount: r.rowCount }
    },
    end: () => pool.end(),
  }
}

/** Ensure parent artifact is same-tenant before evidence/activity writes (tests use this). */
export async function assertArtifactTenant(
  client: SqlClient,
  artifactId: string,
  tenantId: string,
): Promise<Artifact | undefined> {
  const r = await client.query(
    `SELECT * FROM artifacts WHERE id = $1 AND tenant_id = $2`,
    [artifactId, tenantId],
  )
  return r.rows[0] ? mapArtifact(r.rows[0]) : undefined
}
