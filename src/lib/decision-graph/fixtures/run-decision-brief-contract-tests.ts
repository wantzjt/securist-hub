/**
 * Contract fixtures: public vs local briefs, provenance honesty,
 * deterministic_only null model/adapter, MCP stdio privacy, input redaction.
 */
import type { LocalDecisionBriefV1 } from '../../../../packages/contracts/src/local-assess'
import type { PublicDecisionBriefV1 } from '../../../../packages/contracts/src/public-assess'
import {
  LOCAL_EXPECTED_COMPONENT_IDS_V1,
  LOCAL_MCP_EGRESS_WARNING_V1,
  LOCAL_MCP_FORBIDDEN_V1,
  LOCAL_MCP_TOOLS_V1,
  assertLocalProvenanceHonesty,
  componentAvailableNotUsed,
  componentUsedVerified,
  toLocalMcpBriefResponse,
  toLocalMcpRunMetadata,
  validateLocalBriefTextInput,
  wrapLocalMcpResponse,
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

const SHA_A =
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const SHA_B =
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const SHA_C =
  'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
const SHA_D =
  'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
const SHA_E =
  'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

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

function sampleLocalDeterministic(): LocalDecisionBriefV1 {
  const ids = LOCAL_EXPECTED_COMPONENT_IDS_V1
  const provenance = {
    runtime: componentUsedVerified({
      componentId: ids.runtime.componentId,
      version: ids.runtime.version,
      contentDigestHex: SHA_A,
      signerKeyId: 'tarx-release-key-1',
    }),
    baseModel: null,
    adapter: null,
    tacticPack: null,
    policyPack: null,
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
    evidenceGaps: ['security', 'model_governance', 'crypto_agility'],
    reReviewTriggers: ['Manifest fingerprint change'],
    policyHints: ['Non-authoritative; not an approval'],
    disclaimers: ['Local only; never automatically shareable'],
    provenance,
    capability: 'synthesis_unavailable' as const,
    synthesis: 'deterministic_only' as const,
    synthesisNote:
      'Runtime verified · synthesis unavailable · deterministic assess ready',
    assessedAt: new Date().toISOString(),
  }
  return { ...core, draftJson: JSON.stringify(core) }
}

function sampleLocalModelPack(): LocalDecisionBriefV1 {
  const ids = LOCAL_EXPECTED_COMPONENT_IDS_V1
  const provenance = {
    runtime: componentUsedVerified({
      componentId: ids.runtime.componentId,
      version: ids.runtime.version,
      contentDigestHex: SHA_A,
      signerKeyId: 'tarx-release-key-1',
    }),
    baseModel: componentUsedVerified({
      componentId: ids.baseModel.componentId,
      version: ids.baseModel.version,
      contentDigestHex: SHA_B,
      signerKeyId: 'tarx-model-key-1',
    }),
    adapter: componentUsedVerified({
      componentId: ids.adapter.componentId,
      version: ids.adapter.version,
      contentDigestHex: SHA_C,
      signerKeyId: 'tarx-model-key-1',
    }),
    tacticPack: componentUsedVerified({
      componentId: ids.tacticPack.componentId,
      version: ids.tacticPack.version,
      contentDigestHex: SHA_D,
      signerKeyId: 'tarx-pack-key-1',
    }),
    policyPack: componentUsedVerified({
      componentId: ids.policyPack.componentId,
      version: ids.policyPack.version,
      contentDigestHex: SHA_E,
      signerKeyId: 'tarx-pack-key-1',
    }),
  }
  const base = sampleLocalDeterministic()
  return {
    ...base,
    provenance,
    capability: 'synthesis_verified',
    synthesis: 'tarx_model_pack',
    synthesisNote: 'Signed TARX pack synthesis used',
    draftJson: '',
  }
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
  const pub = samplePublic() as { kind: string; persistence: string }
  const loc = sampleLocalDeterministic() as {
    kind: string
    persistence: string
    shareability: string
    visibility: string
    repository: { rootLabel: string }
    draftJson: string
    provenance: LocalDecisionBriefV1['provenance']
    capability: LocalDecisionBriefV1['capability']
    synthesis: LocalDecisionBriefV1['synthesis']
  }
  assert('public kind', pub.kind === 'public_decision_brief')
  assert(
    'public persistence ephemeral',
    pub.persistence === 'ephemeral_client_only',
  )
  assert('local kind', String(loc.kind) === 'local_decision_brief')
  assert('local persistence local_only', String(loc.persistence) === 'local_only')
  assert(
    'local shareability never_automatic',
    String(loc.shareability) === 'never_automatic',
  )
  assert('local visibility local_only', String(loc.visibility) === 'local_only')
  assert('kinds differ', pub.kind !== loc.kind)

  console.log('\n[local privacy]')
  assert('rootLabel .', String(loc.repository.rootLabel) === '.')
  assert('no absolute paths in draft', !hasAbsolutePath(loc.draftJson))

  console.log('\n[1–3 provenance: IDs ≠ digests; deterministic null model]')
  const ids = LOCAL_EXPECTED_COMPONENT_IDS_V1 as {
    runtime: { componentId: string; version: string }
    baseModel: { componentId: string; version: string }
    adapter: { componentId: string; version: string }
    tacticPack: { componentId: string; version: string }
    policyPack: { componentId: string; version: string }
  }
  assert(
    'expected IDs are product identifiers',
    String(ids.runtime.componentId) === 'tarx-runtime' &&
      String(ids.baseModel.componentId).includes('gpt-oss'),
  )
  assert('deterministic baseModel null', loc.provenance.baseModel === null)
  assert('deterministic adapter null', loc.provenance.adapter === null)
  assert(
    'deterministic does not embed default model IDs',
    !JSON.stringify(loc.provenance).includes('gpt-oss'),
  )
  assert(
    'runtime used has real sha256 contentDigest',
    loc.provenance.runtime.useStatus === 'used' &&
      loc.provenance.runtime.contentDigest?.hex === SHA_A &&
      loc.provenance.runtime.signatureStatus === 'verified',
  )

  const detOk = assertLocalProvenanceHonesty(
    loc.capability,
    loc.synthesis,
    loc.provenance,
  )
  assert('deterministic provenance honesty ok', detOk.ok === true)
  if (detOk.ok) assert('deterministic modelUsed false', detOk.modelUsed === false)

  const labelsOnlyAsUsed = assertLocalProvenanceHonesty(
    'synthesis_verified',
    'tarx_model_pack',
    {
      runtime: {
        componentId: ids.runtime.componentId,
        version: ids.runtime.version,
        contentDigest: null,
        signerKeyId: null,
        signatureStatus: 'unavailable',
        useStatus: 'used',
      },
      baseModel: null,
      adapter: null,
      tacticPack: null,
      policyPack: null,
    },
  )
  assert(
    'version labels alone insufficient for used',
    labelsOnlyAsUsed.ok === false,
  )

  const detWithModelIds = assertLocalProvenanceHonesty(
    'synthesis_unavailable',
    'deterministic_only',
    {
      runtime: componentUsedVerified({
        componentId: ids.runtime.componentId,
        version: ids.runtime.version,
        contentDigestHex: SHA_A,
        signerKeyId: 'k',
      }),
      baseModel: componentAvailableNotUsed({
        componentId: ids.baseModel.componentId,
        version: ids.baseModel.version,
      }),
      adapter: componentAvailableNotUsed({
        componentId: ids.adapter.componentId,
        version: ids.adapter.version,
      }),
      tacticPack: null,
      policyPack: null,
    },
  )
  assert(
    'deterministic_only rejects non-null model/adapter fields',
    detWithModelIds.ok === false,
  )

  console.log('\n[4 model-pack requires digest + verified signature]')
  const pack = sampleLocalModelPack()
  const packOk = assertLocalProvenanceHonesty(
    pack.capability,
    pack.synthesis,
    pack.provenance,
  )
  assert('model-pack with digests+signatures ok', packOk.ok === true)
  if (packOk.ok) assert('model-pack modelUsed true', packOk.modelUsed === true)

  const packNoDigest = assertLocalProvenanceHonesty(
    'synthesis_verified',
    'tarx_model_pack',
    {
      runtime: componentUsedVerified({
        componentId: ids.runtime.componentId,
        version: ids.runtime.version,
        contentDigestHex: SHA_A,
        signerKeyId: 'k',
      }),
      baseModel: {
        componentId: ids.baseModel.componentId,
        version: ids.baseModel.version,
        contentDigest: null,
        signerKeyId: 'k',
        signatureStatus: 'verified',
        useStatus: 'used',
      },
      adapter: componentUsedVerified({
        componentId: ids.adapter.componentId,
        version: ids.adapter.version,
        contentDigestHex: SHA_C,
        signerKeyId: 'k',
      }),
      tacticPack: componentUsedVerified({
        componentId: ids.tacticPack.componentId,
        version: ids.tacticPack.version,
        contentDigestHex: SHA_D,
        signerKeyId: 'k',
      }),
      policyPack: componentUsedVerified({
        componentId: ids.policyPack.componentId,
        version: ids.policyPack.version,
        contentDigestHex: SHA_E,
        signerKeyId: 'k',
      }),
    },
  )
  assert('model-pack without model digest rejected', packNoDigest.ok === false)

  const sigInvalid = assertLocalProvenanceHonesty(
    'signature_invalid',
    'tarx_model_pack',
    pack.provenance,
  )
  assert(
    'signature_invalid blocks model synthesis (no fallback)',
    sigInvalid.ok === false,
  )

  const detStillOk = assertLocalProvenanceHonesty(
    'synthesis_unavailable',
    'deterministic_only',
    loc.provenance,
  )
  assert(
    'synthesis_unavailable still allows deterministic assess',
    detStillOk.ok === true,
  )

  console.log('\n[5 local-input redaction]')
  const clean = validateLocalBriefTextInput('intendedUse', 'local review')
  assert('clean intendedUse ok', clean.ok === true)
  const secret = validateLocalBriefTextInput(
    'intendedUse',
    'use password=supersecret for deploy',
  )
  assert(
    'secret intendedUse redaction',
    secret.ok === false && String(secret.code) === 'redaction',
  )
  const pathSecret = validateLocalBriefTextInput(
    'intendedUse',
    'scan /Users/me/private-repo',
  )
  assert('path intendedUse redaction', pathSecret.ok === false)

  console.log('\n[6 MCP privacy: stdio + classification]')
  assert(
    'MCP tools allowlist',
    LOCAL_MCP_TOOLS_V1.includes('get_brief') &&
      LOCAL_MCP_TOOLS_V1.includes('list_gaps') &&
      LOCAL_MCP_TOOLS_V1.includes('get_run_metadata'),
  )
  assert(
    'MCP forbidden',
    LOCAL_MCP_FORBIDDEN_V1.includes('read_path') &&
      LOCAL_MCP_FORBIDDEN_V1.includes('external_write'),
  )
  const env = wrapLocalMcpResponse({ hello: true }) as {
    visibility: string
    shareability: string
    transport: string
    egressWarning: string
  }
  assert('envelope visibility local_only', env.visibility === 'local_only')
  assert(
    'envelope shareability never_automatic',
    env.shareability === 'never_automatic',
  )
  assert('envelope transport stdio_local', env.transport === 'stdio_local')
  assert(
    'envelope egress warning documents client risk',
    env.egressWarning === LOCAL_MCP_EGRESS_WARNING_V1 &&
      env.egressWarning.includes('transmit'),
  )

  const meta = toLocalMcpRunMetadata(sampleLocalDeterministic())
  assert('run metadata envelope ok', !('ok' in meta))
  if (!('ok' in meta)) {
    const m = meta as {
      transport: string
      visibility: string
      data: {
        modelUsed: boolean
        capability: string
        provenance: { baseModel: unknown; adapter: unknown }
      }
    }
    assert('metadata transport stdio', m.transport === 'stdio_local')
    assert('metadata visibility local_only', m.visibility === 'local_only')
    assert('metadata modelUsed false', m.data.modelUsed === false)
    assert(
      'metadata model fields null',
      m.data.provenance.baseModel === null &&
        m.data.provenance.adapter === null,
    )
    assert(
      'metadata capability synthesis_unavailable',
      m.data.capability === 'synthesis_unavailable',
    )
  }

  const briefResp = toLocalMcpBriefResponse(sampleLocalDeterministic()) as {
    visibility: string
    shareability: string
    transport: string
    data: { visibility: string; shareability: string }
  }
  assert(
    'brief response classified local_only',
    briefResp.visibility === 'local_only' &&
      briefResp.data.visibility === 'local_only' &&
      briefResp.data.shareability === 'never_automatic' &&
      briefResp.transport === 'stdio_local',
  )

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
