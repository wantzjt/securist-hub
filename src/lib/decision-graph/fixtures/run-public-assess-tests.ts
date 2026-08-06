/**
 * Public assess fixtures (WO-010 fixup).
 * Proves: no privileged GitHub Authorization header, runtime validation,
 * ephemeral contract shape, no Decision Graph / tenant / Postgres writes.
 */
import {
  assessPublicGithubRepo,
  parsePublicGithubUrl,
  validatePublicRepoAssessInput,
} from '../../public-repo-assess'
import type { AssessFetch } from '../../public-repo-assess'

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
      return new Response(JSON.stringify({ tag_name: 'v1.0.0', published_at: '2026-01-01T00:00:00Z' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
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
    if (url.endsWith('/repos/public-owner/public-repo') || url.includes('/repos/public-owner/public-repo?')) {
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
      repositoryUrl: 'https://github.com/a/b?token=ghp_abcdefghijklmnopqrstuvwxyz012345',
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
    assert('non-root GitHub URL → invalid_url', !r.ok && r.code === 'invalid_url')
  }
  {
    const r = parsePublicGithubUrl('https://github.com/owner/repo')
    assert(
      'valid URL parses',
      !('error' in r) && r.owner === 'owner' && r.repo === 'repo',
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
      assert('kind public_decision_brief', brief.kind === 'public_decision_brief')
      assert('durable false', brief.durable === false)
      assert(
        'persistence ephemeral_client_only',
        brief.persistence === 'ephemeral_client_only',
      )
      assert('label LIVE', brief.label === 'LIVE')
      assert('decisionStatus not_reviewed', brief.decisionStatus === 'not_reviewed')
      assert(
        'observed facts present',
        brief.observed.length > 0 &&
          brief.observed.every((o) => Boolean(o.source) && Boolean(o.verification)),
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
      { repositoryUrl: true, intendedUse: 'x', environment: 'development', deploymentBoundary: 'local_only' },
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
          r.ok === false && typeof r.code === 'string' && typeof r.error === 'string',
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

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
