/**
 * Public GitHub repository assess — share-safe Decision Brief draft.
 * Deterministic collection of public API facts only.
 * Never persists customer data; never claims vulns from narrative; not a pentest.
 */

export type AssessEnvironment =
  | 'research'
  | 'development'
  | 'staging'
  | 'production'

export type AssessBoundary =
  | 'local_only'
  | 'controlled_cloud'
  | 'external_service'

export type PublicRepoAssessInput = {
  repositoryUrl: string
  intendedUse: string
  environment: AssessEnvironment
  deploymentBoundary: AssessBoundary
}

export type ObservedFact = {
  domain: string
  assertion: string
  verification: 'observed' | 'seed'
  source: string
}

export type PublicDecisionBrief = {
  contractVersion: '1'
  kind: 'public_decision_brief'
  /** Never a durable tenant decision */
  durable: false
  persistence: 'ephemeral_client_only'
  label: 'LIVE' | 'HYBRID' | 'SEED'
  decisionStatus: 'not_reviewed'
  repository: {
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
  scope: {
    intendedUse: string
    environment: AssessEnvironment
    deploymentBoundary: AssessBoundary
  }
  observed: ObservedFact[]
  unknowns: string[]
  evidenceGaps: string[]
  reReviewTriggers: string[]
  policyHints: string[]
  disclaimers: string[]
  fetchedAt: string
  draftJson: string
}

export type PublicRepoAssessResult =
  | { ok: true; brief: PublicDecisionBrief }
  | { ok: false; code: string; error: string }

const GH_REPO =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?(?:[?#].*)?$/i

function rejectPrivateMaterial(s: string): string | null {
  if (/-----BEGIN |api[_-]?key|password=|ghp_[A-Za-z0-9]|\/Users\/|C:\\\\/i.test(s)) {
    return 'Input appears to contain private material; use a public GitHub URL only'
  }
  if (/github\.com\/[^/]+\/[^/]+\/(settings|security|network)/i.test(s)) {
    return 'Use the repository root URL only'
  }
  return null
}

export function parsePublicGithubUrl(
  raw: string,
): { owner: string; repo: string } | { error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { error: 'Repository URL is required' }
  const bad = rejectPrivateMaterial(trimmed)
  if (bad) return { error: bad }
  if (/gitlab\.com|bitbucket\.org|huggingface\.co|npmjs\.com/i.test(trimmed)) {
    return {
      error:
        'Only public GitHub repository URLs are supported in this assess path',
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

async function ghJson<T>(
  path: string,
  token?: string,
): Promise<{ ok: true; data: T; status: number } | { ok: false; status: number }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'securist-public-assess',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) return { ok: false, status: res.status }
  const data = (await res.json()) as T
  return { ok: true, data, status: res.status }
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

/**
 * Collect public GitHub facts and produce an ephemeral Decision Brief draft.
 * Does not write to Decision Graph store or any private persistence.
 */
export async function assessPublicGithubRepo(
  input: PublicRepoAssessInput,
  token?: string,
): Promise<PublicRepoAssessResult> {
  const intendedUse = input.intendedUse.trim().slice(0, 500)
  if (!intendedUse) {
    return { ok: false, code: 'schema', error: 'Intended use is required' }
  }
  const parsed = parsePublicGithubUrl(input.repositoryUrl)
  if ('error' in parsed) {
    return { ok: false, code: 'invalid_url', error: parsed.error }
  }

  const { owner, repo } = parsed
  const repoRes = await ghJson<GhRepo>(`/repos/${owner}/${repo}`, token)
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      return {
        ok: false,
        code: 'not_found',
        error:
          'Repository not found or not public. Only public GitHub repositories can be assessed anonymously.',
      }
    }
    if (repoRes.status === 403) {
      return {
        ok: false,
        code: 'rate_limited',
        error: 'GitHub API rate limit or access denied. Retry later.',
      }
    }
    return {
      ok: false,
      code: 'github_error',
      error: `GitHub API error (${repoRes.status})`,
    }
  }

  const r = repoRes.data
  if (r.private) {
    return {
      ok: false,
      code: 'private_repo',
      error: 'Private repositories are not accepted before R1 durable workspaces',
    }
  }

  const [releaseRes, commitRes, pkgRes] = await Promise.all([
    ghJson<GhRelease>(`/repos/${owner}/${repo}/releases/latest`, token),
    ghJson<GhCommit[]>(
      `/repos/${owner}/${repo}/commits?per_page=1&sha=${encodeURIComponent(r.default_branch)}`,
      token,
    ),
    ghJson<GhContent>(
      `/repos/${owner}/${repo}/contents/package.json?ref=${encodeURIComponent(r.default_branch)}`,
      token,
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

  const observed: ObservedFact[] = [
    {
      domain: 'provenance',
      assertion: `Public GitHub repository ${r.full_name} on default branch ${r.default_branch}${headSha ? ` (HEAD ${headSha.slice(0, 7)})` : ''}.`,
      verification: 'observed',
      source: `github:api:repos/${r.full_name}`,
    },
  ]

  if (r.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION') {
    observed.push({
      domain: 'license',
      assertion: `License SPDX observed: ${r.license.spdx_id}${r.license.name ? ` (${r.license.name})` : ''}.`,
      verification: 'observed',
      source: `github:api:repos/${r.full_name}/license`,
    })
  }

  if (latestReleaseTag) {
    observed.push({
      domain: 'provenance',
      assertion: `Latest GitHub release tag observed: ${latestReleaseTag}${latestReleasePublishedAt ? ` at ${latestReleasePublishedAt}` : ''}.`,
      verification: 'observed',
      source: `github:api:repos/${r.full_name}/releases/latest`,
    })
  }

  if (packageName || packageVersion) {
    observed.push({
      domain: 'provenance',
      assertion: `Root package.json observed${packageName ? `: name ${packageName}` : ''}${packageVersion ? ` @ ${packageVersion}` : ''}.`,
      verification: 'observed',
      source: `github:api:contents/package.json@${r.default_branch}`,
    })
  }

  if (r.archived) {
    observed.push({
      domain: 'security',
      assertion: 'Repository is marked archived on GitHub (observed metadata).',
      verification: 'observed',
      source: `github:api:repos/${r.full_name}`,
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
  if (!r.license?.spdx_id || r.license.spdx_id === 'NOASSERTION') {
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
    `Intended use (stated): ${intendedUse}`,
    `Environment: ${input.environment}`,
    `Deployment boundary: ${input.deploymentBoundary}`,
    'Human decision required before treating this as approved for production use.',
    'This brief is not an authoritative Decision Graph approval.',
  ]

  if (input.deploymentBoundary === 'external_service' || input.environment === 'production') {
    policyHints.push(
      'Production / external_service scope requires stronger evidence and explicit human approval under tenant policy.',
    )
  }

  const disclaimers = [
    'Public-source observation only. LIVE facts are those returned by GitHub on this fetch.',
    'No vulnerability is asserted from model narrative or inference.',
    'Not a penetration test, SCA scan, or compliance certification.',
    'No customer-private data is stored by this assess path (pre-R1).',
    'Save and monitor is not available until durable workspace (R1).',
  ]

  const repository = {
    owner: r.owner.login,
    name: r.name,
    fullName: r.full_name,
    htmlUrl: r.html_url,
    description: r.description,
    defaultBranch: r.default_branch,
    visibility: 'public' as const,
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

  const briefCore = {
    contractVersion: '1' as const,
    kind: 'public_decision_brief' as const,
    durable: false as const,
    persistence: 'ephemeral_client_only' as const,
    label: 'LIVE' as const,
    decisionStatus: 'not_reviewed' as const,
    repository,
    scope: {
      intendedUse,
      environment: input.environment,
      deploymentBoundary: input.deploymentBoundary,
    },
    observed,
    unknowns,
    evidenceGaps,
    reReviewTriggers,
    policyHints,
    disclaimers,
    fetchedAt: new Date().toISOString(),
  }

  const brief: PublicDecisionBrief = {
    ...briefCore,
    draftJson: JSON.stringify(briefCore, null, 2),
  }

  return { ok: true, brief }
}
