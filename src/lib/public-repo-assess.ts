/**
 * Public GitHub repository assess — share-safe Decision Brief draft.
 * Deterministic collection of public API facts only.
 * Never persists customer data; never claims vulns from narrative; not a pentest.
 *
 * Anonymous assess NEVER uses a privileged GitHub token (no Authorization header).
 * Contract types live in @securist/contracts (public-assess).
 */

import type {
  PublicAssessBoundaryV1,
  PublicAssessEnvironmentV1,
  PublicDecisionBriefV1,
  PublicObservedFactV1,
  PublicRepoAssessInputV1,
  PublicRepoAssessResultV1,
  PublicRepositoryFactsV1,
} from '../../packages/contracts/src/public-assess'
import {
  PUBLIC_ASSESS_BOUNDARIES_V1,
  PUBLIC_ASSESS_ENVIRONMENTS_V1,
  PUBLIC_ASSESS_LIMITS_V1,
  PUBLIC_ASSESS_RESILIENCE_V1,
} from '../../packages/contracts/src/public-assess'

/** Re-export contract types for hub adapters (canonical source is packages/contracts). */
export type {
  PublicAssessBoundaryV1 as AssessBoundary,
  PublicAssessEnvironmentV1 as AssessEnvironment,
  PublicDecisionBriefV1 as PublicDecisionBrief,
  PublicRepoAssessInputV1 as PublicRepoAssessInput,
  PublicRepoAssessResultV1 as PublicRepoAssessResult,
  PublicObservedFactV1 as ObservedFact,
}

export type AssessFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>

const GH_REPO =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?(?:[?#].*)?$/i

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function rejectPrivateMaterial(s: string): string | null {
  if (
    /-----BEGIN |api[_-]?key|password=|ghp_[A-Za-z0-9]|gho_[A-Za-z0-9]|github_pat_[A-Za-z0-9_]|\/Users\/|C:\\\\|file:\/\//i.test(
      s,
    )
  ) {
    return 'Input appears to contain private material; use a public GitHub URL only'
  }
  if (/github\.com\/[^/]+\/[^/]+\/(settings|security|network|pull|issues|tree|blob|commit)/i.test(s)) {
    return 'Use the repository root URL only'
  }
  return null
}

/**
 * Runtime validation for public POST input.
 * Never trusts TypeScript shapes alone.
 */
export function validatePublicRepoAssessInput(
  raw: unknown,
):
  | { ok: true; data: PublicRepoAssessInputV1 }
  | { ok: false; code: string; error: string } {
  if (raw === null || raw === undefined) {
    return { ok: false, code: 'schema', error: 'Request body is required' }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      code: 'schema',
      error: 'Request body must be a JSON object',
    }
  }
  if (!isPlainObject(raw)) {
    return { ok: false, code: 'schema', error: 'Request body must be a plain object' }
  }

  const { repositoryUrl, intendedUse, environment, deploymentBoundary } = raw

  if (typeof repositoryUrl !== 'string') {
    return {
      ok: false,
      code: 'schema',
      error: 'repositoryUrl must be a string',
    }
  }
  if (typeof intendedUse !== 'string') {
    return {
      ok: false,
      code: 'schema',
      error: 'intendedUse must be a string',
    }
  }
  if (repositoryUrl.length > PUBLIC_ASSESS_LIMITS_V1.repositoryUrlMax) {
    return {
      ok: false,
      code: 'schema',
      error: `repositoryUrl exceeds ${PUBLIC_ASSESS_LIMITS_V1.repositoryUrlMax} characters`,
    }
  }
  if (intendedUse.length > PUBLIC_ASSESS_LIMITS_V1.intendedUseMax) {
    return {
      ok: false,
      code: 'schema',
      error: `intendedUse exceeds ${PUBLIC_ASSESS_LIMITS_V1.intendedUseMax} characters`,
    }
  }

  if (
    typeof environment !== 'string' ||
    !PUBLIC_ASSESS_ENVIRONMENTS_V1.includes(
      environment as PublicAssessEnvironmentV1,
    )
  ) {
    return {
      ok: false,
      code: 'schema',
      error:
        'environment must be one of: research, development, staging, production',
    }
  }
  if (
    typeof deploymentBoundary !== 'string' ||
    !PUBLIC_ASSESS_BOUNDARIES_V1.includes(
      deploymentBoundary as PublicAssessBoundaryV1,
    )
  ) {
    return {
      ok: false,
      code: 'schema',
      error:
        'deploymentBoundary must be one of: local_only, controlled_cloud, external_service',
    }
  }

  const intended = intendedUse.trim()
  if (!intended) {
    return { ok: false, code: 'schema', error: 'Intended use is required' }
  }

  const intendedPrivate = rejectPrivateMaterial(intended)
  if (intendedPrivate) {
    return {
      ok: false,
      code: 'redaction',
      error:
        'Intended use appears to contain private or sensitive material; do not enter secrets, keys, paths, or private data',
    }
  }

  const urlPrivate = rejectPrivateMaterial(repositoryUrl.trim())
  if (urlPrivate) {
    return { ok: false, code: 'invalid_url', error: urlPrivate }
  }

  const parsed = parsePublicGithubUrl(repositoryUrl)
  if ('error' in parsed) {
    return { ok: false, code: 'invalid_url', error: parsed.error }
  }

  return {
    ok: true,
    data: {
      contractVersion: '1',
      repositoryUrl: repositoryUrl.trim(),
      intendedUse: intended,
      environment: environment as PublicAssessEnvironmentV1,
      deploymentBoundary: deploymentBoundary as PublicAssessBoundaryV1,
    },
  }
}

export function parsePublicGithubUrl(
  raw: string,
): { owner: string; repo: string } | { error: string } {
  if (typeof raw !== 'string') {
    return { error: 'Repository URL is required' }
  }
  const trimmed = raw.trim()
  if (!trimmed) return { error: 'Repository URL is required' }
  const bad = rejectPrivateMaterial(trimmed)
  if (bad) return { error: bad }
  if (
    /^(\/|~\/|\.\/|\.\.\/|file:)/i.test(trimmed) ||
    /^[A-Za-z]:\\/.test(trimmed)
  ) {
    return { error: 'Local paths are not accepted; use a public GitHub URL' }
  }
  if (/gitlab\.com|bitbucket\.org|huggingface\.co|npmjs\.com/i.test(trimmed)) {
    return {
      error:
        'Only public GitHub repository URLs are supported in this assess path',
    }
  }
  if (!/github\.com/i.test(trimmed) && !GH_REPO.test(trimmed)) {
    return {
      error:
        'Enter a public github.com/owner/repo URL (no private hosts or local paths)',
    }
  }
  const m = trimmed.match(GH_REPO)
  if (!m) {
    return {
      error:
        'Enter a public github.com/owner/repo URL (no private hosts or local paths)',
    }
  }
  const owner = m[1]
  const repo = m[2].replace(/\.git$/i, '')
  if (
    /^(settings|account|orgs|marketplace|topics|features|pricing)$/i.test(owner)
  ) {
    return { error: 'Not a repository URL' }
  }
  return { owner, repo }
}

type GhFetchFailureKind =
  | 'http'
  | 'timeout'
  | 'network'
  | 'upstream_unavailable'

type GhFetchResult<T> =
  | { ok: true; data: T; status: number; rateLimitRemaining: number | null }
  | {
      ok: false
      status: number
      kind: GhFetchFailureKind
      rateLimitRemaining: number | null
    }

function parseRateLimitRemaining(res: Response): number | null {
  const raw = res.headers.get('x-ratelimit-remaining')
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = (err as { name?: string }).name
  return name === 'AbortError' || name === 'TimeoutError'
}

/**
 * Unauthenticated GitHub API GET — never attaches Authorization.
 * Privileged tokens remain for first-party Scout only.
 * Always applies an explicit outbound timeout (WO-016).
 */
async function ghJsonPublic<T>(
  path: string,
  fetchImpl: AssessFetch,
  timeoutMs: number,
): Promise<GhFetchResult<T>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'securist-public-assess',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  // Intentionally no Authorization header — anonymous public assess only.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(`https://api.github.com${path}`, {
      headers,
      signal: controller.signal,
    })
    const rateLimitRemaining = parseRateLimitRemaining(res)
    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ok: false,
          status: res.status,
          kind: 'upstream_unavailable',
          rateLimitRemaining,
        }
      }
      return {
        ok: false,
        status: res.status,
        kind: 'http',
        rateLimitRemaining,
      }
    }
    const data = (await res.json()) as T
    return { ok: true, data, status: res.status, rateLimitRemaining }
  } catch (err) {
    if (isAbortError(err) || controller.signal.aborted) {
      return {
        ok: false,
        status: 0,
        kind: 'timeout',
        rateLimitRemaining: null,
      }
    }
    return {
      ok: false,
      status: 0,
      kind: 'network',
      rateLimitRemaining: null,
    }
  } finally {
    clearTimeout(timer)
  }
}

/** Map primary-repo fetch failure to a client-visible assess error. */
function mapPrimaryGithubFailure(
  fail: Extract<GhFetchResult<unknown>, { ok: false }>,
): PublicRepoAssessResultV1 {
  if (fail.kind === 'timeout') {
    return {
      ok: false,
      code: 'timeout',
      error:
        'GitHub did not respond within the assess timeout. Retry later; this is not a Decision Graph failure.',
    }
  }
  if (fail.kind === 'network' || fail.kind === 'upstream_unavailable') {
    return {
      ok: false,
      code: 'upstream_unavailable',
      error:
        'GitHub API is temporarily unavailable (network or upstream error). Retry later.',
    }
  }
  if (fail.status === 404) {
    return {
      ok: false,
      code: 'not_found',
      error:
        'Repository not found or not public. Only public GitHub repositories can be assessed anonymously.',
    }
  }
  if (fail.status === 403) {
    const remaining = fail.rateLimitRemaining
    const rateLimited =
      remaining === 0 ||
      remaining === null /* GitHub often omits remaining on secondary limits */
    if (rateLimited) {
      return {
        ok: false,
        code: 'rate_limited',
        error:
          'GitHub API rate limit reached for anonymous public assess. Retry later. Securist does not attach privileged tokens to this path.',
      }
    }
    return {
      ok: false,
      code: 'rate_limited',
      error:
        'GitHub denied the anonymous assess request (403). Often rate limit or abuse detection; retry later.',
    }
  }
  return {
    ok: false,
    code: 'github_error',
    error: `GitHub API error (${fail.status || 'unknown'})`,
  }
}

/* —— Bounded public-fact cache (owner/repo only; never intendedUse) —— */

type CachedPublicRepoFacts = {
  fullName: string
  repository: PublicRepositoryFactsV1
  /** Wall time when facts were collected from GitHub (ms). */
  collectedAtMs: number
  expiresAtMs: number
}

const publicFactCache = new Map<string, CachedPublicRepoFacts>()

function cacheKey(owner: string, repo: string): string {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`
}

function pruneFactCache(nowMs: number): void {
  for (const [k, v] of publicFactCache) {
    if (v.expiresAtMs <= nowMs) publicFactCache.delete(k)
  }
  const max = PUBLIC_ASSESS_RESILIENCE_V1.factCacheMaxEntries
  while (publicFactCache.size > max) {
    const oldest = publicFactCache.keys().next().value
    if (oldest === undefined) break
    publicFactCache.delete(oldest)
  }
}

/** Test / ops helper: drop all cached public facts. */
export function clearPublicAssessFactCache(): void {
  publicFactCache.clear()
}

/** Test helper: cache size and keys (no fact bodies). */
export function getPublicAssessFactCacheStats(): {
  size: number
  keys: string[]
} {
  return { size: publicFactCache.size, keys: [...publicFactCache.keys()] }
}

type GhRepo = {
  full_name: string
  name: string
  owner: { login: string }
  html_url: string
  description: string | null
  default_branch: string
  private: boolean
  language: string | null
  license: { spdx_id?: string; name?: string } | null
  pushed_at: string | null
  updated_at: string | null
  archived: boolean
  fork: boolean
  topics?: string[]
}

type GhRelease = {
  tag_name: string
  published_at: string
}

type GhCommit = { sha: string }

type GhContent = {
  content?: string
  encoding?: string
}

function decodeContent(c: GhContent): string | null {
  if (!c.content || c.encoding !== 'base64') return null
  try {
    return Buffer.from(c.content.replace(/\n/g, ''), 'base64').toString('utf8')
  } catch {
    return null
  }
}

export type AssessPublicGithubOptions = {
  /** Injected fetch for tests. Must never receive Authorization from this module. */
  fetchImpl?: AssessFetch
  /** Override per-call GitHub timeout (ms). Defaults to PUBLIC_ASSESS_RESILIENCE_V1. */
  githubTimeoutMs?: number
  /** Skip reading/writing the public-fact cache (tests). */
  skipCache?: boolean
  /** Clock for cache TTL tests. */
  nowMs?: () => number
}

async function collectPublicRepositoryFacts(
  owner: string,
  repo: string,
  fetchImpl: AssessFetch,
  timeoutMs: number,
): Promise<
  | { ok: true; repository: PublicRepositoryFactsV1 }
  | { ok: false; result: PublicRepoAssessResultV1 }
> {
  const repoRes = await ghJsonPublic<GhRepo>(
    `/repos/${owner}/${repo}`,
    fetchImpl,
    timeoutMs,
  )
  if (!repoRes.ok) {
    return { ok: false, result: mapPrimaryGithubFailure(repoRes) }
  }

  const r = repoRes.data
  if (r.private) {
    return {
      ok: false,
      result: {
        ok: false,
        code: 'private_repo',
        error:
          'Private repositories are not accepted before R1 durable workspaces',
      },
    }
  }

  const [releaseRes, commitRes, pkgRes] = await Promise.all([
    ghJsonPublic<GhRelease>(
      `/repos/${owner}/${repo}/releases/latest`,
      fetchImpl,
      timeoutMs,
    ),
    ghJsonPublic<GhCommit[]>(
      `/repos/${owner}/${repo}/commits?per_page=1&sha=${encodeURIComponent(r.default_branch)}`,
      fetchImpl,
      timeoutMs,
    ),
    ghJsonPublic<GhContent>(
      `/repos/${owner}/${repo}/contents/package.json?ref=${encodeURIComponent(r.default_branch)}`,
      fetchImpl,
      timeoutMs,
    ),
  ])

  let packageName: string | null = null
  let packageVersion: string | null = null
  if (pkgRes.ok) {
    const raw = decodeContent(pkgRes.data)
    if (raw) {
      try {
        const pkg = JSON.parse(raw) as { name?: string; version?: string }
        packageName = pkg.name || null
        packageVersion = pkg.version || null
      } catch {
        /* ignore invalid package.json */
      }
    }
  }

  const latestReleaseTag = releaseRes.ok ? releaseRes.data.tag_name : null
  const latestReleasePublishedAt = releaseRes.ok
    ? releaseRes.data.published_at
    : null
  const headSha =
    commitRes.ok && commitRes.data[0] ? commitRes.data[0].sha : null

  const repository: PublicRepositoryFactsV1 = {
    owner: r.owner.login,
    name: r.name,
    fullName: r.full_name,
    htmlUrl: r.html_url,
    description: r.description,
    defaultBranch: r.default_branch,
    visibility: 'public',
    language: r.language,
    licenseSpdx:
      r.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION'
        ? r.license.spdx_id
        : null,
    licenseName: r.license?.name || null,
    pushedAt: r.pushed_at,
    updatedAt: r.updated_at,
    archived: r.archived,
    fork: r.fork,
    topics: r.topics || [],
    latestReleaseTag,
    latestReleasePublishedAt,
    headSha,
    packageName,
    packageVersion,
  }

  return { ok: true, repository }
}

function buildBriefFromPublicFacts(
  input: PublicRepoAssessInputV1,
  repository: PublicRepositoryFactsV1,
  fetchedAt: string,
): PublicDecisionBriefV1 {
  const observed: PublicObservedFactV1[] = [
    {
      domain: 'provenance',
      assertion: `Public GitHub repository ${repository.fullName} on default branch ${repository.defaultBranch}${repository.headSha ? ` (HEAD ${repository.headSha.slice(0, 7)})` : ''}.`,
      verification: 'observed',
      source: `github:api:repos/${repository.fullName}`,
    },
  ]

  if (repository.licenseSpdx) {
    observed.push({
      domain: 'license',
      assertion: `License SPDX observed: ${repository.licenseSpdx}${repository.licenseName ? ` (${repository.licenseName})` : ''}.`,
      verification: 'observed',
      source: `github:api:repos/${repository.fullName}/license`,
    })
  }

  if (repository.latestReleaseTag) {
    observed.push({
      domain: 'provenance',
      assertion: `Latest GitHub release tag observed: ${repository.latestReleaseTag}${repository.latestReleasePublishedAt ? ` at ${repository.latestReleasePublishedAt}` : ''}.`,
      verification: 'observed',
      source: `github:api:repos/${repository.fullName}/releases/latest`,
    })
  }

  if (repository.packageName || repository.packageVersion) {
    observed.push({
      domain: 'provenance',
      assertion: `Root package.json observed${repository.packageName ? `: name ${repository.packageName}` : ''}${repository.packageVersion ? ` @ ${repository.packageVersion}` : ''}.`,
      verification: 'observed',
      source: `github:api:contents/package.json@${repository.defaultBranch}`,
    })
  }

  if (repository.archived) {
    observed.push({
      domain: 'security',
      assertion: 'Repository is marked archived on GitHub (observed metadata).',
      verification: 'observed',
      source: `github:api:repos/${repository.fullName}`,
    })
  }

  const unknowns: string[] = [
    'No security advisory scan was performed in this assess path.',
    'Dependency tree and transitive risk were not evaluated.',
    'No local validation or pentest was run.',
    'Maintainer authenticity and supply-chain attestations were not verified.',
  ]

  const evidenceGaps: string[] = [
    'security',
    'model_governance',
    'crypto_agility',
  ]
  if (!repository.licenseSpdx) {
    evidenceGaps.unshift('license')
  }

  const reReviewTriggers = [
    'New default-branch commit or release tag with different digest/version',
    'License SPDX change or removal',
    'Repository archived, transferred, or visibility change',
    'Material change to published package version on the default branch',
    'Policy version change affecting this intended use or boundary',
  ]

  const policyHints: string[] = [
    `Intended use (stated): ${input.intendedUse}`,
    `Environment: ${input.environment}`,
    `Deployment boundary: ${input.deploymentBoundary}`,
    'Human decision required before treating this as approved for production use.',
    'This brief is not an authoritative Decision Graph approval. Policy hints are non-authoritative.',
  ]

  if (
    input.deploymentBoundary === 'external_service' ||
    input.environment === 'production'
  ) {
    policyHints.push(
      'Production / external_service scope requires stronger evidence and explicit human approval under tenant policy.',
    )
  }

  const disclaimers = [
    'Public-source observation only. LIVE facts are those returned by GitHub on this fetch (or a short-lived public-fact cache of the same API fields).',
    'No vulnerability is asserted from model narrative or inference.',
    'Not a penetration test, SCA scan, or compliance certification.',
    'No customer-private data is stored by this assess path (pre-R1). Public fact cache keys are owner/repo only.',
    'Save and monitor is not available until durable workspace (R1).',
  ]

  const briefCore = {
    contractVersion: '1' as const,
    kind: 'public_decision_brief' as const,
    durable: false as const,
    persistence: 'ephemeral_client_only' as const,
    label: 'LIVE' as const,
    decisionStatus: 'not_reviewed' as const,
    repository,
    scope: {
      intendedUse: input.intendedUse,
      environment: input.environment,
      deploymentBoundary: input.deploymentBoundary,
    },
    observed,
    unknowns,
    evidenceGaps,
    reReviewTriggers,
    policyHints,
    disclaimers,
    fetchedAt,
  }

  return {
    ...briefCore,
    draftJson: JSON.stringify(briefCore, null, 2),
  }
}

/**
 * Collect public GitHub facts and produce an ephemeral Decision Brief draft.
 * Does not write to Decision Graph store, tenant workspace, or Postgres.
 * Does not use privileged GitHub tokens.
 */
export async function assessPublicGithubRepo(
  rawInput: unknown,
  options?: AssessPublicGithubOptions,
): Promise<PublicRepoAssessResultV1> {
  const validated = validatePublicRepoAssessInput(rawInput)
  if (!validated.ok) {
    return { ok: false, code: validated.code, error: validated.error }
  }
  const input = validated.data
  const fetchImpl = options?.fetchImpl ?? globalThis.fetch.bind(globalThis)
  const timeoutMs =
    options?.githubTimeoutMs ?? PUBLIC_ASSESS_RESILIENCE_V1.githubTimeoutMs
  const nowMs = options?.nowMs ?? Date.now
  const skipCache = options?.skipCache === true

  const parsed = parsePublicGithubUrl(input.repositoryUrl)
  if ('error' in parsed) {
    return { ok: false, code: 'invalid_url', error: parsed.error }
  }

  const { owner, repo } = parsed
  const key = cacheKey(owner, repo)
  const now = nowMs()

  if (!skipCache) {
    pruneFactCache(now)
    const hit = publicFactCache.get(key)
    if (hit && hit.expiresAtMs > now) {
      // Re-order for simple LRU eviction (Map insertion order).
      publicFactCache.delete(key)
      publicFactCache.set(key, hit)
      const brief = buildBriefFromPublicFacts(
        input,
        hit.repository,
        new Date(hit.collectedAtMs).toISOString(),
      )
      return { ok: true, brief }
    }
  }

  const collected = await collectPublicRepositoryFacts(
    owner,
    repo,
    fetchImpl,
    timeoutMs,
  )
  if (!collected.ok) return collected.result

  const collectedAtMs = nowMs()
  if (!skipCache) {
    pruneFactCache(collectedAtMs)
    publicFactCache.set(key, {
      fullName: collected.repository.fullName,
      repository: collected.repository,
      collectedAtMs,
      expiresAtMs:
        collectedAtMs + PUBLIC_ASSESS_RESILIENCE_V1.factCacheTtlMs,
    })
    pruneFactCache(collectedAtMs)
  }

  const brief = buildBriefFromPublicFacts(
    input,
    collected.repository,
    new Date(collectedAtMs).toISOString(),
  )
  return { ok: true, brief }
}
