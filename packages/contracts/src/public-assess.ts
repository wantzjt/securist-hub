/**
 * Pre-persistence public assessment contract (WO-010).
 *
 * Ephemeral share-safe Decision Brief draft from public sources only.
 * Not a tenant Decision Graph write. Not an authoritative approval.
 *
 * Routes and adapters consume this shape; they do not invent competing types.
 *
 * Do NOT reuse PublicDecisionBriefV1 for local repository assessment (WO-012).
 * Local private evidence uses LocalDecisionBriefV1 + DecisionBriefHonestyV1.
 */

import type {
  DecisionBriefHonestyV1,
  DecisionBriefObservedFactV1,
} from './decision-brief'

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

/** Public-path observed fact (LIVE API or seed). Honesty envelope compatible. */
export type PublicObservedFactV1 = DecisionBriefObservedFactV1 & {
  verification: 'observed' | 'seed'
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
 * Versioned public Decision Brief draft (share-safe web path).
 * Pre-persistence only — never a durable tenant decision.
 * Honesty fields align with DecisionBriefHonestyV1.
 */
export type PublicDecisionBriefV1 = Omit<
  DecisionBriefHonestyV1,
  'observed'
> & {
  kind: 'public_decision_brief'
  /** Public web only — never local_only private evidence */
  persistence: 'ephemeral_client_only'
  repository: PublicRepositoryFactsV1
  /** Caller-stated scope (not observed fact) */
  scope: PublicAssessScopeV1
  observed: PublicObservedFactV1[]
  fetchedAt: string
  /** JSON serialization of the brief body for copy/download (no extra secrets). */
  draftJson: string
}

/**
 * Explicit public-assess failure codes (runtime).
 * New codes are additive; clients should treat unknown codes as generic failure.
 */
export type PublicAssessErrorCodeV1 =
  | 'schema'
  | 'redaction'
  | 'invalid_url'
  | 'not_found'
  | 'private_repo'
  | 'rate_limited'
  | 'timeout'
  | 'upstream_unavailable'
  | 'github_error'

export type PublicRepoAssessResultV1 =
  | { ok: true; brief: PublicDecisionBriefV1 }
  | { ok: false; code: PublicAssessErrorCodeV1 | string; error: string }

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

/**
 * Resilience bounds for anonymous public GitHub assess (WO-016).
 * Not an SLA — documents intentional ceilings only.
 */
export const PUBLIC_ASSESS_RESILIENCE_V1 = {
  /** Per GitHub HTTP call abort timeout (ms). */
  githubTimeoutMs: 8_000,
  /** In-process public-fact cache TTL (ms). */
  factCacheTtlMs: 60_000,
  /** Max distinct owner/repo entries retained. */
  factCacheMaxEntries: 64,
  /** Max GitHub API paths used per uncached assess. */
  maxGithubCallsPerAssess: 4,
} as const
