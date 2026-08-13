/**
 * Public assess fixtures (WO-010 fixup).
 * Proves: no privileged GitHub Authorization header, runtime validation,
 * ephemeral contract shape, no Decision Graph / tenant / Postgres writes.
 */
import {
  assessPublicGithubRepo,
  clearPublicAssessFactCache,
  getPublicAssessFactCacheStats,
  parsePublicGithubUrl,
  validatePublicRepoAssessInput,
} from '../../public-repo-assess'
import type { AssessFetch } from '../../public-repo-assess'
import { PUBLIC_ASSESS_RESILIENCE_V1 } from '../../../../packages/contracts/src/public-assess'

let passed = 0
let failed = 0

function ok(name: string) {
  passed++
  console.log(`  ✓ ${name}`)
}

function fail(name: string, detail: string) {
  failed++
  console.error(`  ✗ ${name}: ${detail}`)
}

function assert(name: string, condition: boolean, detail = 'assertion failed') {
  if (condition) ok(name)
  else fail(name, detail)
}

function mockPublicGithubFetch(): {
  fetchImpl: AssessFetch
  authHeaderSeen: string[]
  urls: string[]
} {
  const authHeaderSeen: string[] = []
  const urls: string[] = []

  const fetchImpl: AssessFetch = async (input, init) => {
    const url = String(input)
    urls.push(url)
    const headers = new Headers(init?.headers)
    const auth = headers.get('Authorization') || headers.get('authorization')
    if (auth) authHeaderSeen.push(auth)

    if (url.includes('/repos/public-owner/public-repo/releases/latest')) {
      return new Response(
        JSON.stringify({
          tag_name: 'v1.0.0',
          published_at: '2026-01-01T00:00:00Z',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
    if (url.includes('/repos/public-owner/public-repo/commits')) {
      return new Response(JSON.stringify([{ sha: 'abc123def4567890' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.includes('/repos/public-owner/public-repo/contents/package.json')) {
      const body = Buffer.from(
        JSON.stringify({ name: 'public-repo', version: '1.0.0' }),
      ).toString('base64')
      return new Response(
        JSON.stringify({ content: body, encoding: 'base64' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (
      url.endsWith('/repos/public-owner/public-repo') ||
      url.includes('/repos/public-owner/public-repo?')
    ) {
      return new Response(
        JSON.stringify({
          full_name: 'public-owner/public-repo',
          name: 'public-repo',
          owner: { login: 'public-owner' },
          html_url: 'https://github.com/public-owner/public-repo',
          description: 'Public fixture repo',
          default_branch: 'main',
          private: false,
          language: 'TypeScript',
          license: { spdx_id: 'Apache-2.0', name: 'Apache License 2.0' },
          pushed_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
          archived: false,
          fork: false,
          topics: ['security'],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    return new Response(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return { fetchImpl, authHeaderSeen, urls }
}

async function main() {
  console.log('Public assess fixtures (WO-010 fixup)\n')

  console.log('[runtime validation]')
  {
    const r = validatePublicRepoAssessInput(null)
    assert('null body → schema', !r.ok && r.code === 'schema')
  }
  {
    const r = validatePublicRepoAssessInput([])
    assert('array body → schema', !r.ok && r.code === 'schema')
  }
  {
    const r = validatePublicRepoAssessInput('not-object')
    assert('string body → schema', !r.ok && r.code === 'schema')
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 123,
      intendedUse: 'x',
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert(
      'non-string repositoryUrl → schema',
      !r.ok && r.code === 'schema' && r.error.includes('repositoryUrl'),
    )
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 'https://github.com/a/b',
      intendedUse: 99,
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert(
      'non-string intendedUse → schema',
      !r.ok && r.code === 'schema' && r.error.includes('intendedUse'),
    )
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 'https://github.com/a/b',
      intendedUse: 'ok',
      environment: 'prod',
      deploymentBoundary: 'local_only',
    })
    assert('invalid environment enum → schema', !r.ok && r.code === 'schema')
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 'https://github.com/a/b',
      intendedUse: 'ok',
      environment: 'development',
      deploymentBoundary: 'anywhere',
    })
    assert('invalid boundary enum → schema', !r.ok && r.code === 'schema')
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 'https://github.com/a/b',
      intendedUse: 'x'.repeat(501),
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert('oversized intendedUse → schema', !r.ok && r.code === 'schema')
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: '/Users/me/secret-repo',
      intendedUse: 'ok',
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert(
      'local path → invalid_url',
      !r.ok && (r.code === 'invalid_url' || r.code === 'schema'),
    )
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl:
        'https://github.com/a/b?token=ghp_abcdefghijklmnopqrstuvwxyz012345',
      intendedUse: 'ok',
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert('secret-like URL → rejected', !r.ok)
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 'https://gitlab.com/a/b',
      intendedUse: 'ok',
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert('unsupported host → invalid_url', !r.ok && r.code === 'invalid_url')
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 'https://github.com/a/b/tree/main/src',
      intendedUse: 'ok',
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert(
      'non-root GitHub URL → invalid_url',
      !r.ok && r.code === 'invalid_url',
    )
  }
  {
    const r = validatePublicRepoAssessInput({
      repositoryUrl: 'https://github.com/public-owner/public-repo',
      intendedUse: 'rotate ghp_abcdefghijklmnopqrstuvwxyz012345 and ship',
      environment: 'development',
      deploymentBoundary: 'local_only',
    })
    assert(
      'secret-like intendedUse → redaction',
      !r.ok && r.code === 'redaction',
    )
  }
  {
    const r = parsePublicGithubUrl('https://github.com/owner/repo')
    assert(
      'valid URL parses',
      !('error' in r) && r.owner === 'owner' && r.repo === 'repo',
    )
  }

  console.log('\n[secret-like intendedUse — zero GitHub calls]')
  {
    const { fetchImpl, authHeaderSeen, urls } = mockPublicGithubFetch()
    const result = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'use password=supersecret for staging deploy',
        environment: 'development',
        deploymentBoundary: 'controlled_cloud',
      },
      { fetchImpl },
    )
    assert(
      'secret intendedUse rejected with redaction code',
      result.ok === false && result.code === 'redaction',
      result.ok ? 'unexpected ok' : `${result.code}: ${result.error}`,
    )
    assert(
      'mock GitHub fetch received zero calls',
      urls.length === 0,
      `calls: ${urls.join(',')}`,
    )
    assert(
      'no Authorization on rejected secret intendedUse',
      authHeaderSeen.length === 0,
    )
  }

  console.log('\n[anonymous assess — no privileged token]')
  {
    const { fetchImpl, authHeaderSeen, urls } = mockPublicGithubFetch()
    const result = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'Evaluate fixture',
        environment: 'development',
        deploymentBoundary: 'controlled_cloud',
      },
      { fetchImpl },
    )
    assert(
      'valid public URL produces ok brief',
      result.ok === true,
      result.ok ? 'ok' : result.error,
    )
    if (result.ok) {
      const brief = result.brief as {
        contractVersion: string
        kind: string
        durable: boolean
        persistence: string
        label: string
        decisionStatus: string
        observed: Array<{ source?: string; verification?: string }>
        unknowns: string[]
        evidenceGaps: string[]
        policyHints: string[]
        scope: {
          intendedUse: string
          environment: string
          deploymentBoundary: string
        }
      }
      assert('contractVersion 1', brief.contractVersion === '1')
      assert(
        'kind public_decision_brief',
        brief.kind === 'public_decision_brief',
      )
      assert('durable false', brief.durable === false)
      assert(
        'persistence ephemeral_client_only',
        brief.persistence === 'ephemeral_client_only',
      )
      assert('label LIVE', brief.label === 'LIVE')
      assert(
        'decisionStatus not_reviewed',
        brief.decisionStatus === 'not_reviewed',
      )
      assert(
        'observed facts present',
        brief.observed.length > 0 &&
          brief.observed.every(
            (o) => Boolean(o.source) && Boolean(o.verification),
          ),
      )
      assert('unknowns present', brief.unknowns.length > 0)
      assert('evidenceGaps present', brief.evidenceGaps.length > 0)
      assert(
        'policyHints non-authoritative note',
        brief.policyHints.some((h) =>
          /non-authoritative|not an authoritative/i.test(h),
        ),
      )
      assert(
        'stated scope retained',
        brief.scope.intendedUse === 'Evaluate fixture' &&
          brief.scope.environment === 'development' &&
          brief.scope.deploymentBoundary === 'controlled_cloud',
      )
    }
    assert(
      'never forwards Authorization header',
      authHeaderSeen.length === 0,
      `seen: ${authHeaderSeen.join(',')}`,
    )
    assert(
      'called GitHub API',
      urls.some((u) => u.includes('api.github.com')),
    )
  }

  console.log('\n[malformed input — explicit codes, no throw]')
  {
    const cases: unknown[] = [
      null,
      42,
      [],
      {
        repositoryUrl: true,
        intendedUse: 'x',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
      {
        repositoryUrl: 'https://github.com/a/b',
        intendedUse: 'ok',
        environment: 'nope',
        deploymentBoundary: 'local_only',
      },
      {
        repositoryUrl: 'C:\\Users\\secret',
        intendedUse: 'ok',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
    ]
    for (const [i, c] of cases.entries()) {
      try {
        const r = await assessPublicGithubRepo(c)
        assert(
          `malformed[${i}] returns error object`,
          r.ok === false &&
            typeof r.code === 'string' &&
            typeof r.error === 'string',
        )
      } catch (e) {
        fail(`malformed[${i}] must not throw`, String(e))
      }
    }
  }

  console.log('\n[no Decision Graph / tenant / Postgres persistence]')
  {
    // This module path does not import store adapters; brief marks non-durable.
    // Static import scan: public-repo-assess must not reference store APIs.
    const fs = await import('node:fs')
    const path = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    const src = fs.readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../public-repo-assess.ts',
      ),
      'utf8',
    )
    assert(
      'public-repo-assess has no store import',
      !/getDecisionGraphStore|postgres-store|createMemoryStore|DEFAULT_TENANT/.test(
        src,
      ),
    )
    assert(
      'public-repo-assess never sets Authorization header',
      !/headers\.Authorization|Authorization:\s*`|['"]Authorization['"]\s*:/.test(
        src,
      ),
    )
    assert(
      'public-repo-assess never references GITHUB_TOKEN/GH_TOKEN',
      !/GITHUB_TOKEN|GH_TOKEN|serverToken/.test(src),
    )
  }

  console.log('\n[WO-016 resilience — timeout / upstream / cache]')
  {
    clearPublicAssessFactCache()
    assert(
      'resilience constants present',
      typeof PUBLIC_ASSESS_RESILIENCE_V1.githubTimeoutMs === 'number' &&
        typeof PUBLIC_ASSESS_RESILIENCE_V1.factCacheMaxEntries === 'number' &&
        typeof PUBLIC_ASSESS_RESILIENCE_V1.factCacheTtlMs === 'number' &&
        typeof PUBLIC_ASSESS_RESILIENCE_V1.maxGithubCallsPerAssess === 'number',
    )

    // Timeout: hang until abort
    const hangFetch: AssessFetch = async (_input, init) => {
      const signal = init?.signal
      return await new Promise<Response>((_resolve, reject) => {
        if (!signal) {
          reject(new Error('expected AbortSignal'))
          return
        }
        if (signal.aborted) {
          const err = new Error('Aborted')
          err.name = 'AbortError'
          reject(err)
          return
        }
        signal.addEventListener('abort', () => {
          const err = new Error('Aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    }
    const timeoutResult = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'timeout probe',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
      { fetchImpl: hangFetch, githubTimeoutMs: 30, skipCache: true },
    )
    assert(
      'timeout → code timeout',
      timeoutResult.ok === false && timeoutResult.code === 'timeout',
      timeoutResult.ok ? 'ok' : `${timeoutResult.code}: ${timeoutResult.error}`,
    )

    // Upstream 503
    const upstreamFetch: AssessFetch = async () =>
      new Response(JSON.stringify({ message: 'unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    const upstreamResult = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'upstream probe',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
      { fetchImpl: upstreamFetch, skipCache: true },
    )
    assert(
      '503 → upstream_unavailable',
      upstreamResult.ok === false &&
        upstreamResult.code === 'upstream_unavailable',
      upstreamResult.ok
        ? 'ok'
        : `${upstreamResult.code}: ${upstreamResult.error}`,
    )

    // Rate limit 403 with remaining 0
    const rateFetch: AssessFetch = async () =>
      new Response(JSON.stringify({ message: 'API rate limit exceeded' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-remaining': '0',
        },
      })
    const rateResult = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'rate probe',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
      { fetchImpl: rateFetch, skipCache: true },
    )
    assert(
      '403 remaining=0 → rate_limited',
      rateResult.ok === false && rateResult.code === 'rate_limited',
      rateResult.ok ? 'ok' : `${rateResult.code}: ${rateResult.error}`,
    )

    // Bounded public-fact cache: second call same owner/repo does not re-fetch
    clearPublicAssessFactCache()
    const { fetchImpl, urls, authHeaderSeen } = mockPublicGithubFetch()
    const first = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'first intended use (must not enter cache key)',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
      { fetchImpl },
    )
    const callsAfterFirst = urls.length
    const second = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'second different intended use',
        environment: 'production',
        deploymentBoundary: 'external_service',
      },
      { fetchImpl },
    )
    assert('cache first assess ok', first.ok === true)
    assert('cache second assess ok', second.ok === true)
    assert(
      'cache hit does not re-call GitHub',
      urls.length === callsAfterFirst,
      `calls grew: ${callsAfterFirst} → ${urls.length}`,
    )
    assert(
      'cache stats key is owner/repo only',
      getPublicAssessFactCacheStats().keys.every(
        (k) => k === 'public-owner/public-repo',
      ),
      getPublicAssessFactCacheStats().keys.join(','),
    )
    if (first.ok && second.ok) {
      assert(
        'cache preserves distinct intendedUse on brief (not stored in facts)',
        first.brief.scope.intendedUse.includes('first') &&
          second.brief.scope.intendedUse.includes('second'),
      )
      assert(
        'cached facts exclude intendedUse string in repository object',
        !JSON.stringify(first.brief.repository).includes('first intended'),
      )
    }
    assert('cache path still no Authorization', authHeaderSeen.length === 0)

    const packed = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse:
          'Admit this coding agent to generate and review application code in development.',
        environment: 'development',
        deploymentBoundary: 'local_only',
        admissionPackId: 'coding-agent',
      },
      { fetchImpl, skipCache: true },
    )
    assert('pack assess ok', packed.ok === true, packed.ok ? '' : packed.error)
    if (packed.ok) {
      assert(
        'pack gaps on public brief',
        packed.brief.evidenceGaps.includes('agent_tool_surface'),
      )
      assert(
        'pack not a cert hint',
        packed.brief.policyHints.some((h) => /not a compliance/i.test(h)),
      )
    }
    const badPack = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'Evaluate fixture',
        environment: 'development',
        deploymentBoundary: 'local_only',
        admissionPackId: 'nope',
      },
      { fetchImpl, skipCache: true },
    )
    assert(
      'unknown pack schema error',
      badPack.ok === false && badPack.code === 'schema',
    )

    // Cache does not absorb private/redacted input into GitHub calls
    clearPublicAssessFactCache()
    const { fetchImpl: f2, urls: u2 } = mockPublicGithubFetch()
    const redacted = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'password=should-not-fetch',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
      { fetchImpl: f2 },
    )
    assert(
      'redaction still blocks before cache/fetch',
      redacted.ok === false && redacted.code === 'redaction',
    )
    assert('redaction still zero GitHub calls', u2.length === 0)
    assert(
      'redaction does not create cache entry',
      getPublicAssessFactCacheStats().size === 0,
    )
  }

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
