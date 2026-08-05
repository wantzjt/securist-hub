/**
 * Outbox / event table — durable facts first, Activity projection second.
 * Default: process-memory port (local/demo).
 * Production: postgres via createPostgresOutbox + transactional store writes.
 */
import type {
  OutboxActorType,
  OutboxEvent,
  OutboxPort,
} from './outbox-types'

export type { OutboxActorType, OutboxEvent, OutboxPort }

type MemoryState = {
  outbox: OutboxEvent[]
  deadLetter: OutboxEvent[]
}

function createMemoryState(): MemoryState {
  return { outbox: [], deadLetter: [] }
}

export function createMemoryOutbox(
  state: MemoryState = createMemoryState(),
): OutboxPort {
  return {
    async append(event) {
      const row: OutboxEvent = {
        ...event,
        createdAt: event.createdAt || new Date().toISOString(),
        projected: false,
      }
      state.outbox.unshift(row)
      return row
    },
    async markProjected(id: string) {
      const row = state.outbox.find((e) => e.id === id)
      if (row) row.projected = true
    },
    async sendToDeadLetter(event: OutboxEvent, errorCode: string) {
      const marked = { ...event, deadLetter: true, errorCode }
      state.deadLetter.unshift(marked)
      const idx = state.outbox.findIndex((e) => e.id === event.id)
      if (idx >= 0) state.outbox[idx] = marked
    },
    async list(limit = 100) {
      return state.outbox.slice(0, limit)
    },
    async listDeadLetter(limit = 50) {
      return state.deadLetter.slice(0, limit)
    },
    async pendingProjections(tenantId?: string) {
      return state.outbox.filter(
        (e) =>
          !e.projected &&
          !e.deadLetter &&
          (!tenantId || e.tenantId === tenantId),
      )
    },
  }
}

let memoryState = createMemoryState()
let memoryPort: OutboxPort = createMemoryOutbox(memoryState)
let activeOutbox: OutboxPort = memoryPort
let usingMemory = true

export function getOutbox(): OutboxPort {
  return activeOutbox
}

export function setOutbox(port: OutboxPort): void {
  activeOutbox = port
  usingMemory = false
}

export function resetOutboxForTests(): void {
  memoryState = createMemoryState()
  memoryPort = createMemoryOutbox(memoryState)
  activeOutbox = memoryPort
  usingMemory = true
}

/** Sync helpers for lifecycle fixture (memory path). */
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
  if (usingMemory) {
    memoryState.outbox.unshift(row)
    return row
  }
  void activeOutbox.append(event)
  return row
}

export function markProjected(id: string): void {
  if (usingMemory) {
    const row = memoryState.outbox.find((e) => e.id === id)
    if (row) row.projected = true
    return
  }
  void activeOutbox.markProjected(id)
}

export function sendToDeadLetter(
  event: OutboxEvent,
  errorCode: string,
): void {
  if (usingMemory) {
    const marked = { ...event, deadLetter: true, errorCode }
    memoryState.deadLetter.unshift(marked)
    const idx = memoryState.outbox.findIndex((e) => e.id === event.id)
    if (idx >= 0) memoryState.outbox[idx] = marked
    return
  }
  void activeOutbox.sendToDeadLetter(event, errorCode)
}

export function listOutbox(limit = 100): OutboxEvent[] {
  if (usingMemory) return memoryState.outbox.slice(0, limit)
  return []
}

export function listDeadLetter(limit = 50): OutboxEvent[] {
  if (usingMemory) return memoryState.deadLetter.slice(0, limit)
  return []
}

export function pendingProjections(): OutboxEvent[] {
  if (usingMemory) {
    return memoryState.outbox.filter((e) => !e.projected && !e.deadLetter)
  }
  return []
}
