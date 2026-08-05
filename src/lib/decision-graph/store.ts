/**
 * Decision Graph persistence factory.
 *
 * Bootstrap:
 * - Default / unset / memory / seed → process-local seed snapshot (demo only)
 * - SECURIST_GRAPH_STORE=postgres + DATABASE_URL → Postgres adapter
 * - Postgres without URL → DecisionGraphConfigError (fail closed)
 *
 * Memory remains default until human ops switch after RM-003.
 */
import { resolveDecisionGraphConfig } from './config'
import { contentHash } from './hash'
import { buildSeedSnapshot } from './seed'
import { buildProfile, filterActivity } from './profile'
import { createPostgresStore, createPgPool } from './postgres-store'
import { createPostgresOutbox } from './postgres-outbox'
import { getOutbox, resetOutboxForTests, setOutbox } from './outbox'
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
export { TenantScopeError } from './postgres-store'

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
      if (!String(event.tenantId || '').trim()) {
        throw new Error(
          'tenant-before-persist: appendActivity requires a non-empty tenantId',
        )
      }
      if (event.artifactId) {
        const art = snap.artifacts.find((a) => a.id === event.artifactId)
        if (art && art.tenantId !== event.tenantId) {
          throw new Error(
            `tenant-scope: activity artifact ${event.artifactId} not in tenant ${event.tenantId}`,
          )
        }
      }
      // Memory "transaction": snapshot + outbox together (same turn)
      snap = { ...snap, activity: [event, ...snap.activity] }
      await getOutbox().append({
        id: `ob-act-${event.id}`,
        tenantId: event.tenantId,
        artifactId: event.artifactId,
        eventType: 'activity.projected',
        actorType: 'system',
        payloadFingerprint: contentHash(event.id + event.whatHappened),
        createdAt: event.occurredAt,
      })
    },
    async appendEvidence(record: EvidenceRecord) {
      if (!String(record.tenantId || '').trim()) {
        throw new Error(
          'tenant-before-persist: appendEvidence requires a non-empty tenantId',
        )
      }
      const art = snap.artifacts.find((a) => a.id === record.artifactId)
      if (art && art.tenantId !== record.tenantId) {
        throw new Error(
          `tenant-scope: evidence artifact ${record.artifactId} not in tenant ${record.tenantId}`,
        )
      }
      if (snap.evidence.some((e) => e.id === record.id)) return
      snap = { ...snap, evidence: [...snap.evidence, record] }
      await getOutbox().append({
        id: `ob-ev-${record.id}`,
        tenantId: record.tenantId,
        artifactId: record.artifactId,
        eventType: 'evidence.appended',
        actorType: 'system',
        payloadFingerprint: record.contentHash,
        createdAt: record.observedAt,
      })
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
      const defaultTenantId =
        config.defaultTenantId ||
        process.env.SECURIST_DEFAULT_TENANT_ID?.trim() ||
        undefined
      store = createPostgresStore({ client: pool, defaultTenantId })
      setOutbox(createPostgresOutbox(pool))
      return store
    }

    // memory | seed — demo only; seed snapshot rows are isSeed-labeled
    resetOutboxForTests()
    store = createMemoryStore(buildSeedSnapshot())
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

/** Lazy memory default for import-time code that cannot await. Prefer async getter. */
export function getDecisionGraphStoreSync(): DecisionGraphStore {
  if (!store) {
    store = createMemoryStore(buildSeedSnapshot())
    storeMode = 'memory'
    resetOutboxForTests()
  }
  return store
}

export function getActiveStoreMode(): string | undefined {
  return storeMode
}

export function resetDecisionGraphStoreForTests(
  seed?: DecisionGraphSnapshot,
): DecisionGraphStore {
  resetOutboxForTests()
  store = createMemoryStore(seed ?? buildSeedSnapshot())
  storeMode = 'memory'
  initPromise = undefined
  return store
}

export function setDecisionGraphStoreForTests(next: DecisionGraphStore): void {
  store = next
  initPromise = undefined
}

export { createMemoryStore }
