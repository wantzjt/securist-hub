/**
 * Local Operator assessment contract (WO-012).
 *
 * Private, local evidence from manifests/config inside the user boundary.
 * NOT PublicDecisionBriefV1 — that type is public/share-safe and must not be
 * reused for local repository paths, dependency names, or internal intent.
 *
 * Provenance distinction (anti–evidence-theater):
 * - available: a pack/runtime is installed
 * - verified: signature + content digest were checked
 * - used: this exact component participated in this run
 *
 * Identifiers like `tarx-runtime-v1` or `gpt-oss-20b` are component IDs /
 * expected defaults — never cryptographic digests.
 *
 * deterministic_only: model and adapter provenance fields are null (not default IDs).
 */

import type {
  DecisionBriefHonestyV1,
  DecisionBriefObservedFactV1,
} from './decision-brief'

/** Minimized repository identity — no absolute paths. */
export type LocalRepositoryIdentityV1 = {
  displayName: string
  rootLabel: '.'
  manifestFingerprint: string | null
  primaryLanguage: string | null
  packageName: string | null
  packageVersion: string | null
  licenseSpdx: string | null
}

export type LocalAssessScopeV1 = {
  /** Must be secret-redacted before brief/MCP output */
  intendedUse: string
  environment: 'research' | 'development' | 'staging' | 'production'
  deploymentBoundary: 'local_only' | 'controlled_cloud' | 'external_service'
}

/** Cryptographic content digest of artifact bytes — never a product ID string. */
export type ContentDigestV1 = {
  algorithm: 'sha256'
  /** Lowercase hex, no algorithm prefix */
  hex: string
}

export type SignatureStatusV1 =
  | 'verified'
  | 'unavailable'
  | 'invalid'
  | 'not_applicable'

/**
 * available: installed (may or may not be verified/used)
 * verified is expressed via signatureStatus + contentDigest, not this enum alone
 * used: participated in this run
 */
export type UseStatusV1 = 'used' | 'available_not_used' | 'unavailable'

/**
 * Explicit run provenance for one component.
 * componentId + version are identifiers, not digests.
 */
export type ComponentProvenanceV1 = {
  /** Product/component identifier (e.g. tarx-runtime). Not a digest. */
  componentId: string
  /** Mutable version string (e.g. v1, 20b). Not a digest. */
  version: string
  /** sha256 of bytes when verified or used; null when unavailable / not applicable */
  contentDigest: ContentDigestV1 | null
  signerKeyId: string | null
  signatureStatus: SignatureStatusV1
  useStatus: UseStatusV1
}

/**
 * Per-run provenance.
 * For deterministic_only: baseModel and adapter MUST be null
 * (not default component IDs, not available_not_used placeholders).
 */
export type LocalRunProvenanceV1 = {
  runtime: ComponentProvenanceV1
  baseModel: ComponentProvenanceV1 | null
  adapter: ComponentProvenanceV1 | null
  tacticPack: ComponentProvenanceV1 | null
  policyPack: ComponentProvenanceV1 | null
}

/** @deprecated Removed string digest map — use LocalRunProvenanceV1. */
export type LocalRunDigestsV1 = never

/**
 * Doctor / capability gate (precise synthesis state).
 * - runtime_verified: trusted signed operator/runtime identity ok; assess may run
 * - runtime_unavailable: no trustworthy runtime identity; assess blocked
 * - synthesis_verified: signed TARX pack may synthesize
 * - synthesis_unavailable: runtime ok but model synthesis not available; deterministic assess may run
 * - signature_invalid: integrity signature failed; synthesis and assess blocked
 */
export type LocalCapabilityStateV1 =
  | 'runtime_verified'
  | 'runtime_unavailable'
  | 'synthesis_verified'
  | 'synthesis_unavailable'
  | 'signature_invalid'

/** What this brief's synthesis path actually used. */
export type LocalSynthesisModeV1 =
  | 'deterministic_only'
  | 'tarx_model_pack'

/** WO-012 MCP transport: local stdio only — not HTTP/remote. */
export type LocalMcpTransportV1 = 'stdio_local'

export const LOCAL_MCP_EGRESS_WARNING_V1 =
  'Securist defaults to local stdio MCP. A user-selected MCP client (e.g. cloud-backed IDE agent) may transmit returned summaries externally. Briefs remain classified local_only / never_automatic.' as const

/**
 * Every MCP response envelope — data-egress boundary honesty.
 */
export type LocalMcpEnvelopeV1<T> = {
  visibility: 'local_only'
  shareability: 'never_automatic'
  transport: LocalMcpTransportV1
  egressWarning: typeof LOCAL_MCP_EGRESS_WARNING_V1
  data: T
}

export type LocalMcpRunMetadataV1 = {
  contractVersion: '1'
  capability: LocalCapabilityStateV1
  synthesis: LocalSynthesisModeV1
  synthesisNote: string
  /**
   * True only when synthesis is tarx_model_pack AND baseModel/adapter are
   * non-null with useStatus used, signature verified, and contentDigest set.
   * Always false for deterministic_only.
   */
  modelUsed: boolean
  provenance: LocalRunProvenanceV1
  assessedAt: string
}

export type LocalDecisionBriefV1 = DecisionBriefHonestyV1 & {
  kind: 'local_decision_brief'
  persistence: 'local_only'
  shareability: 'never_automatic'
  visibility: 'local_only'
  repository: LocalRepositoryIdentityV1
  scope: LocalAssessScopeV1
  observed: DecisionBriefObservedFactV1[]
  provenance: LocalRunProvenanceV1
  /** Doctor/capability outcome for this run */
  capability: LocalCapabilityStateV1
  synthesis: LocalSynthesisModeV1
  synthesisNote: string
  assessedAt: string
  draftJson: string
}

export type LocalRepoAssessResultV1 =
  | { ok: true; brief: LocalDecisionBriefV1 }
  | { ok: false; code: string; error: string }

export const LOCAL_MCP_TOOLS_V1 = [
  'get_brief',
  'list_gaps',
  'get_run_metadata',
] as const

export type LocalMcpToolV1 = (typeof LOCAL_MCP_TOOLS_V1)[number]

export const LOCAL_MCP_FORBIDDEN_V1 = [
  'read_source',
  'read_path',
  'list_files',
  'approve',
  'exploit',
  'execute',
  'install',
  'build',
  'shell',
  'external_write',
  'open_issue',
  'open_pr',
] as const

/**
 * Expected component IDs / versions for packaging and docs.
 * These are identifiers — NEVER digests and NEVER proof of use.
 */
export const LOCAL_EXPECTED_COMPONENT_IDS_V1 = {
  runtime: { componentId: 'tarx-runtime', version: 'v1' },
  baseModel: { componentId: 'openai/gpt-oss-20b', version: '20b' },
  adapter: { componentId: 'tarx-securist-operator', version: 'v1' },
  tacticPack: { componentId: 'securist-core', version: 'v1' },
  policyPack: { componentId: 'securist-default', version: 'v1' },
} as const

/** @deprecated Use LOCAL_EXPECTED_COMPONENT_IDS_V1 — not digests. */
export const LOCAL_DEFAULT_COMPONENT_LABELS_V1 = {
  runtime: 'tarx-runtime-v1',
  baseModel: 'openai/gpt-oss-20b',
  adapter: 'tarx-securist-operator-v1',
  tacticPack: 'securist-core-v1',
  policyPack: 'securist-default-v1',
} as const

/** @deprecated Removed — identifiers are not digests. */
export const LOCAL_DEFAULT_DIGESTS_V1 = LOCAL_DEFAULT_COMPONENT_LABELS_V1

const SECRET_LIKE =
  /-----BEGIN |api[_-]?key|password=|ghp_[A-Za-z0-9]|gho_[A-Za-z0-9]|github_pat_[A-Za-z0-9_]|sk-[A-Za-z0-9]|\/Users\/|C:\\\\|file:\/\//i

/**
 * Reject or flag secret-like intended-use / config before brief or MCP output.
 */
export function validateLocalBriefTextInput(
  field: string,
  value: string,
): { ok: true; value: string } | { ok: false; code: 'redaction'; error: string } {
  if (typeof value !== 'string') {
    return { ok: false, code: 'redaction', error: `${field} must be a string` }
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, code: 'redaction', error: `${field} is required` }
  }
  if (trimmed.length > 500) {
    return {
      ok: false,
      code: 'redaction',
      error: `${field} exceeds 500 characters`,
    }
  }
  if (SECRET_LIKE.test(trimmed)) {
    return {
      ok: false,
      code: 'redaction',
      error: `${field} appears to contain private or sensitive material; do not enter secrets, keys, paths, or private data`,
    }
  }
  return { ok: true, value: trimmed }
}

function isSha256Hex(hex: string): boolean {
  return /^[0-9a-f]{64}$/.test(hex)
}

export function componentUsedVerified(input: {
  componentId: string
  version: string
  contentDigestHex: string
  signerKeyId: string
}): ComponentProvenanceV1 {
  return {
    componentId: input.componentId,
    version: input.version,
    contentDigest: {
      algorithm: 'sha256',
      hex: input.contentDigestHex.toLowerCase(),
    },
    signerKeyId: input.signerKeyId,
    signatureStatus: 'verified',
    useStatus: 'used',
  }
}

export function componentAvailableNotUsed(input: {
  componentId: string
  version: string
  contentDigestHex?: string
  signerKeyId?: string
  signatureStatus?: SignatureStatusV1
}): ComponentProvenanceV1 {
  const digest = input.contentDigestHex
    ? {
        algorithm: 'sha256' as const,
        hex: input.contentDigestHex.toLowerCase(),
      }
    : null
  return {
    componentId: input.componentId,
    version: input.version,
    contentDigest: digest,
    signerKeyId: input.signerKeyId ?? null,
    signatureStatus: input.signatureStatus ?? (digest ? 'verified' : 'unavailable'),
    useStatus: 'available_not_used',
  }
}

function validateComponent(
  key: string,
  c: ComponentProvenanceV1,
  opts: { requireUsed: boolean },
): { ok: true } | { ok: false; code: string; error: string } {
  if (!c.componentId.trim() || !c.version.trim()) {
    return {
      ok: false,
      code: 'provenance',
      error: `${key}: componentId and version are required identifiers`,
    }
  }
  // IDs must not be mistaken for digests
  if (c.componentId.length === 64 && isSha256Hex(c.componentId.toLowerCase())) {
    return {
      ok: false,
      code: 'provenance',
      error: `${key}: put hashes in contentDigest, not componentId`,
    }
  }
  if (c.useStatus === 'used') {
    if (c.signatureStatus !== 'verified' || !c.contentDigest) {
      return {
        ok: false,
        code: 'provenance',
        error: `${key}: useStatus=used requires signatureStatus=verified and contentDigest`,
      }
    }
    if (!isSha256Hex(c.contentDigest.hex)) {
      return {
        ok: false,
        code: 'provenance',
        error: `${key}: contentDigest.hex must be lowercase 64-char sha256`,
      }
    }
    if (!c.signerKeyId) {
      return {
        ok: false,
        code: 'provenance',
        error: `${key}: useStatus=used requires signerKeyId`,
      }
    }
  }
  if (c.useStatus !== 'used' && opts.requireUsed) {
    return {
      ok: false,
      code: 'provenance',
      error: `${key}: must be used for this synthesis mode`,
    }
  }
  if (c.signatureStatus === 'invalid' && c.useStatus === 'used') {
    return {
      ok: false,
      code: 'provenance',
      error: `${key}: invalid signature cannot be used`,
    }
  }
  return { ok: true }
}

/**
 * Provenance honesty (WO-012 P1):
 * 1. componentId/version are identifiers — not digests.
 * 2. contentDigest is actual sha256 when verified/used.
 * 3. deterministic_only ⇒ baseModel and adapter are null (no default IDs).
 * 4. tarx_model_pack ⇒ model+adapter used with verified signature + digest.
 * 5. signature_invalid capability blocks model synthesis (no fallback).
 * 6. version/IDs alone never suffice as provenance.
 */
export function assertLocalProvenanceHonesty(
  capability: LocalCapabilityStateV1,
  synthesis: LocalSynthesisModeV1,
  provenance: LocalRunProvenanceV1,
): { ok: true; modelUsed: boolean } | { ok: false; code: string; error: string } {
  if (capability === 'signature_invalid' && synthesis === 'tarx_model_pack') {
    return {
      ok: false,
      code: 'provenance',
      error:
        'signature_invalid blocks model synthesis; never fall back to unsigned or cloud',
    }
  }

  const runtimeCheck = validateComponent('runtime', provenance.runtime, {
    requireUsed: true,
  })
  if (!runtimeCheck.ok) return runtimeCheck
  if (provenance.runtime.useStatus !== 'used') {
    return {
      ok: false,
      code: 'provenance',
      error: 'runtime must be used with verified contentDigest for any assess run',
    }
  }

  if (synthesis === 'deterministic_only') {
    if (provenance.baseModel !== null || provenance.adapter !== null) {
      return {
        ok: false,
        code: 'provenance',
        error:
          'deterministic_only requires baseModel and adapter to be null (not default IDs)',
      }
    }
    // tactic/policy optional; if present must not claim used unless verified
    for (const key of ['tacticPack', 'policyPack'] as const) {
      const c = provenance[key]
      if (c) {
        const r = validateComponent(key, c, { requireUsed: false })
        if (!r.ok) return r
      }
    }
    return { ok: true, modelUsed: false }
  }

  // tarx_model_pack
  if (capability !== 'synthesis_verified') {
    return {
      ok: false,
      code: 'provenance',
      error: 'tarx_model_pack requires capability synthesis_verified',
    }
  }
  if (!provenance.baseModel || !provenance.adapter) {
    return {
      ok: false,
      code: 'provenance',
      error: 'tarx_model_pack requires non-null baseModel and adapter provenance',
    }
  }
  for (const key of ['baseModel', 'adapter'] as const) {
    const c = provenance[key]!
    const r = validateComponent(key, c, { requireUsed: true })
    if (!r.ok) return r
    if (c.useStatus !== 'used') {
      return {
        ok: false,
        code: 'provenance',
        error: `${key}: must be useStatus=used with contentDigest for model-pack synthesis`,
      }
    }
  }
  for (const key of ['tacticPack', 'policyPack'] as const) {
    const c = provenance[key]
    if (!c) {
      return {
        ok: false,
        code: 'provenance',
        error: `tarx_model_pack requires ${key} provenance`,
      }
    }
    const r = validateComponent(key, c, { requireUsed: true })
    if (!r.ok) return r
  }
  return { ok: true, modelUsed: true }
}

export function wrapLocalMcpResponse<T>(data: T): LocalMcpEnvelopeV1<T> {
  return {
    visibility: 'local_only',
    shareability: 'never_automatic',
    transport: 'stdio_local',
    egressWarning: LOCAL_MCP_EGRESS_WARNING_V1,
    data,
  }
}

export function toLocalMcpRunMetadata(
  brief: Pick<
    LocalDecisionBriefV1,
    | 'capability'
    | 'synthesis'
    | 'synthesisNote'
    | 'provenance'
    | 'assessedAt'
  >,
):
  | LocalMcpEnvelopeV1<LocalMcpRunMetadataV1>
  | { ok: false; code: string; error: string } {
  const check = assertLocalProvenanceHonesty(
    brief.capability,
    brief.synthesis,
    brief.provenance,
  )
  if (!check.ok) return check
  return wrapLocalMcpResponse({
    contractVersion: '1',
    capability: brief.capability,
    synthesis: brief.synthesis,
    synthesisNote: brief.synthesisNote,
    modelUsed: check.modelUsed,
    provenance: brief.provenance,
    assessedAt: brief.assessedAt,
  })
}

/** MCP get_brief payload: minimized brief + classification. */
export function toLocalMcpBriefResponse(
  brief: LocalDecisionBriefV1,
): LocalMcpEnvelopeV1<{
  brief: LocalDecisionBriefV1
  visibility: 'local_only'
  shareability: 'never_automatic'
}> {
  return wrapLocalMcpResponse({
    brief,
    visibility: 'local_only',
    shareability: 'never_automatic',
  })
}
