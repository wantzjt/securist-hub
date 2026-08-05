/**
 * Outbox / event table — durable facts first, Activity projection second.
 * Prevents Activity from drifting into an independent ledger.
 */
export type OutboxActorType =
  | 'scout'
  | 'eve'
  | 'operator'
  | 'policy'
  | 'human'
  | 'system'

export type OutboxEvent = {
  id: string
  tenantId: string
  artifactId?: string
  eventType: string
  actorType: OutboxActorType
  payloadFingerprint: string
  createdAt: string
  /** false until Activity projector consumes */
  projected: boolean
  deadLetter?: boolean
  errorCode?: string
}

const outbox: OutboxEvent[] = []
const deadLetter: OutboxEvent[] = []

export function appendOutbox(
  event: Omit<OutboxEvent, 'projected' | 'createdAt'> & {
    createdAt?: string
  },
): OutboxEvent {
  const row: OutboxEvent = {
    ...event,
    createdAt: event.createdAt || new Date().toISOString(),
    projected: false,
  }
  outbox.unshift(row)
  return row
}

export function markProjected(id: string): void {
  const row = outbox.find((e) => e.id === id)
  if (row) row.projected = true
}

export function sendToDeadLetter(
  event: OutboxEvent,
  errorCode: string,
): void {
  deadLetter.unshift({ ...event, deadLetter: true, errorCode })
}

export function listOutbox(limit = 100): OutboxEvent[] {
  return outbox.slice(0, limit)
}

export function listDeadLetter(limit = 50): OutboxEvent[] {
  return deadLetter.slice(0, limit)
}

export function pendingProjections(): OutboxEvent[] {
  return outbox.filter((e) => !e.projected && !e.deadLetter)
}
