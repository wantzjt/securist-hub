/**
 * Postgres Decision Graph store — migrations/001_decision_graph.sql only.
 *
 * Repairs vs sketch PR #2:
 * - Tenant-scoped reads (explicit tenant or defaultTenantId; no cross-tenant leak)
 * - Tenant-scoped writes + parent artifact same-tenant check
 * - Transactional outbox: evidence/activity + outbox_events in one transaction
 * - Append-only evidence (INSERT … ON CONFLICT DO NOTHING)
 *
 * Does not enable Eve, remote models, daemon flags, or external writes.
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
import { insertOutboxRow } from './postgres-outbox'
import type { SqlClient, SqlPool, SqlTxClient } from './sql'
import type { DecisionGraphStore } from './store-types'
import type {
  ActivityEventV2,
  Artifact,
  DecisionGraphSnapshot,
  EvidenceRecord,
} from './types'
import { contentHash } from './hash'

export type PostgresStoreOptions = {
  client: SqlTxClient
  /**
   * Default tenant for read paths when caller omits tenantId
   * (e.g. public-demo). Writes still require event/record.tenantId.
   */
  defaultTenantId?: string
}

export class TenantScopeError extends Error {
  readonly code = 'tenant_scope'

  constructor(message: string) {
    super(message)
    this.name = 'TenantScopeError'
  }
}

function requireTenant(tenantId: string | undefined, op: string): string {
  const t = (tenantId || '').trim()
  if (!t) {
    throw new TenantScopeError(
      `tenant-before-persist: ${op} requires a non-empty tenantId`,
    )
  }
  return t
}

function resolveReadTenant(
  tenantId: string | undefined,
  defaultTenantId: string | undefined,
  op: string,
): string {
  const t = (tenantId || defaultTenantId || '').trim()
  if (!t) {
    throw new TenantScopeError(
      `tenant-scoped read: ${op} requires tenantId or defaultTenantId`,
    )
  }
  return t
}

export function createPostgresStore(
  options: PostgresStoreOptions,
): DecisionGraphStore {
  const { client, defaultTenantId } = options

  async function loadSnapshot(tenantId?: string): Promise<DecisionGraphSnapshot> {
    const tenant = resolveReadTenant(tenantId, defaultTenantId, 'getSnapshot')

    const artifacts = (
      await client.query(
        `SELECT * FROM artifacts WHERE tenant_id = $1 ORDER BY created_at`,
        [tenant],
      )
    ).rows.map(mapArtifact)
    const artifactIds = artifacts.map((a) => a.id)

    if (artifactIds.length === 0) return emptySnapshot()

    const versions = (
      await client.query(
        `SELECT v.* FROM artifact_versions v
         INNER JOIN artifacts a ON a.id = v.artifact_id
         WHERE a.tenant_id = $1`,
        [tenant],
      )
    ).rows.map(mapVersion)

    const sources = (
      await client.query(
        `SELECT s.* FROM artifact_sources s
         INNER JOIN artifacts a ON a.id = s.artifact_id
         WHERE a.tenant_id = $1`,
        [tenant],
      )
    ).rows.map(mapSource)

    const evidence = (
      await client.query(
        `SELECT * FROM evidence_records WHERE tenant_id = $1 ORDER BY observed_at`,
        [tenant],
      )
    ).rows.map(mapEvidence)

    const policies = (await client.query(`SELECT * FROM policies`)).rows.map(
      mapPolicy,
    )

    const evaluations = (
      await client.query(
        `SELECT * FROM policy_evaluations WHERE tenant_id = $1 ORDER BY evaluated_at`,
        [tenant],
      )
    ).rows.map(mapEvaluation)

    const decisions = (
      await client.query(
        `SELECT * FROM decisions WHERE tenant_id = $1 ORDER BY decided_at`,
        [tenant],
      )
    ).rows.map(mapDecision)

    const validations = (
      await client.query(
        `SELECT * FROM validation_runs WHERE tenant_id = $1 ORDER BY ran_at`,
        [tenant],
      )
    ).rows.map(mapValidation)

    const contributions = (
      await client.query(
        `SELECT * FROM contribution_records WHERE tenant_id = $1 ORDER BY created_at`,
        [tenant],
      )
    ).rows.map(mapContribution)

    const changes = (
      await client.query(
        `SELECT * FROM change_events WHERE tenant_id = $1 ORDER BY occurred_at`,
        [tenant],
      )
    ).rows.map(mapChange)

    const activity = (
      await client.query(
        `SELECT * FROM activity_events WHERE tenant_id = $1 ORDER BY occurred_at DESC`,
        [tenant],
      )
    ).rows.map(mapActivity)

    const operators = (
      await client.query(
        `SELECT * FROM operator_agents WHERE tenant_id = $1`,
        [tenant],
      )
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

  async function assertArtifactInTenant(
    tx: SqlClient,
    artifactId: string,
    tenantId: string,
  ): Promise<void> {
    const r = await tx.query(
      `SELECT id FROM artifacts WHERE id = $1 AND tenant_id = $2`,
      [artifactId, tenantId],
    )
    if (!r.rows[0]) {
      throw new TenantScopeError(
        `tenant-scope: artifact ${artifactId} not found for tenant ${tenantId}`,
      )
    }
  }

  return {
    async getSnapshot(tenantId?: string) {
      return loadSnapshot(tenantId)
    },

    async getArtifact(id: string, tenantId?: string) {
      const tenant = resolveReadTenant(tenantId, defaultTenantId, 'getArtifact')
      const r = await client.query(
        `SELECT * FROM artifacts WHERE id = $1 AND tenant_id = $2`,
        [id, tenant],
      )
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
      const tenant = resolveReadTenant(tenantId, defaultTenantId, 'listEvidence')
      const r = await client.query(
        `SELECT * FROM evidence_records
         WHERE artifact_id = $1 AND tenant_id = $2
         ORDER BY observed_at`,
        [artifactId, tenant],
      )
      return r.rows.map(mapEvidence)
    },

    async listEvaluations(artifactId: string, tenantId?: string) {
      const tenant = resolveReadTenant(
        tenantId,
        defaultTenantId,
        'listEvaluations',
      )
      const r = await client.query(
        `SELECT * FROM policy_evaluations
         WHERE artifact_id = $1 AND tenant_id = $2
         ORDER BY evaluated_at`,
        [artifactId, tenant],
      )
      return r.rows.map(mapEvaluation)
    },

    async listActivity(filter?: { publicOnly?: boolean; tenantId?: string }) {
      const tenant = resolveReadTenant(
        filter?.tenantId,
        defaultTenantId,
        'listActivity',
      )
      const r = await client.query(
        `SELECT * FROM activity_events WHERE tenant_id = $1 ORDER BY occurred_at DESC`,
        [tenant],
      )
      return filterActivity(r.rows.map(mapActivity), {
        publicOnly: filter?.publicOnly,
      })
    },

    async appendActivity(event: ActivityEventV2) {
      const tenantId = requireTenant(event.tenantId, 'appendActivity')
      await client.withTransaction(async (tx) => {
        if (event.artifactId) {
          await assertArtifactInTenant(tx, event.artifactId, tenantId)
        }
        await tx.query(
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
        // Projection path still emits outbox so projectors stay coherent
        await insertOutboxRow(tx, {
          id: `ob-act-${event.id}`,
          tenantId,
          artifactId: event.artifactId,
          eventType: 'activity.projected',
          actorType: 'system',
          payloadFingerprint: contentHash(event.id + event.whatHappened),
          createdAt: event.occurredAt || new Date().toISOString(),
          projected: false,
        })
      })
    },

    async appendEvidence(record: EvidenceRecord) {
      const tenantId = requireTenant(record.tenantId, 'appendEvidence')
      await client.withTransaction(async (tx) => {
        await assertArtifactInTenant(tx, record.artifactId, tenantId)
        const existing = await tx.query(
          `SELECT id FROM evidence_records WHERE id = $1 AND tenant_id = $2`,
          [record.id, tenantId],
        )
        if (existing.rows[0]) return // append-only idempotent

        await tx.query(
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
        await insertOutboxRow(tx, {
          id: `ob-ev-${record.id}`,
          tenantId,
          artifactId: record.artifactId,
          eventType: 'evidence.appended',
          actorType: 'system',
          payloadFingerprint: record.contentHash,
          createdAt: record.observedAt || new Date().toISOString(),
          projected: false,
        })
      })
    },

    async consumeNonce(
      operatorId: string,
      nonce: string,
      maxAgeMs = 15 * 60 * 1000,
    ) {
      if (!operatorId || !nonce) return false
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

/** Lazy pg Pool with transaction support — only when mode=postgres. */
export async function createPgPool(connectionString: string): Promise<SqlPool> {
  const { default: pg } = await import('pg')
  const config: PoolConfig = {
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  }
  const pool: Pool = new pg.Pool(config)

  const query: SqlClient['query'] = async <T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ) => {
    const r = await pool.query(text, params)
    return { rows: r.rows as T[], rowCount: r.rowCount }
  }

  return {
    query,
    async withTransaction<T>(fn: (tx: SqlClient) => Promise<T>): Promise<T> {
      const conn = await pool.connect()
      try {
        await conn.query('BEGIN')
        const tx: SqlClient = {
          query: async <TRow = Record<string, unknown>>(
            text: string,
            params?: unknown[],
          ) => {
            const r = await conn.query(text, params)
            return { rows: r.rows as TRow[], rowCount: r.rowCount }
          },
        }
        const result = await fn(tx)
        await conn.query('COMMIT')
        return result
      } catch (err) {
        try {
          await conn.query('ROLLBACK')
        } catch {
          /* ignore rollback errors */
        }
        throw err
      } finally {
        conn.release()
      }
    },
    end: () => pool.end(),
  }
}

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
