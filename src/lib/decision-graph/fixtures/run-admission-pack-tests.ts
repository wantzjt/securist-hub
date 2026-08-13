/**
 * WO-031 admission pack fixtures.
 * Packs are scaffolds, not certificates. Team Graph is not live.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ADMISSION_PACK_CATALOG_VERSION,
  ADMISSION_PACK_HONESTY,
  ADMISSION_PACK_IDS,
  ADMISSION_PACK_LIST,
  ADMISSION_PACK_VERSION,
  applyAdmissionPack,
  getAdmissionPack,
  isAdmissionPackId,
} from '../../admission-packs'
import { assessPublicGithubRepo } from '../../public-repo-assess'
import type { AssessFetch } from '../../public-repo-assess'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

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
function assert(name: string, cond: boolean, detail = 'failed') {
  if (cond) ok(name)
  else fail(name, detail)
}

function read(rel: string) {
  return readFileSync(join(ROOT, rel), 'utf8')
}

function mockPublicGithubFetch(): AssessFetch {
  const fetchImpl: AssessFetch = async (input) => {
    const url = String(input)
    if (url.includes('/releases/latest')) {
      return new Response(
        JSON.stringify({
          tag_name: 'v1.0.0',
          published_at: '2026-01-01T00:00:00Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (url.includes('/commits')) {
      return new Response(JSON.stringify([{ sha: 'abc123def4567890' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.includes('/contents/package.json')) {
      const body = Buffer.from(
        JSON.stringify({ name: 'public-repo', version: '1.0.0' }),
      ).toString('base64')
      return new Response(
        JSON.stringify({ content: body, encoding: 'base64' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
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
        license: { spdx_id: 'MIT', name: 'MIT License' },
        pushed_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        archived: false,
        fork: false,
        topics: [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }
  return fetchImpl
}

function main() {
  console.log('Admission pack fixtures (WO-031)\n')

  console.log('[catalog]')
  const catalog = JSON.parse(read('ops/admission-packs/v1/catalog.json')) as {
    ids: string[]
    catalogVersion: string
    packVersion: string
    honesty: {
      notComplianceCert: boolean
      teamGraphLive: boolean
      publicNpx: boolean
      pqcHero: boolean
    }
  }
  assert('exactly three packs', catalog.ids.length === 3)
  assert(
    'ids are coding-agent, mcp-server, model-weights',
    catalog.ids.join(',') === ADMISSION_PACK_IDS.join(','),
  )
  assert(
    'catalog version matches runtime',
    catalog.catalogVersion === ADMISSION_PACK_CATALOG_VERSION,
  )
  assert(
    'pack version matches runtime',
    catalog.packVersion === ADMISSION_PACK_VERSION,
  )
  assert(
    'honesty flags',
    catalog.honesty.notComplianceCert ===
      ADMISSION_PACK_HONESTY.notComplianceCert &&
      catalog.honesty.teamGraphLive === ADMISSION_PACK_HONESTY.teamGraphLive &&
      catalog.honesty.publicNpx === ADMISSION_PACK_HONESTY.publicNpx &&
      catalog.honesty.pqcHero === ADMISSION_PACK_HONESTY.pqcHero,
  )

  console.log('\n[json snapshots match runtime]')
  for (const id of ADMISSION_PACK_IDS) {
    const rel = `ops/admission-packs/v1/${id}.json`
    assert(`${id} json exists`, existsSync(join(ROOT, rel)))
    const file = JSON.parse(read(rel)) as {
      id: string
      version: string
      class: string
    }
    const pack = getAdmissionPack(id)
    assert(`${id} json id`, file.id === id && pack?.id === id)
    assert(`${id} json version`, file.version === pack?.version)
    assert(`${id} json class`, file.class === pack?.class)
    assert(`${id} intended-use prompt`, Boolean(pack?.intendedUsePrompt))
    assert(
      `${id} checklist nonempty`,
      (pack?.evidenceChecklist.length || 0) >= 4,
    )
    assert(`${id} unknown defaults`, (pack?.unknownDefaults.length || 0) >= 3)
    assert(`${id} gap defaults`, (pack?.evidenceGapDefaults.length || 0) >= 3)
    assert(
      `${id} sample is github`,
      /github\.com/.test(pack?.sampleSources[0]?.url || ''),
    )
  }

  console.log('\n[honesty copy]')
  const blob = ADMISSION_PACK_LIST.map((p) => JSON.stringify(p)).join('\n')
  const docs =
    read('docs/ADMISSION-PACKS.md') + read('ops/admission-packs/README.md')
  const all = blob + docs
  assert('no Team Graph is live', !/Team Graph is live/i.test(all))
  assert('states Team Graph is not live', /Team Graph is not live/i.test(all))
  assert(
    'does not offer public registry install as available',
    !/npx @securist\/operator is available/i.test(all),
  )
  assert('not a compliance certification', /not a compliance/i.test(all))
  assert(
    'no PQC hero (does not claim ML-KEM for packs)',
    !/packs? (sign|negotiate|use) ML-KEM/i.test(all) &&
      /PQC|post-quantum/i.test(all),
  )

  console.log('\n[apply helper]')
  const coding = getAdmissionPack('coding-agent')
  assert(
    'get coding-agent',
    Boolean(coding) && isAdmissionPackId('coding-agent'),
  )
  if (coding) {
    const applied = applyAdmissionPack(coding, {
      unknowns: ['base unknown'],
      evidenceGaps: ['security'],
      reReviewTriggers: ['base trigger'],
      policyHints: ['base hint'],
      disclaimers: ['base disclaimer'],
    })
    assert(
      'unions coding unknowns',
      applied.unknowns.includes('base unknown') &&
        applied.unknowns.some((u) => /tool allowlist/i.test(u)),
    )
    assert(
      'unions coding gaps',
      applied.evidenceGaps.includes('security') &&
        applied.evidenceGaps.includes('agent_tool_surface'),
    )
    assert(
      'policy hint scaffold not cert',
      applied.policyHints.some(
        (h) => /scaffold only/i.test(h) && /not a compliance/i.test(h),
      ),
    )
    assert(
      'policy hint Team Graph not live',
      applied.policyHints.some((h) => /Team Graph is not live/i.test(h)),
    )
  }

  console.log('\n[public assess wiring]')
  return (async () => {
    const fetchImpl = mockPublicGithubFetch()
    const withPack = await assessPublicGithubRepo(
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
    assert(
      'assess with pack ok',
      withPack.ok === true,
      withPack.ok ? '' : withPack.error,
    )
    if (withPack.ok) {
      assert(
        'pack gaps on brief',
        withPack.brief.evidenceGaps.includes('agent_tool_surface'),
      )
      assert(
        'pack unknown on brief',
        withPack.brief.unknowns.some((u) => /tool allowlist/i.test(u)),
      )
      assert(
        'pack policy hint',
        withPack.brief.policyHints.some((h) => /coding-agent@1\.0\.0/i.test(h)),
      )
    }

    const bad = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'Evaluate fixture',
        environment: 'development',
        deploymentBoundary: 'local_only',
        admissionPackId: 'not-a-pack',
      },
      { fetchImpl, skipCache: true },
    )
    assert(
      'unknown pack id is schema error',
      bad.ok === false && bad.code === 'schema',
    )

    const none = await assessPublicGithubRepo(
      {
        repositoryUrl: 'https://github.com/public-owner/public-repo',
        intendedUse: 'Evaluate fixture',
        environment: 'development',
        deploymentBoundary: 'local_only',
      },
      { fetchImpl, skipCache: true },
    )
    assert('assess without pack still ok', none.ok === true)
    if (none.ok) {
      assert(
        'generic path has no pack policy hint',
        !none.brief.policyHints.some((h) => /Admission pack /i.test(h)),
      )
    }

    console.log(`\n${passed}/${passed + failed} passed`)
    if (failed > 0) process.exit(1)
  })()
}

void main()
