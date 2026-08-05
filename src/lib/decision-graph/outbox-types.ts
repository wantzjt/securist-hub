/**
 * Outbox contracts — durable facts first, Activity projection second.
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

export type OutboxPort = {
  append(
    event: Omit<OutboxEvent, 'projected' | 'createdAt'> & {
      createdAt?: string
    },
  ): Promise<OutboxEvent>
  markProjected(id: string): Promise<void>
  sendToDeadLetter(event: OutboxEvent, errorCode: string): Promise<void>
  list(limit?: number): Promise<OutboxEvent[]>
  listDeadLetter(limit?: number): Promise<OutboxEvent[]>
  pendingProjections(tenantId?: string): Promise<OutboxEvent[]>
}
