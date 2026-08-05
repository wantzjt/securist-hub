/**
 * Minimal SQL client surface for the Postgres Decision Graph adapter.
 * Production: node-postgres Pool. Tests: injectable fake.
 * Supports withTransaction for graph write + outbox atomicity.
 */
export type SqlQueryResult<T = Record<string, unknown>> = {
  rows: T[]
  rowCount: number | null
}

export type SqlClient = {
  query: <T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ) => Promise<SqlQueryResult<T>>
}

/** Client that can run a unit of work in one transaction. */
export type SqlTxClient = SqlClient & {
  withTransaction: <T>(fn: (tx: SqlClient) => Promise<T>) => Promise<T>
}

export type SqlPool = SqlTxClient & {
  end?: () => Promise<void>
}
