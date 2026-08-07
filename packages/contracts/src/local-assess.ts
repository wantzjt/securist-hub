/**
 * Local Operator assessment contract (WO-012).
 *
 * Private, local evidence from manifests/config inside the user boundary.
 * NOT PublicDecisionBriefV1 — that type is public/share-safe and must not be
 * reused for local repository paths, dependency names, or internal intent.
 *
 * Default output: no raw source, no secret values, no absolute local paths.
 * Sharing requires an explicit future export/redaction action (out of WO-012).
 *
 * Provenance: content digests prove bytes used. Mutable product labels
 * (e.g. "gpt-oss-20b", "tarx-runtime-v1") are never digests and never prove
 * a model or pack was used.
 */

import type {
  DecisionBriefHonestyV1,
  DecisionBriefObservedFactV1,
} from './decision-brief'

/** Minimized repository identity — no absolute paths. */
export type LocalRepositoryIdentityV1 = {
  /** Basename or declared package name only */
  displayName: string
  /** Relative root marker e.g. "." — never /Users/... or absolute */
  rootLabel: '.'
  /** Optional content-addressed fingerprint of selected manifests (not path) */
  manifestFingerprint: string | null
  primaryLanguage: string | null
  packageName: string | null
  packageVersion: string | null
  licenseSpdx: string | null
}

export type LocalAssessScopeV1 = {
  intendedUse: string
  environment: 'research' | 'development' | 'staging' | 'production'
  deploymentBoundary: 'local_only' | 'controlled_cloud' | 'external_service'
}

/** Cryptographic content digest of artifact bytes — not a product version string. */
export type ContentDigestV1 = {
  algorithm: 'sha256'
  /** Lowercase hex, no algorithm prefix */
  hex: string
}

/**
 * Verification of a run component.
 * - content_verified: digest of loaded bytes recorded (and signature checked when required)
 * - not_used: component did not participate in this run
 * - unavailable: expected but not present / could not hash
 * - failed: verification or signature check failed
 */
export type ProvenanceVerificationV1 =
  | 'content_verified'
  | 'not_used'
  | 'unavailable'
  | 'failed'

/**
 * Provenance for one runtime component.
 * `label` is human/product identity only — never treat as a content digest.
 */
export type ComponentProvenanceV1 = {
  /** Mutable product/version label for display only (e.g. tarx-runtime-v1). Not proof. */
  label: string
  /**
   * Content digest of bytes actually loaded for this run.
   * null when not_used, unavailable, or failed without a trustworthy digest.
   */
  contentDigest: ContentDigestV1 | null
  /** True only if this component was loaded and participated in the run. */
  used: boolean
  verification: ProvenanceVerificationV1
}

/**
 * Per-run provenance for Operator components.
 * Replaces string “digest” maps that confused labels with content digests.
 */
export type LocalRunProvenanceV1 = {
  runtime: ComponentProvenanceV1
  baseModel: ComponentProvenanceV1
  adapter: ComponentProvenanceV1
  tacticPack: ComponentProvenanceV1
  policyPack: ComponentProvenanceV1
}

/** @deprecated Use LocalRunProvenanceV1 — labels are not digests. */
export type LocalRunDigestsV1 = LocalRunProvenanceV1

export type LocalSynthesisModeV1 =
  | 'deterministic_only'
  | 'tarx_model_pack'

/**
 * MCP `get_run_metadata` payload — must not claim model use without
 * used + content_verified provenance on model components.
 */
export type LocalMcpRunMetadataV1 = {
  contractVersion: '1'
  synthesis: LocalSynthesisModeV1
  synthesisNote: string
  /**
   * True only when synthesis is tarx_model_pack AND baseModel and adapter
   * are used with content_verified digests. Always false for deterministic_only.
   */
  modelUsed: boolean
  provenance: LocalRunProvenanceV1
  assessedAt: string
}

/**
 * Local Decision Brief draft from `securist assess .`.
 * - persistence: local_only
 * - never automatically shareable
 * - never hub-persisted in WO-012
 * - default body excludes raw source, secrets, absolute paths
 */
export type LocalDecisionBriefV1 = DecisionBriefHonestyV1 & {
  kind: 'local_decision_brief'
  persistence: 'local_only'
  /** Explicit privacy posture — not public/share-safe */
  shareability: 'never_automatic'
  visibility: 'local_only'
  repository: LocalRepositoryIdentityV1
  scope: LocalAssessScopeV1
  observed: DecisionBriefObservedFactV1[]
  /** Content-verified provenance — not mutable label strings alone */
  provenance: LocalRunProvenanceV1
  /**
   * deterministic_only when LLM synthesis unavailable or doctor failed.
   * tarx_model_pack only after securist doctor and signed pack verification
   * with content digests for used model components.
   * Never silent cloud or unsigned model fallback.
   */
  synthesis: LocalSynthesisModeV1
  synthesisNote: string
  assessedAt: string
  /** Minimized JSON for local file/MCP — still no absolute paths/secrets */
  draftJson: string
}

export type LocalRepoAssessResultV1 =
  | { ok: true; brief: LocalDecisionBriefV1 }
  | { ok: false; code: string; error: string }

/** MCP tools allowed in WO-012 (read-only; no paths/source/approve/execute). */
export const LOCAL_MCP_TOOLS_V1 = [
  'get_brief',
  'list_gaps',
  'get_run_metadata',
] as const

export type LocalMcpToolV1 = (typeof LOCAL_MCP_TOOLS_V1)[number]

/** Forbidden MCP capabilities for WO-012. */
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
 * Default product labels for packaging/docs — NOT content digests.
 * Do not write these strings into provenance.contentDigest.
 */
export const LOCAL_DEFAULT_COMPONENT_LABELS_V1 = {
  runtime: 'tarx-runtime-v1',
  baseModel: 'openai/gpt-oss-20b',
  adapter: 'tarx-securist-operator-v1',
  tacticPack: 'securist-core-v1',
  policyPack: 'securist-default-v1',
} as const

/** @deprecated Alias — these are labels, not digests. Prefer LOCAL_DEFAULT_COMPONENT_LABELS_V1. */
export const LOCAL_DEFAULT_DIGESTS_V1 = LOCAL_DEFAULT_COMPONENT_LABELS_V1

/** Component that did not participate in the run. */
export function componentNotUsed(label: string): ComponentProvenanceV1 {
  return {
    label,
    contentDigest: null,
    used: false,
    verification: 'not_used',
  }
}

/** Component loaded with a verified content digest. */
export function componentContentVerified(
  label: string,
  hex: string,
): ComponentProvenanceV1 {
  return {
    label,
    contentDigest: { algorithm: 'sha256', hex: hex.toLowerCase() },
    used: true,
    verification: 'content_verified',
  }
}

/**
 * Provenance honesty rules (WO-012):
 * 1. Labels are not digests — contentDigest is sha256 of bytes or null.
 * 2. used=true requires verification content_verified and a non-null contentDigest.
 * 3. deterministic_only ⇒ baseModel and adapter are not_used (model not proven used).
 * 4. tarx_model_pack ⇒ baseModel and adapter used + content_verified.
 * 5. modelUsed (MCP metadata) is true only under rule 4.
 * 6. MCP get_run_metadata exposes LocalMcpRunMetadataV1 — never label-as-digest maps.
 */
export function assertLocalProvenanceHonesty(
  synthesis: LocalSynthesisModeV1,
  provenance: LocalRunProvenanceV1,
): { ok: true; modelUsed: boolean } | { ok: false; code: string; error: string } {
  const components: Array<keyof LocalRunProvenanceV1> = [
    'runtime',
    'baseModel',
    'adapter',
    'tacticPack',
    'policyPack',
  ]
  for (const key of components) {
    const c = provenance[key]
    if (c.used) {
      if (c.verification !== 'content_verified' || !c.contentDigest) {
        return {
          ok: false,
          code: 'provenance',
          error: `${key}: used=true requires content_verified and contentDigest`,
        }
      }
      if (!/^[0-9a-f]{64}$/.test(c.contentDigest.hex)) {
        return {
          ok: false,
          code: 'provenance',
          error: `${key}: contentDigest.hex must be lowercase 64-char sha256`,
        }
      }
    } else if (c.contentDigest !== null) {
      return {
        ok: false,
        code: 'provenance',
        error: `${key}: unused component must not carry contentDigest`,
      }
    } else if (c.verification === 'content_verified') {
      return {
        ok: false,
        code: 'provenance',
        error: `${key}: content_verified without used/digest is invalid`,
      }
    }
    // Label must not look like a claimed sha256 stored as the only "proof"
    if (c.label.length === 64 && /^[0-9a-f]+$/i.test(c.label)) {
      return {
        ok: false,
        code: 'provenance',
        error: `${key}: put content hashes in contentDigest, not label`,
      }
    }
  }

  if (synthesis === 'deterministic_only') {
    if (provenance.baseModel.used || provenance.adapter.used) {
      return {
        ok: false,
        code: 'provenance',
        error:
          'deterministic_only forbids used baseModel/adapter (no model-use claim)',
      }
    }
    if (
      provenance.baseModel.verification !== 'not_used' ||
      provenance.adapter.verification !== 'not_used'
    ) {
      return {
        ok: false,
        code: 'provenance',
        error: 'deterministic_only requires baseModel/adapter verification not_used',
      }
    }
    return { ok: true, modelUsed: false }
  }

  // tarx_model_pack
  if (
    !provenance.baseModel.used ||
    provenance.baseModel.verification !== 'content_verified' ||
    !provenance.adapter.used ||
    provenance.adapter.verification !== 'content_verified'
  ) {
    return {
      ok: false,
      code: 'provenance',
      error:
        'tarx_model_pack requires used+content_verified baseModel and adapter digests',
    }
  }
  return { ok: true, modelUsed: true }
}

export function toLocalMcpRunMetadata(
  brief: Pick<
    LocalDecisionBriefV1,
    'synthesis' | 'synthesisNote' | 'provenance' | 'assessedAt'
  >,
): LocalMcpRunMetadataV1 | { ok: false; code: string; error: string } {
  const check = assertLocalProvenanceHonesty(brief.synthesis, brief.provenance)
  if (!check.ok) return check
  return {
    contractVersion: '1',
    synthesis: brief.synthesis,
    synthesisNote: brief.synthesisNote,
    modelUsed: check.modelUsed,
    provenance: brief.provenance,
    assessedAt: brief.assessedAt,
  }
}
