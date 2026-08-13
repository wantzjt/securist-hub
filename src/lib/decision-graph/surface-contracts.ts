/**
 * Canonical read models for UI surfaces.
 * Routes bind to these — not ad-hoc per-page shapes.
 *
 * Public assess pre-persistence types are re-exported from @securist/contracts
 * so routes do not invent competing domain contracts.
 */
import type {
  Artifact,
  Decision,
  DecisionStatus,
  EvidenceDomain,
  PolicyEvaluation,
  PolicyVerdict,
} from './types'

export type {
  DecisionBriefHonestyV1,
  DecisionBriefObservedFactV1,
  DecisionBriefPersistenceV1,
} from '../../../packages/contracts/src/decision-brief'

export type {
  PublicAssessBoundaryV1,
  PublicAssessEnvironmentV1,
  PublicAssessScopeV1,
  PublicDecisionBriefV1,
  PublicObservedFactV1,
  PublicRepoAssessInputV1,
  PublicRepoAssessResultV1,
  PublicRepositoryFactsV1,
} from '../../../packages/contracts/src/public-assess'

export type {
  LocalDecisionBriefV1,
  LocalRepoAssessResultV1,
  LocalRunProvenanceV1,
  LocalMcpToolV1,
  LocalMcpRunMetadataV1,
  LocalMcpEnvelopeV1,
  LocalCapabilityStateV1,
  ComponentProvenanceV1,
  ContentDigestV1,
  SignatureStatusV1,
  UseStatusV1,
} from '../../../packages/contracts/src/local-assess'

export {
  PUBLIC_ASSESS_BOUNDARIES_V1,
  PUBLIC_ASSESS_ENVIRONMENTS_V1,
  PUBLIC_ASSESS_LIMITS_V1,
} from '../../../packages/contracts/src/public-assess'

export type {
  TeamGraphDecisionV1,
  TeamGraphHonestyV1,
  TeamGraphOwnerV1,
  TeamGraphPolicyBindingV1,
  TeamGraphEvidenceRefV1,
  TeamGraphReReviewRequestV1,
  TeamGraphStatusV1,
  TeamGraphStubErrorV1,
} from '../../../packages/contracts/src/team-graph'

export {
  TEAM_GRAPH_HONESTY_V1,
  TEAM_GRAPH_ILLUSTRATION_V1,
  TEAM_GRAPH_LIVE,
  TEAM_GRAPH_DURABLE,
  TEAM_GRAPH_PERSISTENCE,
  TEAM_GRAPH_ERROR_NOT_LIVE,
  teamGraphNotLive,
  teamGraphStatus,
} from '../../../packages/contracts/src/team-graph'

export {
  LOCAL_MCP_TOOLS_V1,
  LOCAL_MCP_FORBIDDEN_V1,
  LOCAL_EXPECTED_COMPONENT_IDS_V1,
  LOCAL_DEFAULT_COMPONENT_LABELS_V1,
  LOCAL_MCP_EGRESS_WARNING_V1,
  componentUsedVerified,
  componentAvailableNotUsed,
  assertLocalProvenanceHonesty,
  toLocalMcpRunMetadata,
  toLocalMcpBriefResponse,
  wrapLocalMcpResponse,
  validateLocalBriefTextInput,
} from '../../../packages/contracts/src/local-assess'

export type VisibilityLevel = 'public' | 'organization' | 'operator'

/** Every artifact card on home / scout / packages / models / activity */
export type ArtifactCardModel = {
  id: string
  name: string
  kind: Artifact['kind']
  canonicalUrl: string
  decisionStatus: DecisionStatus
  purpose: string
  riskPlain: string
  materialChangeSummary: string
  actionRecommendation: string
  evidenceCoverage: Partial<Record<EvidenceDomain, boolean>>
  visibility: VisibilityLevel
  isSeed: boolean
}

export type DecisionBrief = {
  status: DecisionStatus
  purpose: string
  recommendedBoundary: string
  riskPlain: string
  actionPlain: string
  reviewOwner: string
  nextReviewAt?: string
  whatChangedSinceApproval: string
  isSeed: boolean
}

export type EvidenceCoverage = {
  domains: Record<EvidenceDomain, { present: boolean; verified: boolean }>
  note: string
}

export type ChangeSummary = {
  items: Array<{
    id: string
    whatHappened: string
    whyItMatters: string
    beforeFingerprint?: string
    afterFingerprint?: string
    materiality?: string
    occurredAt: string
    isSeed: boolean
  }>
}

export type PolicyResultView = {
  verdict: PolicyVerdict
  policyId: string
  policyVersion: string
  explanation: string
  failingChecks: string[]
  requiredMitigation: string[]
  evaluatedAt: string
  isSeed: boolean
}

export type ValidationSummary = {
  runs: Array<{
    id: string
    runtime: string
    resultSummary: string
    boundary: string
    ranAt: string
    isSeed: boolean
  }>
}

export type ContributionSummary = {
  items: Array<{
    id: string
    kind: string
    summary: string
    url?: string
    compatibility?: string
    createdAt: string
    isSeed: boolean
  }>
}

export type ActivityProjection = {
  events: Array<{
    id: string
    source: string
    verification: string
    whatHappened: string
    whyItMatters: string
    securistAction: string
    occurredAt: string
    isSeed: boolean
    visibility: VisibilityLevel
  }>
}

/** Full Artifact Profile payload */
export type ArtifactProfileModel = {
  identity: {
    id: string
    name: string
    kind: Artifact['kind']
    provider: string
    canonicalUrl: string
    visibility: VisibilityLevel
  }
  decisionBrief: DecisionBrief
  evidenceCoverage: EvidenceCoverage
  changeSummary: ChangeSummary
  policyResult?: PolicyResultView
  validationSummary: ValidationSummary
  contributionSummary: ContributionSummary
  activityProjection: ActivityProjection
}

export function toArtifactCard(
  artifact: Artifact,
  decision?: Decision,
  extras?: Partial<ArtifactCardModel>,
): ArtifactCardModel {
  return {
    id: artifact.id,
    name: artifact.name,
    kind: artifact.kind,
    canonicalUrl: artifact.canonicalUrl,
    decisionStatus: decision?.status || artifact.status,
    purpose: artifact.purpose,
    riskPlain:
      decision?.riskPlain ||
      (artifact.isSeed
        ? 'Seed profile — not a production approval.'
        : 'No decision recorded yet.'),
    materialChangeSummary:
      extras?.materialChangeSummary || 'No material change summary.',
    actionRecommendation:
      decision?.actionPlain ||
      extras?.actionRecommendation ||
      'Open Artifact Profile to review evidence.',
    evidenceCoverage: extras?.evidenceCoverage || {},
    visibility: extras?.visibility || 'public',
    isSeed: artifact.isSeed,
  }
}

export function toPolicyResultView(ev: PolicyEvaluation): PolicyResultView {
  return {
    verdict: ev.verdict,
    policyId: ev.policyId,
    policyVersion: ev.policyVersion,
    explanation: ev.explanation,
    failingChecks: ev.failingChecks,
    requiredMitigation: ev.requiredMitigation,
    evaluatedAt: ev.evaluatedAt,
    isSeed: ev.isSeed,
  }
}
