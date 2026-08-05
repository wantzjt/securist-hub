/**
 * Candidate evidence that Eve (or other runtimes) may submit.
 * Hub validates, normalizes, and may store as `observed` — never `policy_approved`.
 */
export type CandidateEvidenceV1 = {
  contractVersion: '1'
  kind: 'candidate_evidence'
  tenantId: string
  artifactId: string
  domain:
    | 'provenance'
    | 'license'
    | 'security'
    | 'model_governance'
    | 'crypto_agility'
  assertion: string
  sourceUrl?: string
  sourceLabel: string
  /** ISO time observed by the agent */
  observedAt: string
  contentHash?: string
  /** Agent id: scout | change_analyst | … */
  agentId: string
  runId?: string
}

export type SignedValidationSummaryV1 = {
  contractVersion: '1'
  kind: 'validation_summary'
  tenantId: string
  artifactId: string
  operatorId: string
  runtime: string
  toolVersions: Record<string, string>
  artifactDigest?: string
  /** Share-safe result only — no private paths or raw data */
  resultSummary: string
  dataClassification: 'public' | 'internal' | 'restricted'
  boundary: 'local_only' | 'controlled_cloud' | 'external_service'
  ranAt: string
  /** Operator signature placeholder (HMAC/JWS in production) */
  signature?: string
}
