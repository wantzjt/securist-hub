/**
 * Artifact Profile brief builder — pure read projection over a snapshot.
 */
import type {
  ActivityEventV2,
  ArtifactProfileBrief,
  DecisionGraphSnapshot,
  EvidenceDomain,
} from './types'

const COVERAGE_DOMAINS: EvidenceDomain[] = [
  'provenance',
  'license',
  'security',
  'model_governance',
  'crypto_agility',
]

export function buildProfile(
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

  // Seed evidence does not count as coverage for "verified" chips
  for (const d of COVERAGE_DOMAINS) {
    if (!evidenceCoverage[d]) {
      evidenceCoverage[d] = false
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

export function filterActivity(
  rows: ActivityEventV2[],
  filter?: { publicOnly?: boolean; tenantId?: string },
): ActivityEventV2[] {
  let out = rows
  if (filter?.tenantId) {
    out = out.filter((a) => a.tenantId === filter.tenantId)
  }
  if (filter?.publicOnly) {
    out = out.filter((a) => a.visibility === 'public')
  }
  return [...out].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}
