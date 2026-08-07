/**
 * Contract-shape fixtures for Decision Brief honesty + public vs local separation.
 * Spec/filing support for WO-012 — not operator runtime implementation.
 */
import type { LocalDecisionBriefV1 } from '../../../../packages/contracts/src/local-assess'
import type { PublicDecisionBriefV1 } from '../../../../packages/contracts/src/public-assess'
import {
  LOCAL_DEFAULT_DIGESTS_V1,
  LOCAL_MCP_FORBIDDEN_V1,
  LOCAL_MCP_TOOLS_V1,
} from '../../../../packages/contracts/src/local-assess'

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

function samplePublic(): PublicDecisionBriefV1 {
  const core = {
    contractVersion: '1' as const,
    kind: 'public_decision_brief' as const,
    durable: false as const,
    persistence: 'ephemeral_client_only' as const,
    label: 'LIVE' as const,
    decisionStatus: 'not_reviewed' as const,
    repository: {
      owner: 'o',
      name: 'r',
      fullName: 'o/r',
      htmlUrl: 'https://github.com/o/r',
      description: null,
      defaultBranch: 'main',
      visibility: 'public' as const,
      language: 'TypeScript',
      licenseSpdx: 'Apache-2.0',
      licenseName: 'Apache',
      pushedAt: null,
      updatedAt: null,
      archived: false,
      fork: false,
      topics: [] as string[],
      latestReleaseTag: null,
      latestReleasePublishedAt: null,
      headSha: 'abc',
      packageName: null,
      packageVersion: null,
    },
    scope: {
      intendedUse: 'demo',
      environment: 'development' as const,
      deploymentBoundary: 'local_only' as const,
    },
    observed: [
      {
        domain: 'provenance',
        assertion: 'Public repo observed',
        verification: 'observed' as const,
        source: 'github:api:repos/o/r',
      },
    ],
    unknowns: ['No pentest'],
    evidenceGaps: ['security'],
    reReviewTriggers: ['New release'],
    policyHints: ['Non-authoritative policy hint'],
    disclaimers: ['Public only'],
    fetchedAt: new Date().toISOString(),
  }
  return { ...core, draftJson: JSON.stringify(core) }
}

function sampleLocal(): LocalDecisionBriefV1 {
  const core = {
    contractVersion: '1' as const,
    kind: 'local_decision_brief' as const,
    durable: false as const,
    persistence: 'local_only' as const,
    shareability: 'never_automatic' as const,
    visibility: 'local_only' as const,
    label: 'LIVE' as const,
    decisionStatus: 'not_reviewed' as const,
    repository: {
      displayName: 'fixture-pkg',
      rootLabel: '.' as const,
      manifestFingerprint: 'sha256:deadbeef',
      primaryLanguage: 'TypeScript',
      packageName: 'fixture-pkg',
      packageVersion: '0.0.1',
      licenseSpdx: 'MIT',
    },
    scope: {
      intendedUse: 'local engineering review',
      environment: 'development' as const,
      deploymentBoundary: 'local_only' as const,
    },
    observed: [
      {
        domain: 'provenance',
        assertion: 'Root package.json name observed (relative collection)',
        verification: 'observed' as const,
        source: 'manifest:package.json',
      },
    ],
    unknowns: ['No SCA performed'],
    evidenceGaps: ['security'],
    reReviewTriggers: ['Manifest fingerprint change'],
    policyHints: ['Non-authoritative; not an approval'],
    disclaimers: ['Local only; never automatically shareable'],
    digests: { ...LOCAL_DEFAULT_DIGESTS_V1 },
    synthesis: 'deterministic_only' as const,
    synthesisNote: 'Doctor not run in contract fixture',
    assessedAt: new Date().toISOString(),
  }
  return { ...core, draftJson: JSON.stringify(core) }
}

function hasAbsolutePath(s: string): boolean {
  return (
    /\/Users\/|\/home\/|C:\\\\|file:\/\//i.test(s) ||
    (s.startsWith('/') && s.length > 1 && !s.startsWith('/repos/'))
  )
}

function main() {
  console.log('Decision Brief contract fixtures (WO-012 filing)\n')

  console.log('[public vs local separation]')
  const pub = samplePublic() as {
    kind: string
    persistence: string
    durable: boolean
    observed: Array<{ source?: string; verification?: string }>
    unknowns: string[]
    evidenceGaps: string[]
    policyHints: string[]
  }
  const loc = sampleLocal() as {
    kind: string
    persistence: string
    shareability: string
    visibility: string
    durable: boolean
    draftJson: string
    repository: { rootLabel: string; displayName: string }
    observed: Array<{ source?: string; verification?: string }>
    unknowns: string[]
    evidenceGaps: string[]
    policyHints: string[]
    digests: { runtime: string; adapter: string; tacticPack: string }
  }
  assert('public kind', pub.kind === 'public_decision_brief')
  assert('public persistence ephemeral_client_only', pub.persistence === 'ephemeral_client_only')
  assert('local kind', loc.kind === 'local_decision_brief')
  assert('local persistence local_only', loc.persistence === 'local_only')
  assert('local shareability never_automatic', loc.shareability === 'never_automatic')
  assert('local visibility local_only', loc.visibility === 'local_only')
  assert('kinds differ', pub.kind !== loc.kind)
  assert('persistences differ', pub.persistence !== loc.persistence)
  assert(
    'must not treat local as public kind',
    loc.kind !== 'public_decision_brief',
  )

  console.log('\n[honesty envelope]')
  for (const [name, brief] of [
    ['public', pub],
    ['local', loc],
  ] as const) {
    assert(`${name} durable false`, brief.durable === false)
    assert(`${name} has observed source`, brief.observed.every((o) => Boolean(o.source)))
    assert(
      `${name} has observed verification`,
      brief.observed.every((o) => Boolean(o.verification)),
    )
    assert(`${name} has unknowns`, brief.unknowns.length > 0)
    assert(`${name} has evidenceGaps`, brief.evidenceGaps.length > 0)
    assert(`${name} has policyHints`, brief.policyHints.length > 0)
  }

  console.log('\n[local default output privacy]')
  const localJson = loc.draftJson
  assert('local rootLabel is .', loc.repository.rootLabel === '.')
  assert(
    'local draft has no absolute path strings',
    !hasAbsolutePath(localJson) && !hasAbsolutePath(loc.repository.displayName),
  )
  assert(
    'local observed sources are not absolute paths',
    loc.observed.every((o) => !hasAbsolutePath(o.source || '')),
  )
  assert(
    'local digests recorded',
    Boolean(loc.digests.runtime && loc.digests.adapter && loc.digests.tacticPack),
  )

  console.log('\n[MCP allowlist constants]')
  assert(
    'allowed tools',
    LOCAL_MCP_TOOLS_V1.includes('get_brief') &&
      LOCAL_MCP_TOOLS_V1.includes('list_gaps') &&
      LOCAL_MCP_TOOLS_V1.includes('get_run_metadata'),
  )
  assert(
    'forbidden includes path/source/approve/execute',
    LOCAL_MCP_FORBIDDEN_V1.includes('read_path') &&
      LOCAL_MCP_FORBIDDEN_V1.includes('read_source') &&
      LOCAL_MCP_FORBIDDEN_V1.includes('approve') &&
      LOCAL_MCP_FORBIDDEN_V1.includes('execute') &&
      LOCAL_MCP_FORBIDDEN_V1.includes('external_write'),
  )
  assert(
    'allowlist and forbidden disjoint',
    LOCAL_MCP_TOOLS_V1.every(
      (t) => !(LOCAL_MCP_FORBIDDEN_V1 as readonly string[]).includes(t),
    ),
  )

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
