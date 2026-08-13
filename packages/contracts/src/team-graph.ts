/**
 * Team Graph contracts — PRE-R1 freeze (WO-032).
 *
 * Frozen shapes for the paid one-artifact loop:
 * Decision · owner · policy · evidence · re-review request.
 *
 * Team Graph is NOT LIVE. Persistence is stub_not_live.
 * R1 / Postgres durability is John-only (WO-008). This module
 * must never read DATABASE_URL or write a durable graph.
 */

import type {
  DecisionScopeV1,
  DecisionStatusV1,
  VerificationStateV1,
} from './graph'

export const TEAM_GRAPH_CONTRACT_VERSION = '1' as const
export const TEAM_GRAPH_LIVE = false as const
export const TEAM_GRAPH_DURABLE = false as const
export const TEAM_GRAPH_PERSISTENCE = 'stub_not_live' as const
export const TEAM_GRAPH_STATUS_LABEL = 'coming_next' as const
export const TEAM_GRAPH_R1_GATE = 'human_wo_008' as const
export const TEAM_GRAPH_POSTGRES_OWNER = 'human' as const
export const TEAM_GRAPH_WORK_ORDER = 'WO-032' as const
export const TEAM_GRAPH_ERROR_NOT_LIVE = 'team_graph_not_live' as const

export type TeamGraphContractVersionV1 = typeof TEAM_GRAPH_CONTRACT_VERSION
export type TeamGraphLiveV1 = typeof TEAM_GRAPH_LIVE
export type TeamGraphDurableV1 = typeof TEAM_GRAPH_DURABLE
export type TeamGraphPersistenceV1 = typeof TEAM_GRAPH_PERSISTENCE
export type TeamGraphStatusLabelV1 = 'coming_next' | 'not_live'
export type TeamGraphR1GateV1 = typeof TEAM_GRAPH_R1_GATE

export type TeamGraphHonestyV1 = {
  contractVersion: TeamGraphContractVersionV1
  kind: 'team_graph_honesty'
  live: TeamGraphLiveV1
  durable: TeamGraphDurableV1
  persistence: TeamGraphPersistenceV1
  label: TeamGraphStatusLabelV1
  r1Gate: TeamGraphR1GateV1
  postgresOwner: typeof TEAM_GRAPH_POSTGRES_OWNER
  workOrder: typeof TEAM_GRAPH_WORK_ORDER
}

export const TEAM_GRAPH_HONESTY_V1: TeamGraphHonestyV1 = {
  contractVersion: '1',
  kind: 'team_graph_honesty',
  live: false,
  durable: false,
  persistence: 'stub_not_live',
  label: 'coming_next',
  r1Gate: 'human_wo_008',
  postgresOwner: 'human',
  workOrder: 'WO-032',
}

/** Named human who owns the Decision for one artifact version. */
export type TeamGraphOwnerV1 = {
  contractVersion: TeamGraphContractVersionV1
  kind: 'team_graph_owner'
  ownerId: string
  displayName: string
  /** Approvals are human-owned; agents may draft, never sign. */
  accountableHuman: true
}

/** Policy binding for a Decision — never an approval by itself. */
export type TeamGraphPolicyBindingV1 = {
  contractVersion: TeamGraphContractVersionV1
  kind: 'team_graph_policy_binding'
  policyId: string
  policyVersion: string
  name: string
}

export type TeamGraphEvidenceDomainV1 =
  'provenance' | 'license' | 'security' | 'model_governance' | 'crypto_agility'

/** One evidence record in the set that justified (or will justify) permission. */
export type TeamGraphEvidenceRefV1 = {
  contractVersion: TeamGraphContractVersionV1
  kind: 'team_graph_evidence_ref'
  evidenceId: string
  contentHash: string
  domain: TeamGraphEvidenceDomainV1
  verification: VerificationStateV1
  assertion: string
  source: string
}

/**
 * Frozen Team Graph Decision for one artifact version.
 * Matches Decision Graph lifecycle statuses. Pre-R1 instances are
 * illustrations only — live/durable remain false.
 */
export type TeamGraphDecisionV1 = {
  contractVersion: TeamGraphContractVersionV1
  kind: 'team_graph_decision'
  live: TeamGraphLiveV1
  durable: TeamGraphDurableV1
  persistence: TeamGraphPersistenceV1
  artifactId: string
  artifactVersionId: string
  status: DecisionStatusV1
  summary: string
  owner: TeamGraphOwnerV1
  policy: TeamGraphPolicyBindingV1
  evidence: TeamGraphEvidenceRefV1[]
  scope: DecisionScopeV1
  decidedAt?: string
  expiresAt?: string
}

export type TeamGraphReReviewTriggerV1 =
  | 'material_version'
  | 'license'
  | 'boundary'
  | 'policy_version'
  | 'evidence_superseded'
  | 'review_expired'

/**
 * Request to reopen permission when reality changes (north-star loop).
 * Pre-R1 this is a typed stub only — never persisted, never LIVE.
 */
export type TeamGraphReReviewRequestV1 = {
  contractVersion: TeamGraphContractVersionV1
  kind: 'team_graph_re_review_request'
  live: TeamGraphLiveV1
  durable: TeamGraphDurableV1
  persistence: TeamGraphPersistenceV1
  artifactId: string
  artifactVersionId: string
  trigger: TeamGraphReReviewTriggerV1
  reason: string
  requestedBy: string
}

/** API surface sketch (WO-032). Implementations must return this, not a durable write. */
export type TeamGraphApiOpV1 =
  'get_status' | 'get_one_artifact' | 'request_re_review'

export type TeamGraphStubErrorV1 = {
  ok: false
  error: typeof TEAM_GRAPH_ERROR_NOT_LIVE
  live: TeamGraphLiveV1
  durable: TeamGraphDurableV1
  persistence: TeamGraphPersistenceV1
  label: TeamGraphStatusLabelV1
  r1Gate: TeamGraphR1GateV1
  op: TeamGraphApiOpV1
  message: string
}

export type TeamGraphStatusV1 = {
  ok: true
  live: TeamGraphLiveV1
  durable: TeamGraphDurableV1
  persistence: TeamGraphPersistenceV1
  label: TeamGraphStatusLabelV1
  r1Gate: TeamGraphR1GateV1
  postgresOwner: typeof TEAM_GRAPH_POSTGRES_OWNER
  workOrder: typeof TEAM_GRAPH_WORK_ORDER
  honesty: TeamGraphHonestyV1
  /** One-artifact illustration — not a tenant Decision Graph row. */
  illustration: TeamGraphDecisionV1
  api: {
    getStatus: 'stub'
    getOneArtifact: 'stub'
    requestReReview: 'stub_refuses_write'
  }
  migrationHandoff: 'docs/TEAM-GRAPH-CONTRACTS.md'
}

export const TEAM_GRAPH_NOT_LIVE_MESSAGE =
  'Team Graph is not live. Shared owner / policy / evidence / re-review stays coming next until human-signed R1 (WO-008). Grok Build does not provision Postgres or set DATABASE_URL.' as const

export function teamGraphNotLive(op: TeamGraphApiOpV1): TeamGraphStubErrorV1 {
  return {
    ok: false,
    error: TEAM_GRAPH_ERROR_NOT_LIVE,
    live: false,
    durable: false,
    persistence: 'stub_not_live',
    label: 'not_live',
    r1Gate: 'human_wo_008',
    op,
    message: TEAM_GRAPH_NOT_LIVE_MESSAGE,
  }
}

/** Illustrative one-artifact Decision used by the stub UI. Never LIVE. Never durable. */
export const TEAM_GRAPH_ILLUSTRATION_V1: TeamGraphDecisionV1 = {
  contractVersion: '1',
  kind: 'team_graph_decision',
  live: false,
  durable: false,
  persistence: 'stub_not_live',
  artifactId: 'tg-example-one-artifact',
  artifactVersionId: 'tg-example-one-artifact-v1',
  status: 'not_reviewed',
  summary:
    'Contract illustration of owner + policy + evidence + re-review on one artifact. Not a production approval. Team Graph is not live.',
  owner: {
    contractVersion: '1',
    kind: 'team_graph_owner',
    ownerId: 'human-owner-example',
    displayName: 'Named human owner (illustration)',
    accountableHuman: true,
  },
  policy: {
    contractVersion: '1',
    kind: 'team_graph_policy_binding',
    policyId: 'pol-team-graph-example',
    policyVersion: '1',
    name: 'Example production admission policy (illustration)',
  },
  evidence: [
    {
      contractVersion: '1',
      kind: 'team_graph_evidence_ref',
      evidenceId: 'ev-example-provenance',
      contentHash:
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      domain: 'provenance',
      verification: 'seed',
      assertion:
        'Illustration only — provenance evidence would bind here after R1.',
      source: 'stub_not_live',
    },
  ],
  scope: {
    contractVersion: '1',
    tenantId: 'illustration-not-a-tenant',
    environment: 'research',
    intendedUse: 'Contract freeze illustration — not a live team Decision',
    dataClassification: 'public',
    deploymentBoundary: 'local_only',
  },
}

export function teamGraphStatus(): TeamGraphStatusV1 {
  return {
    ok: true,
    live: false,
    durable: false,
    persistence: 'stub_not_live',
    label: 'coming_next',
    r1Gate: 'human_wo_008',
    postgresOwner: 'human',
    workOrder: 'WO-032',
    honesty: TEAM_GRAPH_HONESTY_V1,
    illustration: TEAM_GRAPH_ILLUSTRATION_V1,
    api: {
      getStatus: 'stub',
      getOneArtifact: 'stub',
      requestReReview: 'stub_refuses_write',
    },
    migrationHandoff: 'docs/TEAM-GRAPH-CONTRACTS.md',
  }
}
