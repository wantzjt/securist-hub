/**
 * Decision Graph persistence adapter factory.
 *
 * Default: process memory + seed snapshot (local/demo only).
 * Production: SECURIST_GRAPH_STORE=postgres + DATABASE_URL → Postgres adapter
 *             (migrations/001_decision_graph.sql). Memory is not replaced as default.
 *
 * Does not enable Eve, remote models, daemon ingest flags, or external writes.
 */
import { resolveDecisionGraphConfig } from './config'
import { buildSeedSnapshot } from './seed'
import { buildProfile, filterActivity } from './profile'
import { createPostgresStore, createPgPool } from './postgres-store'
import { createPostgresOutbox } from './postgres-outbox'
import { setOutbox, resetOutboxForTests } from './outbox'
import type { DecisionGraphStore } from './store-types'
import type {
  ActivityEventV2,
  DecisionGraphSnapshot,
  EvidenceRecord,
} from './types'

export type { DecisionGraphStore } from './store-types'
export {
  resolveDecisionGraphConfig,
  DecisionGraphConfigError,
  isSeedGraphMode,
  type DecisionGraphConfig,
  type GraphStoreMode,
} from './config'

function createMemoryStore(
  seed: DecisionGraphSnapshot = buildSeedSnapshot(),
): DecisionGraphStore {
  let snap = seed
  const nonces = new Map<string, number>()

  return {
    async getSnapshot(tenantId?: string) {
      if (!tenantId) return snap
      return filterSnapshotByTenant(snap, tenantId)
    },
    async getArtifact(id, tenantId) {
      const a = snap.artifacts.find((x) => x.id === id)
      if (!a) return undefined
      if (tenantId && a.tenantId !== tenantId) return undefined
      return a
    },
    async getProfile(id, tenantId) {
      const scoped = tenantId ? filterSnapshotByTenant(snap, tenantId) : snap
      return buildProfile(scoped, id)
    },
    async listArtifacts(tenantId) {
      if (!tenantId) return snap.artifacts
      return snap.artifacts.filter((a) => a.tenantId === tenantId)
    },
    async listEvidence(artifactId, tenantId) {
      return snap.evidence.filter(
        (e) =>
          e.artifactId === artifactId &&
          (!tenantId || e.tenantId === tenantId),
      )
    },
    async listEvaluations(artifactId, tenantId) {
      return snap.evaluations.filter(
        (e) =>
          e.artifactId === artifactId &&
          (!tenantId || e.tenantId === tenantId),
      )
    },
    async listActivity(filter) {
      return filterActivity(snap.activity, filter)
    },
    async appendActivity(event: ActivityEventV2) {
      if (!event.tenantId?.trim()) {
        throw new Error(
          'tenant-before-persist: appendActivity requires a non-empty tenantId',
        )
      }
      snap = { ...snap, activity: [event, ...snap.activity] }
    },
    async appendEvidence(record: EvidenceRecord) {
      if (!record.tenantId?.trim()) {
        throw new Error(
          'tenant-before-persist: appendEvidence requires a non-empty tenantId',
        )
      }
      // append-only: never replace existing by id
      if (snap.evidence.some((e) => e.id === record.id)) return
      snap = { ...snap, evidence: [...snap.evidence, record] }
    },
    async consumeNonce(operatorId, nonce, maxAgeMs = 15 * 60 * 1000) {
      const key = `${operatorId}:${nonce}`
      const now = Date.now()
      for (const [k, t] of nonces) {
        if (now - t > maxAgeMs) nonces.delete(k)
      }
      if (nonces.has(key)) return false
      nonces.set(key, now)
      return true
    },
  }
}

function filterSnapshotByTenant(
  snap: DecisionGraphSnapshot,
  tenantId: string,
): DecisionGraphSnapshot {
  const artifacts = snap.artifacts.filter((a) => a.tenantId === tenantId)
  const ids = new Set(artifacts.map((a) => a.id))
  return {
    artifacts,
    versions: snap.versions.filter((v) => ids.has(v.artifactId)),
    sources: snap.sources.filter((s) => ids.has(s.artifactId)),
    evidence: snap.evidence.filter((e) => e.tenantId === tenantId),
    policies: snap.policies,
    evaluations: snap.evaluations.filter((e) => e.tenantId === tenantId),
    decisions: snap.decisions.filter((d) => d.tenantId === tenantId),
    validations: snap.validations.filter((v) => v.tenantId === tenantId),
    contributions: snap.contributions.filter((c) => c.tenantId === tenantId),
    changes: snap.changes.filter((c) => c.tenantId === tenantId),
    activity: snap.activity.filter((a) => a.tenantId === tenantId),
    operators: snap.operators.filter((o) => o.tenantId === tenantId),
  }
}

/** Process-local singleton. Default remains memory/seed. */
let store: DecisionGraphStore | undefined
let storeMode: string | undefined
let initPromise: Promise<DecisionGraphStore> | undefined

/**
 * Resolve store from env. Safe to call repeatedly.
 * Throws DecisionGraphConfigError when postgres mode lacks DATABASE_URL.
 */
export async function getDecisionGraphStore(): Promise<DecisionGraphStore> {
  if (store) return store
  if (initPromise) return initPromise

  initPromise = (async () => {
    const config = resolveDecisionGraphConfig()
    storeMode = config.mode

    if (config.mode === 'postgres') {
      const pool = await createPgPool(config.databaseUrl!)
      store = createPostgresStore({ client: pool })
      setOutbox(createPostgresOutbox(pool))
      return store
    }

    // memory | seed — explicitly demo; seed snapshot always isSeed-labeled
    store = createMemoryStore(buildSeedSnapshot())
    resetOutboxForTests()
    return store
  })()

  try {
    return await initPromise
  } catch (err) {
    initPromise = undefined
    store = undefined
    throw err
  }
}

/** Sync access after warm init — prefer getDecisionGraphStore(). */
export function getDecisionGraphStoreSync(): DecisionGraphStore {
  if (!store) {
    // Lazy default memory for import-time fixtures that cannot await
    store = createMemoryStore(buildSeedSnapshot())
    storeMode = 'memory'
    resetOutboxForTests()
  }
  return store
}

export function getActiveStoreMode(): string | undefined {
  return storeMode
}

/** Test helper: reset to a fresh memory/seed store. */
export function resetDecisionGraphStoreForTests(
  seed?: DecisionGraphSnapshot,
): DecisionGraphStore {
  store = createMemoryStore(seed ?? buildSeedSnapshot())
  storeMode = 'memory'
  initPromise = undefined
  resetOutboxForTests()
  return store
}

/** Test/helper: install an explicit store (e.g. postgres with fake client). */
export function setDecisionGraphStoreForTests(next: DecisionGraphStore): void {
  store = next
  initPromise = undefined
}

export { createMemoryStore }
