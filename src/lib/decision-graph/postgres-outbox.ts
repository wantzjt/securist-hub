/**
 * Durable outbox — migrations/001_decision_graph.sql `outbox_events`.
 * Prefer store-level transactional append (see postgres-store) for mutations.
 * This port is for projector/replay tooling and standalone outbox ops.
 */
import type { SqlClient } from './sql'
import type { OutboxEvent, OutboxPort } from './outbox-types'

export function createPostgresOutbox(client: SqlClient): OutboxPort {
  return {
    async append(event) {
      const row: OutboxEvent = {
        ...event,
        createdAt: event.createdAt || new Date().toISOString(),
        projected: false,
      }
      await insertOutboxRow(client, row)
      return row
    },

    async markProjected(id: string) {
      await client.query(
        `UPDATE outbox_events SET projected = TRUE WHERE id = $1`,
        [id],
      )
    },

    async sendToDeadLetter(event: OutboxEvent, errorCode: string) {
      await client.query(
        `INSERT INTO outbox_events (
           id, tenant_id, artifact_id, event_type, actor_type,
           payload_fingerprint, created_at, projected, dead_letter, error_code
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,FALSE,TRUE,$8
         )
         ON CONFLICT (id) DO UPDATE SET
           dead_letter = TRUE,
           error_code = EXCLUDED.error_code,
           projected = FALSE`,
        [
          event.id,
          event.tenantId,
          event.artifactId ?? null,
          event.eventType,
          event.actorType,
          event.payloadFingerprint,
          event.createdAt || new Date().toISOString(),
          errorCode,
        ],
      )
    },

    async list(limit = 100) {
      const r = await client.query(
        `SELECT * FROM outbox_events ORDER BY created_at DESC LIMIT $1`,
        [limit],
      )
      return r.rows.map(mapOutboxRow)
    },

    async listDeadLetter(limit = 50) {
      const r = await client.query(
        `SELECT * FROM outbox_events
         WHERE dead_letter = TRUE
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit],
      )
      return r.rows.map(mapOutboxRow)
    },

    async pendingProjections(tenantId?: string) {
      if (tenantId) {
        const r = await client.query(
          `SELECT * FROM outbox_events
           WHERE projected = FALSE AND dead_letter = FALSE AND tenant_id = $1
           ORDER BY created_at ASC`,
          [tenantId],
        )
        return r.rows.map(mapOutboxRow)
      }
      const r = await client.query(
        `SELECT * FROM outbox_events
         WHERE projected = FALSE AND dead_letter = FALSE
         ORDER BY created_at ASC`,
      )
      return r.rows.map(mapOutboxRow)
    },
  }
}

/** Insert outbox row inside an existing transaction client. */
export async function insertOutboxRow(
  client: SqlClient,
  row: OutboxEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO outbox_events (
       id, tenant_id, artifact_id, event_type, actor_type,
       payload_fingerprint, created_at, projected, dead_letter, error_code
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,FALSE,FALSE,NULL
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      row.id,
      row.tenantId,
      row.artifactId ?? null,
      row.eventType,
      row.actorType,
      row.payloadFingerprint,
      row.createdAt,
    ],
  )
}

export function mapOutboxRow(row: Record<string, unknown>): OutboxEvent {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    artifactId: row.artifact_id ? String(row.artifact_id) : undefined,
    eventType: String(row.event_type),
    actorType: row.actor_type as OutboxEvent['actorType'],
    payloadFingerprint: String(row.payload_fingerprint),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    projected: Boolean(row.projected),
    deadLetter: Boolean(row.dead_letter) || undefined,
    errorCode: row.error_code ? String(row.error_code) : undefined,
  }
}
