/**
 * Pre-persistence public assessment contract (WO-010).
 *
 * Ephemeral share-safe Decision Brief draft from public sources only.
 * Not a tenant Decision Graph write. Not an authoritative approval.
 *
 * Routes and adapters consume this shape; they do not invent competing types.
 */

export type PublicAssessEnvironmentV1 =
  | 'research'
  | 'development'
  | 'staging'
  | 'production'

export type PublicAssessBoundaryV1 =
  | 'local_only'
  | 'controlled_cloud'
  | 'external_service'

/** Stated scope for a public assess request (caller-supplied, not observed). */
export type PublicAssessScopeV1 = {
  intendedUse: string
  environment: PublicAssessEnvironmentV1
  deploymentBoundary: PublicAssessBoundaryV1
}

/** Validated public assess input (post runtime validation). */
export type PublicRepoAssessInputV1 = {
  contractVersion: '1'
  repositoryUrl: string
  intendedUse: string
  environment: PublicAssessEnvironmentV1
  deploymentBoundary: PublicAssessBoundaryV1
}

export type PublicObservedFactV1 = {
  domain: string
  assertion: string
  /** Source verification — observed public API or labeled seed. */
  verification: 'observed' | 'seed'
  source: string
}

export type PublicRepositoryFactsV1 = {
  owner: string
  name: string
  fullName: string
  htmlUrl: string
  description: string | null
  defaultBranch: string
  visibility: 'public'
  language: string | null
  licenseSpdx: string | null
  licenseName: string | null
  pushedAt: string | null
  updatedAt: string | null
  archived: boolean
  fork: boolean
  topics: string[]
  latestReleaseTag: string | null
  latestReleasePublishedAt: string | null
  headSha: string | null
  packageName: string | null
  packageVersion: string | null
}

/**
 * Versioned public Decision Brief draft.
 * Pre-persistence only — never a durable tenant decision.
 */
export type PublicDecisionBriefV1 = {
  contractVersion: '1'
  kind: 'public_decision_brief'
  /** Never a durable tenant decision */
  durable: false
  persistence: 'ephemeral_client_only'
  label: 'LIVE' | 'HYBRID' | 'SEED'
  decisionStatus: 'not_reviewed'
  repository: PublicRepositoryFactsV1
  /** Caller-stated scope (not observed fact) */
  scope: PublicAssessScopeV1
  observed: PublicObservedFactV1[]
  unknowns: string[]
  evidenceGaps: string[]
  reReviewTriggers: string[]
  /**
   * Non-authoritative hints only — never an approval or Decision Graph write.
   */
  policyHints: string[]
  disclaimers: string[]
  fetchedAt: string
  /** JSON serialization of the brief body for copy/download (no extra secrets). */
  draftJson: string
}

export type PublicRepoAssessResultV1 =
  | { ok: true; brief: PublicDecisionBriefV1 }
  | { ok: false; code: string; error: string }

export const PUBLIC_ASSESS_ENVIRONMENTS_V1: readonly PublicAssessEnvironmentV1[] =
  ['research', 'development', 'staging', 'production'] as const

export const PUBLIC_ASSESS_BOUNDARIES_V1: readonly PublicAssessBoundaryV1[] = [
  'local_only',
  'controlled_cloud',
  'external_service',
] as const

/** Field limits for public assess input (runtime enforced). */
export const PUBLIC_ASSESS_LIMITS_V1 = {
  repositoryUrlMax: 500,
  intendedUseMax: 500,
} as const
