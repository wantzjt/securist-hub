/**
 * Decision Graph store configuration.
 *
 * Modes:
 * - memory | seed — process-local seed snapshot (local/demo only; always isSeed-labeled)
 * - postgres      — durable facts via migrations/001_decision_graph.sql
 *
 * Production path: SECURIST_GRAPH_STORE=postgres + DATABASE_URL (or
 * SECURIST_DATABASE_URL) + SECURIST_DEFAULT_TENANT_ID. Missing connection
 * string or default tenant fails at config resolve (before serving requests).
 */

export type GraphStoreMode = 'memory' | 'seed' | 'postgres'

export type DecisionGraphConfig = {
  mode: GraphStoreMode
  /** Present only when mode === 'postgres' and validation passed */
  databaseUrl?: string
  /** Explicit demo/seed labeling for ops surfaces */
  isSeedMode: boolean
  /**
   * Default tenant for Postgres read paths when callers omit tenantId.
   * **Required** in postgres mode (current public surfaces do not pass tenant).
   * From SECURIST_DEFAULT_TENANT_ID. Writes still require explicit tenantId.
   */
  defaultTenantId?: string
}

export class DecisionGraphConfigError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'DecisionGraphConfigError'
    this.code = code
  }
}

function normalizeMode(raw: string | undefined): GraphStoreMode {
  const v = (raw || 'memory').trim().toLowerCase()
  if (v === 'memory' || v === 'seed' || v === 'postgres') return v
  throw new DecisionGraphConfigError(
    'invalid_store_mode',
    `SECURIST_GRAPH_STORE must be memory|seed|postgres (got "${raw}")`,
  )
}

/**
 * Resolve store config from environment.
 * Does not open a database connection.
 */
export function resolveDecisionGraphConfig(
  env: NodeJS.ProcessEnv = process.env,
): DecisionGraphConfig {
  const mode = normalizeMode(env.SECURIST_GRAPH_STORE)
  const isSeedMode = mode === 'memory' || mode === 'seed'

  const defaultTenantId = (env.SECURIST_DEFAULT_TENANT_ID || '').trim() || undefined

  if (mode !== 'postgres') {
    return { mode, isSeedMode, defaultTenantId }
  }

  const databaseUrl = (
    env.DATABASE_URL ||
    env.SECURIST_DATABASE_URL ||
    ''
  ).trim()

  if (!databaseUrl) {
    throw new DecisionGraphConfigError(
      'missing_database_url',
      [
        'SECURIST_GRAPH_STORE=postgres requires a connection string.',
        'Set DATABASE_URL (preferred) or SECURIST_DATABASE_URL.',
        'Run migrations/001_decision_graph.sql before switching production.',
        'Do not use memory/seed modes in production durable path.',
        'Bootstrap: leave SECURIST_GRAPH_STORE unset (memory/seed) for local demo.',
      ].join(' '),
    )
  }

  // Public server functions read without an explicit tenant; require a default
  // at startup so requests do not fail mid-flight with tenant_scope.
  if (!defaultTenantId) {
    throw new DecisionGraphConfigError(
      'missing_default_tenant_id',
      [
        'SECURIST_GRAPH_STORE=postgres requires SECURIST_DEFAULT_TENANT_ID.',
        'Current public Securist surfaces call the store without a per-request tenant.',
        'Set SECURIST_DEFAULT_TENANT_ID (e.g. public-demo) before serving requests.',
        'Writes still require an explicit tenantId on each record/event.',
      ].join(' '),
    )
  }

  return {
    mode: 'postgres',
    databaseUrl,
    isSeedMode: false,
    defaultTenantId,
  }
}

/** True when current env is explicitly seed/demo (not durable). */
export function isSeedGraphMode(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  try {
    return resolveDecisionGraphConfig(env).isSeedMode
  } catch {
    return true
  }
}
