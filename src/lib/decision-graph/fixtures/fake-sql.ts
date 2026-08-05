/**
 * Minimal in-process SQL stand-in for Postgres adapter unit tests.
 * Implements only the subset of SQL used by postgres-store / postgres-outbox.
 * Schema shape matches migrations/001_decision_graph.sql (logical tables).
 */
import type { SqlClient, SqlQueryResult, SqlTxClient } from '../sql'

type Row = Record<string, unknown>

type Tables = {
  tenants: Row[]
  artifacts: Row[]
  artifact_versions: Row[]
  artifact_sources: Row[]
  evidence_records: Row[]
  policies: Row[]
  policy_evaluations: Row[]
  decisions: Row[]
  outbox_events: Row[]
  validation_runs: Row[]
  contribution_records: Row[]
  change_events: Row[]
  operator_agents: Row[]
  operator_ingest_nonces: Row[]
  activity_events: Row[]
}

function emptyTables(): Tables {
  return {
    tenants: [],
    artifacts: [],
    artifact_versions: [],
    artifact_sources: [],
    evidence_records: [],
    policies: [],
    policy_evaluations: [],
    decisions: [],
    outbox_events: [],
    validation_runs: [],
    contribution_records: [],
    change_events: [],
    operator_agents: [],
    operator_ingest_nonces: [],
    activity_events: [],
  }
}

export type FakeSql = SqlTxClient & {
  tables: Tables
  queries: { text: string; params?: unknown[] }[]
  /** When true, next withTransaction rolls back (reverts table snapshot) */
  failNextTransaction: boolean
}

export function createFakeSql(): FakeSql {
  const tables = emptyTables()
  const queries: { text: string; params?: unknown[] }[] = []

  const fake: FakeSql = {
    tables,
    queries,
    failNextTransaction: false,
    async withTransaction<T>(fn: (tx: SqlClient) => Promise<T>): Promise<T> {
      const snapshot = JSON.parse(JSON.stringify(tables)) as Tables
      try {
        const result = await fn(fake)
        if (fake.failNextTransaction) {
          fake.failNextTransaction = false
          // rollback
          for (const key of Object.keys(tables) as (keyof Tables)[]) {
            tables[key] = snapshot[key]
          }
          throw new Error('fake-sql: forced transaction failure')
        }
        return result
      } catch (err) {
        for (const key of Object.keys(tables) as (keyof Tables)[]) {
          tables[key] = snapshot[key]
        }
        throw err
      }
    },
    async query<T = Record<string, unknown>>(
      text: string,
      params: unknown[] = [],
    ): Promise<SqlQueryResult<T>> {
      queries.push({ text, params })
      const sql = text.replace(/\s+/g, ' ').trim()
      const lower = sql.toLowerCase()
      const asT = (rows: Row[]): SqlQueryResult<T> => ({
        rows: rows as T[],
        rowCount: rows.length,
      })

      // DELETE nonces (purge)
      if (lower.startsWith('delete from operator_ingest_nonces')) {
        // Keep simple: no-op purge for tests
        return asT([])
      }

      // SELECT id FROM artifacts WHERE id AND tenant
      if (
        lower.includes('from artifacts where id = $1 and tenant_id = $2')
      ) {
        return asT(
          tables.artifacts.filter(
            (r) => r.id === params[0] && r.tenant_id === params[1],
          ),
        )
      }

      // SELECT id FROM evidence_records WHERE id AND tenant
      if (
        lower.includes('from evidence_records where id = $1 and tenant_id = $2')
      ) {
        return asT(
          tables.evidence_records.filter(
            (r) => r.id === params[0] && r.tenant_id === params[1],
          ),
        )
      }

      // JOIN versions/sources by tenant
      if (
        lower.includes('from artifact_versions') &&
        lower.includes('tenant_id')
      ) {
        const tenant = params[0]
        const arts = new Set(
          tables.artifacts
            .filter((a) => a.tenant_id === tenant)
            .map((a) => String(a.id)),
        )
        return asT(
          tables.artifact_versions.filter((v) =>
            arts.has(String(v.artifact_id)),
          ),
        )
      }
      if (
        lower.includes('from artifact_sources') &&
        lower.includes('tenant_id')
      ) {
        const tenant = params[0]
        const arts = new Set(
          tables.artifacts
            .filter((a) => a.tenant_id === tenant)
            .map((a) => String(a.id)),
        )
        return asT(
          tables.artifact_sources.filter((s) =>
            arts.has(String(s.artifact_id)),
          ),
        )
      }

      // INSERT outbox
      if (lower.startsWith('insert into outbox_events')) {
        const id = String(params[0])
        if (tables.outbox_events.some((r) => r.id === id)) {
          if (lower.includes('on conflict (id) do update')) {
            const row = tables.outbox_events.find((r) => r.id === id)!
            row.dead_letter = true
            row.error_code = params[7]
          }
          return asT([])
        }
        tables.outbox_events.unshift({
          id: params[0],
          tenant_id: params[1],
          artifact_id: params[2],
          event_type: params[3],
          actor_type: params[4],
          payload_fingerprint: params[5],
          created_at: params[6],
          projected: false,
          dead_letter: lower.includes('true,$8') || params[7] === true,
          error_code: params[7] && typeof params[7] === 'string' ? params[7] : null,
        })
        return asT([{ id }])
      }

      // UPDATE outbox projected
      if (
        lower.startsWith('update outbox_events set projected = true')
      ) {
        const id = String(params[0])
        const row = tables.outbox_events.find((r) => r.id === id)
        if (row) row.projected = true
        return asT(row ? [row] : [])
      }

      // UPDATE outbox dead letter
      if (lower.startsWith('update outbox_events') && lower.includes('dead_letter')) {
        const id = String(params[0])
        const row = tables.outbox_events.find((r) => r.id === id)
        if (row) {
          row.dead_letter = true
          row.error_code = params[1]
        }
        return asT(row ? [row] : [])
      }

      // SELECT outbox pending
      if (
        lower.includes('from outbox_events') &&
        lower.includes('projected = false')
      ) {
        let rows = tables.outbox_events.filter(
          (r) => !r.projected && !r.dead_letter,
        )
        if (lower.includes('tenant_id = $1') && params[0]) {
          rows = rows.filter((r) => r.tenant_id === params[0])
        }
        return asT(rows)
      }

      if (
        lower.includes('from outbox_events') &&
        lower.includes('dead_letter = true')
      ) {
        return asT(
          tables.outbox_events
            .filter((r) => r.dead_letter)
            .slice(0, Number(params[0] || 50)),
        )
      }

      if (lower.includes('from outbox_events')) {
        const lim = Number(params[0] || 100)
        return asT(tables.outbox_events.slice(0, lim))
      }

      // INSERT evidence append-only
      if (lower.startsWith('insert into evidence_records')) {
        const id = String(params[0])
        if (tables.evidence_records.some((r) => r.id === id)) {
          return asT([])
        }
        tables.evidence_records.push({
          id: params[0],
          tenant_id: params[1],
          artifact_id: params[2],
          version_id: params[3],
          domain: params[4],
          assertion: params[5],
          source: params[6],
          observed_at: params[7],
          verification: params[8],
          content_hash: params[9],
          framework_hint: params[10],
          is_seed: params[11],
        })
        return asT([{ id }])
      }

      // INSERT activity projection
      if (lower.startsWith('insert into activity_events')) {
        const id = String(params[0])
        if (tables.activity_events.some((r) => r.id === id)) {
          return asT([])
        }
        tables.activity_events.unshift({
          id: params[0],
          tenant_id: params[1],
          source: params[2],
          verification: params[3],
          artifact_id: params[4],
          what_happened: params[5],
          why_it_matters: params[6],
          securist_action: params[7],
          visibility: params[8],
          occurred_at: params[9],
          is_seed: params[10],
        })
        return asT([{ id }])
      }

      // INSERT nonce
      if (lower.startsWith('insert into operator_ingest_nonces')) {
        const operatorId = String(params[0])
        const nonce = String(params[1])
        const exists = tables.operator_ingest_nonces.some(
          (r) => r.operator_id === operatorId && r.nonce === nonce,
        )
        if (exists) return asT([])
        tables.operator_ingest_nonces.push({
          operator_id: operatorId,
          nonce,
          consumed_at: new Date().toISOString(),
        })
        return asT([{ nonce }])
      }

      // SELECT artifacts by tenant
      if (lower.includes('from artifacts where tenant_id = $1')) {
        return asT(tables.artifacts.filter((r) => r.tenant_id === params[0]))
      }

      if (
        lower.includes('from artifacts where id = $1 and tenant_id = $2')
      ) {
        return asT(
          tables.artifacts.filter(
            (r) => r.id === params[0] && r.tenant_id === params[1],
          ),
        )
      }

      if (lower.includes('from artifacts where id = $1')) {
        return asT(tables.artifacts.filter((r) => r.id === params[0]))
      }

      if (lower.includes('from artifacts')) {
        return asT(tables.artifacts)
      }

      // evidence by artifact + tenant
      if (
        lower.includes('from evidence_records') &&
        lower.includes('artifact_id = $1 and tenant_id = $2')
      ) {
        return asT(
          tables.evidence_records.filter(
            (r) => r.artifact_id === params[0] && r.tenant_id === params[1],
          ),
        )
      }

      if (
        lower.includes('from evidence_records') &&
        lower.includes('tenant_id = $1')
      ) {
        return asT(
          tables.evidence_records.filter((r) => r.tenant_id === params[0]),
        )
      }

      if (lower.includes('from evidence_records where artifact_id = $1')) {
        return asT(
          tables.evidence_records.filter((r) => r.artifact_id === params[0]),
        )
      }

      if (lower.includes('from evidence_records')) {
        return asT(tables.evidence_records)
      }

      // activity tenant
      if (lower.includes('from activity_events where tenant_id = $1')) {
        return asT(
          tables.activity_events.filter((r) => r.tenant_id === params[0]),
        )
      }

      if (lower.includes('from activity_events')) {
        return asT(tables.activity_events)
      }

      // child tables by ANY artifact ids
      if (lower.includes('from artifact_versions')) {
        const ids = Array.isArray(params[0]) ? (params[0] as string[]) : []
        return asT(
          tables.artifact_versions.filter((r) =>
            ids.includes(String(r.artifact_id)),
          ),
        )
      }
      if (lower.includes('from artifact_sources')) {
        const ids = Array.isArray(params[0]) ? (params[0] as string[]) : []
        return asT(
          tables.artifact_sources.filter((r) =>
            ids.includes(String(r.artifact_id)),
          ),
        )
      }

      if (lower.includes('from policies')) return asT(tables.policies)

      if (
        lower.includes('from policy_evaluations') &&
        lower.includes('tenant_id = $1')
      ) {
        return asT(
          tables.policy_evaluations.filter((r) => r.tenant_id === params[0]),
        )
      }
      if (lower.includes('from policy_evaluations')) {
        return asT(tables.policy_evaluations)
      }

      if (lower.includes('from decisions') && lower.includes('tenant_id = $1')) {
        return asT(tables.decisions.filter((r) => r.tenant_id === params[0]))
      }
      if (lower.includes('from decisions')) return asT(tables.decisions)

      if (
        lower.includes('from validation_runs') &&
        lower.includes('tenant_id = $1')
      ) {
        return asT(
          tables.validation_runs.filter((r) => r.tenant_id === params[0]),
        )
      }
      if (lower.includes('from validation_runs')) {
        return asT(tables.validation_runs)
      }

      if (
        lower.includes('from contribution_records') &&
        lower.includes('tenant_id = $1')
      ) {
        return asT(
          tables.contribution_records.filter((r) => r.tenant_id === params[0]),
        )
      }
      if (lower.includes('from contribution_records')) {
        return asT(tables.contribution_records)
      }

      if (
        lower.includes('from change_events') &&
        lower.includes('tenant_id = $1')
      ) {
        return asT(
          tables.change_events.filter((r) => r.tenant_id === params[0]),
        )
      }
      if (lower.includes('from change_events')) {
        return asT(tables.change_events)
      }

      if (
        lower.includes('from operator_agents') &&
        lower.includes('tenant_id = $1')
      ) {
        return asT(
          tables.operator_agents.filter((r) => r.tenant_id === params[0]),
        )
      }
      if (lower.includes('from operator_agents')) {
        return asT(tables.operator_agents)
      }

      throw new Error(`fake-sql: unhandled query: ${sql.slice(0, 120)}`)
    },
  }

  return fake
}

/** Seed two tenants for isolation tests. */
export function seedTwoTenants(fake: FakeSql): void {
  const now = new Date().toISOString()
  fake.tables.tenants.push(
    { id: 'tenant-a', name: 'A', created_at: now },
    { id: 'tenant-b', name: 'B', created_at: now },
  )
  fake.tables.artifacts.push(
    {
      id: 'art-a1',
      tenant_id: 'tenant-a',
      kind: 'repo',
      name: 'pkg-a',
      purpose: 'Tenant A artifact',
      recommended_boundary: 'dev',
      domains: ['appsec'],
      canonical_url: 'https://example.com/a',
      provider: 'github',
      status: 'watching',
      review_owner: 'owner-a',
      next_review_at: null,
      is_seed: false,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'art-b1',
      tenant_id: 'tenant-b',
      kind: 'repo',
      name: 'pkg-b',
      purpose: 'Tenant B artifact',
      recommended_boundary: 'dev',
      domains: ['appsec'],
      canonical_url: 'https://example.com/b',
      provider: 'github',
      status: 'approved',
      review_owner: 'owner-b',
      next_review_at: null,
      is_seed: false,
      created_at: now,
      updated_at: now,
    },
  )
  fake.tables.evidence_records.push(
    {
      id: 'ev-a1',
      tenant_id: 'tenant-a',
      artifact_id: 'art-a1',
      version_id: null,
      domain: 'license',
      assertion: 'MIT (tenant A only)',
      source: 'test',
      observed_at: now,
      verification: 'verified',
      content_hash: 'ha',
      framework_hint: null,
      is_seed: false,
    },
    {
      id: 'ev-b1',
      tenant_id: 'tenant-b',
      artifact_id: 'art-b1',
      version_id: null,
      domain: 'license',
      assertion: 'Apache-2.0 (tenant B only)',
      source: 'test',
      observed_at: now,
      verification: 'verified',
      content_hash: 'hb',
      framework_hint: null,
      is_seed: false,
    },
  )
  fake.tables.activity_events.push(
    {
      id: 'act-a1',
      tenant_id: 'tenant-a',
      source: 'decision',
      verification: 'human_reviewed',
      artifact_id: 'art-a1',
      what_happened: 'A activity',
      why_it_matters: 'tenant a',
      securist_action: 'none',
      visibility: 'public',
      occurred_at: now,
      is_seed: false,
    },
    {
      id: 'act-b1',
      tenant_id: 'tenant-b',
      source: 'decision',
      verification: 'human_reviewed',
      artifact_id: 'art-b1',
      what_happened: 'B activity',
      why_it_matters: 'tenant b',
      securist_action: 'none',
      visibility: 'public',
      occurred_at: now,
      is_seed: false,
    },
  )
}
