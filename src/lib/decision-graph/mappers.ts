/**
 * Row mappers: migrations/001_decision_graph.sql ↔ domain types.
 * Keep column names aligned with the migration — no competing shapes.
 */
import type {
  ActivityEventV2,
  Artifact,
  ArtifactSource,
  ArtifactVersion,
  ChangeEvent,
  ContributionRecord,
  Decision,
  DecisionScope,
  EvidenceRecord,
  OperatorAgent,
  Policy,
  PolicyEvaluation,
  ValidationRun,
} from './types'

function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'string') return v
  return String(v ?? '')
}

function optIso(v: unknown): string | undefined {
  if (v == null) return undefined
  return iso(v)
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v) as unknown
      return Array.isArray(p) ? p.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

function asRecord(v: unknown): Record<string, string> {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [
        k,
        String(val),
      ]),
    )
  }
  if (typeof v === 'string') {
    try {
      return asRecord(JSON.parse(v))
    } catch {
      return {}
    }
  }
  return {}
}

export function mapArtifact(row: Record<string, unknown>): Artifact {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    kind: row.kind as Artifact['kind'],
    name: String(row.name),
    purpose: String(row.purpose),
    recommendedBoundary: String(row.recommended_boundary),
    domains: asStringArray(row.domains) as Artifact['domains'],
    canonicalUrl: String(row.canonical_url),
    provider: String(row.provider),
    status: row.status as Artifact['status'],
    reviewOwner: String(row.review_owner),
    nextReviewAt: optIso(row.next_review_at),
    isSeed: Boolean(row.is_seed),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  }
}

export function mapVersion(row: Record<string, unknown>): ArtifactVersion {
  return {
    id: String(row.id),
    artifactId: String(row.artifact_id),
    versionLabel: String(row.version_label),
    commitOrDigest: row.commit_or_digest
      ? String(row.commit_or_digest)
      : undefined,
    releasedAt: optIso(row.released_at),
    observedAt: optIso(row.observed_at),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapSource(row: Record<string, unknown>): ArtifactSource {
  return {
    id: String(row.id),
    artifactId: String(row.artifact_id),
    sourceType: row.source_type as ArtifactSource['sourceType'],
    url: String(row.url),
    lastSnapshotAt: optIso(row.last_snapshot_at),
  }
}

export function mapEvidence(row: Record<string, unknown>): EvidenceRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    artifactId: String(row.artifact_id),
    versionId: row.version_id ? String(row.version_id) : undefined,
    domain: row.domain as EvidenceRecord['domain'],
    assertion: String(row.assertion),
    source: String(row.source),
    observedAt: iso(row.observed_at),
    verification: row.verification as EvidenceRecord['verification'],
    contentHash: String(row.content_hash),
    frameworkHint: row.framework_hint
      ? String(row.framework_hint)
      : undefined,
    isSeed: Boolean(row.is_seed),
  }
}

export function mapPolicy(row: Record<string, unknown>): Policy {
  return {
    id: String(row.id),
    version: String(row.version),
    name: String(row.name),
    description: String(row.description),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapEvaluation(row: Record<string, unknown>): PolicyEvaluation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    artifactId: String(row.artifact_id),
    policyId: String(row.policy_id),
    policyVersion: String(row.policy_version),
    environment: row.environment as PolicyEvaluation['environment'],
    dataClassification:
      row.data_classification as PolicyEvaluation['dataClassification'],
    deploymentBoundary:
      row.deployment_boundary as PolicyEvaluation['deploymentBoundary'],
    intendedUse: String(row.intended_use),
    verdict: row.verdict as PolicyEvaluation['verdict'],
    explanation: String(row.explanation),
    failingChecks: asStringArray(row.failing_checks),
    requiredMitigation: asStringArray(row.required_mitigation),
    evidenceIds: asStringArray(row.evidence_ids),
    reReviewTriggers: asStringArray(row.re_review_triggers),
    evaluatedAt: iso(row.evaluated_at),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapDecision(row: Record<string, unknown>): Decision {
  let scope: DecisionScope | undefined
  const raw = row.scope
  if (raw && typeof raw === 'object') {
    const s = raw as Record<string, unknown>
    scope = {
      tenantId: String(s.tenantId ?? s.tenant_id ?? row.tenant_id),
      environment: (s.environment as DecisionScope['environment']) || 'development',
      intendedUse: String(s.intendedUse ?? s.intended_use ?? ''),
      dataClassification:
        (s.dataClassification as DecisionScope['dataClassification']) ||
        (s.data_classification as DecisionScope['dataClassification']) ||
        'public',
      deploymentBoundary:
        (s.deploymentBoundary as DecisionScope['deploymentBoundary']) ||
        (s.deployment_boundary as DecisionScope['deploymentBoundary']) ||
        'local_only',
    }
  }

  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    artifactId: String(row.artifact_id),
    artifactVersionId: row.artifact_version_id
      ? String(row.artifact_version_id)
      : undefined,
    status: row.status as Decision['status'],
    summary: String(row.summary),
    riskPlain: String(row.risk_plain),
    actionPlain: String(row.action_plain),
    evaluationId: row.evaluation_id ? String(row.evaluation_id) : undefined,
    evidenceIds: asStringArray(row.evidence_ids),
    policyId: row.policy_id ? String(row.policy_id) : undefined,
    policyVersion: row.policy_version ? String(row.policy_version) : undefined,
    scope,
    decidedAt: iso(row.decided_at),
    decidedBy: String(row.decided_by),
    expiresAt: optIso(row.expires_at),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapValidation(row: Record<string, unknown>): ValidationRun {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    artifactId: String(row.artifact_id),
    operatorId: String(row.operator_id),
    runtime: String(row.runtime),
    toolVersions: asRecord(row.tool_versions),
    artifactDigest: row.artifact_digest
      ? String(row.artifact_digest)
      : undefined,
    resultSummary: String(row.result_summary),
    dataClassification:
      row.data_classification as ValidationRun['dataClassification'],
    boundary: row.boundary as ValidationRun['boundary'],
    ranAt: iso(row.ran_at),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapContribution(
  row: Record<string, unknown>,
): ContributionRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    artifactId: String(row.artifact_id),
    kind: row.kind as ContributionRecord['kind'],
    url: row.url ? String(row.url) : undefined,
    summary: String(row.summary),
    compatibility: row.compatibility
      ? (row.compatibility as ContributionRecord['compatibility'])
      : undefined,
    createdAt: iso(row.created_at),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapChange(row: Record<string, unknown>): ChangeEvent {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    artifactId: String(row.artifact_id),
    changeType: String(row.change_type),
    whatHappened: String(row.what_happened),
    whyItMatters: String(row.why_it_matters),
    securistAction: String(row.securist_action),
    verification: row.verification as ChangeEvent['verification'],
    visibility: row.visibility as ChangeEvent['visibility'],
    beforeFingerprint: row.before_fingerprint
      ? String(row.before_fingerprint)
      : undefined,
    afterFingerprint: row.after_fingerprint
      ? String(row.after_fingerprint)
      : undefined,
    materiality: row.materiality ? String(row.materiality) : undefined,
    reReviewTrigger: Boolean(row.re_review_trigger),
    occurredAt: iso(row.occurred_at),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapActivity(row: Record<string, unknown>): ActivityEventV2 {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    source: String(row.source),
    verification: row.verification as ActivityEventV2['verification'],
    artifactId: row.artifact_id ? String(row.artifact_id) : undefined,
    whatHappened: String(row.what_happened),
    whyItMatters: String(row.why_it_matters),
    securistAction: String(row.securist_action),
    visibility: row.visibility as ActivityEventV2['visibility'],
    occurredAt: iso(row.occurred_at),
    isSeed: Boolean(row.is_seed),
  }
}

export function mapOperator(row: Record<string, unknown>): OperatorAgent {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    label: String(row.label),
    publicOnly: Boolean(row.public_only),
    createdAt: iso(row.created_at),
  }
}
