/**
 * Decision Graph persistence adapter.
 * Local/default: process memory + seed snapshot.
 * Production path: Postgres via migrations/ (adapter interface ready).
 */
import { buildSeedSnapshot } from './seed'
import type {
  ActivityEventV2,
  Artifact,
  ArtifactProfileBrief,
  DecisionGraphSnapshot,
  EvidenceDomain,
  EvidenceRecord,
  PolicyEvaluation,
} from './types'

export type DecisionGraphStore = {
  getSnapshot(): DecisionGraphSnapshot
  getArtifact(id: string): Artifact | undefined
  getProfile(id: string): ArtifactProfileBrief | undefined
  listArtifacts(): Artifact[]
  listEvidence(artifactId: string): EvidenceRecord[]
  listEvaluations(artifactId: string): PolicyEvaluation[]
  listActivity(filter?: { publicOnly?: boolean }): ActivityEventV2[]
  appendActivity(event: ActivityEventV2): void
  appendEvidence(record: EvidenceRecord): void
  /** Replay protection for operator ingest */
  consumeNonce(operatorId: string, nonce: string, maxAgeMs?: number): boolean
}

const COVERAGE_DOMAINS: EvidenceDomain[] = [
  'provenance',
  'license',
  'security',
  'model_governance',
  'crypto_agility',
]

function buildProfile(
  snap: DecisionGraphSnapshot,
  id: string,
): ArtifactProfileBrief | undefined {
  const artifact = snap.artifacts.find((a) => a.id === id)
  if (!artifact) return undefined
  const decision = snap.decisions.find((d) => d.artifactId === id)
  const latestEvaluation = [...snap.evaluations]
    .filter((e) => e.artifactId === id)
    .sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt))[0]
  const evidence = snap.evidence.filter((e) => e.artifactId === id)
  const evidenceCoverage = Object.fromEntries(
    COVERAGE_DOMAINS.map((d) => [
      d,
      evidence.some((e) => e.domain === d && e.verification !== 'seed'),
    ]),
  ) as Record<EvidenceDomain, boolean>

  // Seed: coverage may be false even when seed evidence exists — intentional honesty
  for (const d of COVERAGE_DOMAINS) {
    if (!evidenceCoverage[d]) {
      evidenceCoverage[d] = evidence.some(
        (e) => e.domain === d && e.verification === 'seed',
      )
        ? false // seed evidence does not count as coverage for "verified" chips
        : false
    }
  }

  const whatChanged =
    snap.changes
      .filter((c) => c.artifactId === id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0]
      ?.whatHappened ||
    (artifact.isSeed
      ? 'Seed profile only — no production change detection yet.'
      : 'No material change events recorded.')

  const relatedPackageIds = [
    'scout-daemon',
    'geolite2-bridge',
    'hf-model-scout',
    'implementer-sdk',
  ].filter((p) => artifact.name.includes(p) || artifact.id.includes(p))

  return {
    artifact,
    decision,
    latestEvaluation,
    evidenceCoverage,
    whatChangedSinceApproval: whatChanged,
    relatedPackageIds:
      relatedPackageIds.length > 0 ? relatedPackageIds : ['hub'],
  }
}

function createMemoryStore(): DecisionGraphStore {
  let snap = buildSeedSnapshot()
  const nonces = new Map<string, number>()

  return {
    getSnapshot: () => snap,
    getArtifact: (id) => snap.artifacts.find((a) => a.id === id),
    getProfile: (id) => buildProfile(snap, id),
    listArtifacts: () => snap.artifacts,
    listEvidence: (artifactId) =>
      snap.evidence.filter((e) => e.artifactId === artifactId),
    listEvaluations: (artifactId) =>
      snap.evaluations.filter((e) => e.artifactId === artifactId),
    listActivity: (filter) => {
      let rows = snap.activity
      if (filter?.publicOnly) {
        rows = rows.filter((a) => a.visibility === 'public')
      }
      return [...rows].sort((a, b) =>
        b.occurredAt.localeCompare(a.occurredAt),
      )
    },
    appendActivity: (event) => {
      snap = { ...snap, activity: [event, ...snap.activity] }
    },
    appendEvidence: (record) => {
      // append-only: never replace existing by id overwrite of content
      if (snap.evidence.some((e) => e.id === record.id)) return
      snap = { ...snap, evidence: [...snap.evidence, record] }
    },
    consumeNonce: (operatorId, nonce, maxAgeMs = 15 * 60 * 1000) => {
      const key = `${operatorId}:${nonce}`
      const now = Date.now()
      // purge old
      for (const [k, t] of nonces) {
        if (now - t > maxAgeMs) nonces.delete(k)
      }
      if (nonces.has(key)) return false
      nonces.set(key, now)
      return true
    },
  }
}

/** Process-local singleton (dev). Swap for Postgres adapter in production. */
let store: DecisionGraphStore | undefined

export function getDecisionGraphStore(): DecisionGraphStore {
  if (!store) store = createMemoryStore()
  return store
}

export function resetDecisionGraphStoreForTests(): void {
  store = createMemoryStore()
}
