/**
 * Local Operator assessment contract (WO-012).
 *
 * Private, local evidence from manifests/config inside the user boundary.
 * NOT PublicDecisionBriefV1 — that type is public/share-safe and must not be
 * reused for local repository paths, dependency names, or internal intent.
 *
 * Default output: no raw source, no secret values, no absolute local paths.
 * Sharing requires an explicit future export/redaction action (out of WO-012).
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

/** Digests recorded locally every run (Decision Graph dogfood). */
export type LocalRunDigestsV1 = {
  runtime: string
  baseModel: string
  adapter: string
  tacticPack: string
  policyPack: string
}

export type LocalSynthesisModeV1 =
  | 'deterministic_only'
  | 'tarx_model_pack'

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
  digests: LocalRunDigestsV1
  /**
   * deterministic_only when LLM synthesis unavailable or doctor failed.
   * tarx_model_pack only after securist doctor and signed pack verification.
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

/** Default ship digests (record every run; not marketing “the TARX model”). */
export const LOCAL_DEFAULT_DIGESTS_V1 = {
  runtime: 'tarx-runtime-v1',
  baseModel: 'openai/gpt-oss-20b',
  adapter: 'tarx-securist-operator-v1',
  tacticPack: 'securist-core-v1',
  policyPack: 'securist-default-v1',
} as const
