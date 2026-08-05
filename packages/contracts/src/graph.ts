/**
 * Canonical Decision Graph contracts (shared language).
 * Surfaces are views; this is the source shape.
 */
export type ArtifactKindV1 =
  | 'repo'
  | 'model'
  | 'dataset'
  | 'dependency'
  | 'release'
  | 'crypto_component'
  | 'package'

export type DecisionStatusV1 =
  | 'not_reviewed'
  | 'watching'
  | 'conditional'
  | 'approved'
  | 'review_required'
  | 'paused'
  | 'retired'

export type VerificationStateV1 =
  | 'observed'
  | 'verified'
  | 'human_reviewed'
  | 'policy_approved'
  | 'seed'

export type ArtifactRefV1 = {
  contractVersion: '1'
  id: string
  kind: ArtifactKindV1
  provider: string
  canonicalUrl: string
  visibility: 'public' | 'private'
}

export type DecisionScopeV1 = {
  contractVersion: '1'
  tenantId: string
  environment: 'research' | 'development' | 'staging' | 'production'
  intendedUse: string
  dataClassification: 'public' | 'internal' | 'restricted'
  deploymentBoundary: 'local_only' | 'controlled_cloud' | 'external_service'
}
