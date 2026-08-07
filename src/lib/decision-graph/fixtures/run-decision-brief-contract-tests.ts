/**
 * Contract-shape fixtures: Decision Brief honesty, public vs local separation,
 * and provenance/MCP rules (labels ≠ digests; deterministic_only model honesty).
 */
import type { LocalDecisionBriefV1 } from '../../../../packages/contracts/src/local-assess'
import type { PublicDecisionBriefV1 } from '../../../../packages/contracts/src/public-assess'
import {
  LOCAL_DEFAULT_COMPONENT_LABELS_V1,
  LOCAL_MCP_FORBIDDEN_V1,
  LOCAL_MCP_TOOLS_V1,
  assertLocalProvenanceHonesty,
  componentContentVerified,
  componentNotUsed,
  toLocalMcpRunMetadata,
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

const FAKE_SHA =
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const FAKE_SHA_B =
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const FAKE_SHA_C =
  'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'

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

/** deterministic_only: model components must be not_used (labels alone are not digests). */
function sampleLocalDeterministic(): LocalDecisionBriefV1 {
  const labels = LOCAL_DEFAULT_COMPONENT_LABELS_V1
  const provenance = {
    runtime: componentContentVerified(labels.runtime, FAKE_SHA),
    baseModel: componentNotUsed(labels.baseModel),
    adapter: componentNotUsed(labels.adapter),
    tacticPack: componentNotUsed(labels.tacticPack),
    policyPack: componentNotUsed(labels.policyPack),
  }
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
    provenance,
    synthesis: 'deterministic_only' as const,
    synthesisNote: 'Manifest collection only; model pack not used',
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
  const loc = sampleLocalDeterministic() as {
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
    synthesis: string
    provenance: LocalDecisionBriefV1['provenance']
  }
  assert('public kind', pub.kind === 'public_decision_brief')
  assert(
    'public persistence ephemeral_client_only',
    pub.persistence === 'ephemeral_client_only',
  )
  assert('local kind', loc.kind === 'local_decision_brief')
  assert('local persistence local_only', loc.persistence === 'local_only')
  assert(
    'local shareability never_automatic',
    loc.shareability === 'never_automatic',
  )
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
    assert(
      `${name} has observed source`,
      brief.observed.every((o) => Boolean(o.source)),
    )
    assert(
      `${name} has observed verification`,
      brief.observed.every((o) => Boolean(o.verification)),
    )
    assert(`${name} has unknowns`, brief.unknowns.length > 0)
    assert(`${name} has evidenceGaps`, brief.evidenceGaps.length > 0)
    assert(`${name} has policyHints`, brief.policyHints.length > 0)
  }

  console.log('\n[local default output privacy]')
  assert('local rootLabel is .', loc.repository.rootLabel === '.')
  assert(
    'local draft has no absolute path strings',
    !hasAbsolutePath(loc.draftJson) &&
      !hasAbsolutePath(loc.repository.displayName),
  )
  assert(
    'local observed sources are not absolute paths',
    loc.observed.every((o) => !hasAbsolutePath(o.source || '')),
  )

  console.log('\n[provenance — labels are not digests]')
  const labels = LOCAL_DEFAULT_COMPONENT_LABELS_V1
  assert(
    'default labels include gpt-oss product name (label only)',
    labels.baseModel.includes('gpt-oss'),
  )
  const detCheck = assertLocalProvenanceHonesty(
    'deterministic_only',
    loc.provenance,
  )
  assert(
    'deterministic_only sample provenance ok',
    detCheck.ok === true,
    detCheck.ok ? '' : detCheck.error,
  )
  if (detCheck.ok) {
    assert('deterministic_only modelUsed false', detCheck.modelUsed === false)
  }
  assert(
    'deterministic baseModel not_used',
    loc.provenance.baseModel.used === false &&
      loc.provenance.baseModel.contentDigest === null &&
      loc.provenance.baseModel.verification === 'not_used',
  )
  assert(
    'deterministic adapter not_used',
    loc.provenance.adapter.used === false &&
      loc.provenance.adapter.contentDigest === null,
  )
  assert(
    'deterministic may still show product labels without proving use',
    loc.provenance.baseModel.label === labels.baseModel &&
      !loc.provenance.baseModel.used,
  )
  assert(
    'runtime used has real contentDigest hex',
    loc.provenance.runtime.used === true &&
      loc.provenance.runtime.contentDigest?.hex === FAKE_SHA,
  )

  // Reject label-as-digest / false model claim on deterministic_only
  const badDet = assertLocalProvenanceHonesty('deterministic_only', {
    runtime: componentContentVerified(labels.runtime, FAKE_SHA),
    baseModel: componentContentVerified(labels.baseModel, FAKE_SHA_B),
    adapter: componentContentVerified(labels.adapter, FAKE_SHA_C),
    tacticPack: componentNotUsed(labels.tacticPack),
    policyPack: componentNotUsed(labels.policyPack),
  })
  assert(
    'deterministic_only rejects used model components',
    badDet.ok === false,
  )

  const usedWithoutDigest = assertLocalProvenanceHonesty('deterministic_only', {
    runtime: {
      label: labels.runtime,
      contentDigest: null,
      used: true,
      verification: 'content_verified',
    },
    baseModel: componentNotUsed(labels.baseModel),
    adapter: componentNotUsed(labels.adapter),
    tacticPack: componentNotUsed(labels.tacticPack),
    policyPack: componentNotUsed(labels.policyPack),
  })
  assert(
    'used=true without contentDigest rejected',
    usedWithoutDigest.ok === false,
  )

  const packOk = assertLocalProvenanceHonesty('tarx_model_pack', {
    runtime: componentContentVerified(labels.runtime, FAKE_SHA),
    baseModel: componentContentVerified(labels.baseModel, FAKE_SHA_B),
    adapter: componentContentVerified(labels.adapter, FAKE_SHA_C),
    tacticPack: componentContentVerified(labels.tacticPack, FAKE_SHA),
    policyPack: componentContentVerified(labels.policyPack, FAKE_SHA_B),
  })
  assert(
    'tarx_model_pack with content digests ok',
    packOk.ok === true && 'modelUsed' in packOk && packOk.modelUsed === true,
  )

  const packMissingModel = assertLocalProvenanceHonesty('tarx_model_pack', {
    runtime: componentContentVerified(labels.runtime, FAKE_SHA),
    baseModel: componentNotUsed(labels.baseModel),
    adapter: componentNotUsed(labels.adapter),
    tacticPack: componentNotUsed(labels.tacticPack),
    policyPack: componentNotUsed(labels.policyPack),
  })
  assert(
    'tarx_model_pack without model digests rejected',
    packMissingModel.ok === false,
  )

  console.log('\n[MCP allowlist + run metadata honesty]')
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

  const meta = toLocalMcpRunMetadata(sampleLocalDeterministic())
  const metaOk = !('ok' in meta)
  assert('get_run_metadata succeeds for deterministic_only', metaOk)
  if (metaOk) {
    assert('metadata modelUsed false', meta.modelUsed === false)
    assert(
      'metadata synthesis deterministic_only',
      meta.synthesis === 'deterministic_only',
    )
    assert(
      'metadata baseModel unused',
      meta.provenance.baseModel.used === false &&
        meta.provenance.baseModel.contentDigest === null,
    )
    assert(
      'metadata keeps labels separate from digests',
      meta.provenance.baseModel.label === labels.baseModel &&
        meta.provenance.runtime.contentDigest?.hex === FAKE_SHA,
    )
  }

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
