/**
 * Minimal SQL client surface for the Postgres Decision Graph adapter.
 * Production: node-postgres Pool. Tests: injectable fake.
 */
export type SqlQueryResult<T = Record<string, unknown>> = {
  rows: T[]
  rowCount: number | null
}

export type SqlClient = {
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<SqlQueryResult<T>>
}

export type SqlPool = SqlClient & {
  end?(): Promise<void>
}
