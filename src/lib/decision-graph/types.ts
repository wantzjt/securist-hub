/**
 * Securist Decision Graph — durable domain types.
 * Evidence is append-only in behavior; LLM text is never verified by itself.
 */

export type ArtifactKind =
  | 'repo'
  | 'model'
  | 'dataset'
  | 'release'
  | 'dependency'
  | 'crypto_component'
  | 'package'

export type DecisionStatus =
  | 'not_reviewed'
  | 'watching'
  | 'conditional'
  | 'conditionally_approved' // alias of conditional (legacy seed)
  | 'approved'
  | 'review_required'
  | 'paused'
  | 'retired'

export type VerificationState =
  | 'observed'
  | 'verified'
  | 'human_reviewed'
  | 'policy_approved'
  | 'seed'

/** Stable public/private artifact identity (canonical ref). */
export type ArtifactRef = {
  id: string
  kind: ArtifactKind
  provider: string
  canonicalUrl: string
  visibility: 'public' | 'private'
}

export type DecisionScope = {
  tenantId: string
  environment: EnvironmentScope
  intendedUse: string
  dataClassification: DataClassification
  deploymentBoundary: DeploymentBoundary
}

export type PolicyVerdict =
  | 'approve'
  | 'conditional'
  | 'review_required'
  | 'deny'

export type DataClassification = 'public' | 'internal' | 'restricted'

export type EnvironmentScope =
  | 'research'
  | 'development'
  | 'staging'
  | 'production'

export type DeploymentBoundary =
  | 'local_only'
  | 'controlled_cloud'
  | 'external_service'

export type EvidenceDomain =
  | 'provenance'
  | 'license'
  | 'security'
  | 'model_governance'
  | 'crypto_agility'

export type SecurityDomain =
  | 'ai_security'
  | 'supply_chain'
  | 'appsec'
  | 'cti'
  | 'identity'
  | 'cloud'
  | 'robotics'
  | 'post_quantum'

export type TenantId = string

export type Artifact = {
  id: string
  tenantId: TenantId
  kind: ArtifactKind
  name: string
  /** One sentence: who uses it and what problem it solves */
  purpose: string
  recommendedBoundary: string
  domains: SecurityDomain[]
  canonicalUrl: string
  provider: string
  status: DecisionStatus
  reviewOwner: string
  nextReviewAt?: string
  /** Explicit seed/demo catalog rows */
  isSeed: boolean
  createdAt: string
  updatedAt: string
}

export type ArtifactVersion = {
  id: string
  artifactId: string
  versionLabel: string
  commitOrDigest?: string
  releasedAt?: string
  /** When this version was first observed by Securist */
  observedAt?: string
  isSeed: boolean
}

export type ArtifactSource = {
  id: string
  artifactId: string
  sourceType: 'github' | 'huggingface' | 'manual' | 'operator' | 'site'
  url: string
  lastSnapshotAt?: string
}

export type EvidenceRecord = {
  id: string
  tenantId: TenantId
  artifactId: string
  versionId?: string
  domain: EvidenceDomain
  /** Normalized assertion (share-safe) */
  assertion: string
  source: string
  observedAt: string
  verification: VerificationState
  contentHash: string
  /** Optional framework hint — never implies compliance alone */
  frameworkHint?: string
  isSeed: boolean
}

export type Policy = {
  id: string
  version: string
  name: string
  description: string
  isSeed: boolean
}

export type PolicyEvaluation = {
  id: string
  tenantId: TenantId
  artifactId: string
  policyId: string
  policyVersion: string
  environment: EnvironmentScope
  dataClassification: DataClassification
  deploymentBoundary: DeploymentBoundary
  intendedUse: string
  verdict: PolicyVerdict
  explanation: string
  failingChecks: string[]
  requiredMitigation: string[]
  evidenceIds: string[]
  reReviewTriggers: string[]
  evaluatedAt: string
  isSeed: boolean
}

export type Decision = {
  id: string
  tenantId: TenantId
  artifactId: string
  /** Approvals bind to one version — never silent inherit */
  artifactVersionId?: string
  status: DecisionStatus
  summary: string
  riskPlain: string
  actionPlain: string
  evaluationId?: string
  evidenceIds?: string[]
  policyId?: string
  policyVersion?: string
  scope?: DecisionScope
  decidedAt: string
  decidedBy: string
  expiresAt?: string
  isSeed: boolean
}

export type ValidationRun = {
  id: string
  tenantId: TenantId
  artifactId: string
  operatorId: string
  runtime: string
  toolVersions: Record<string, string>
  artifactDigest?: string
  resultSummary: string
  dataClassification: DataClassification
  boundary: DeploymentBoundary
  ranAt: string
  isSeed: boolean
}

export type ContributionRecord = {
  id: string
  tenantId: TenantId
  artifactId: string
  kind: 'pr' | 'issue' | 'docs' | 'patch'
  url?: string
  summary: string
  compatibility?: 'compatible' | 'unknown' | 'breaking'
  createdAt: string
  isSeed: boolean
}

export type ChangeEvent = {
  id: string
  tenantId: TenantId
  artifactId: string
  changeType: string
  whatHappened: string
  whyItMatters: string
  securistAction: string
  verification: VerificationState
  visibility: 'public' | 'organization' | 'operator'
  beforeFingerprint?: string
  afterFingerprint?: string
  materiality?: string
  reReviewTrigger?: boolean
  occurredAt: string
  isSeed: boolean
}

export type OperatorAgent = {
  id: string
  tenantId: TenantId
  label: string
  publicOnly: boolean
  createdAt: string
}

export type ActivityEventV2 = {
  id: string
  tenantId: TenantId
  source: string
  verification: VerificationState
  artifactId?: string
  whatHappened: string
  whyItMatters: string
  securistAction: string
  visibility: 'public' | 'organization' | 'operator'
  occurredAt: string
  isSeed: boolean
}

/** Leader-facing profile surface */
export type ArtifactProfileBrief = {
  artifact: Artifact
  decision?: Decision
  latestEvaluation?: PolicyEvaluation
  evidenceCoverage: Record<EvidenceDomain, boolean>
  whatChangedSinceApproval: string
  relatedPackageIds: string[]
}

export type DecisionGraphSnapshot = {
  artifacts: Artifact[]
  versions: ArtifactVersion[]
  sources: ArtifactSource[]
  evidence: EvidenceRecord[]
  policies: Policy[]
  evaluations: PolicyEvaluation[]
  decisions: Decision[]
  validations: ValidationRun[]
  contributions: ContributionRecord[]
  changes: ChangeEvent[]
  activity: ActivityEventV2[]
  operators: OperatorAgent[]
}
