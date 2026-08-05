/**
 * Deterministic policy evaluation — explainable rules, not opaque AI judgment.
 */
import type {
  Artifact,
  DataClassification,
  DeploymentBoundary,
  EnvironmentScope,
  EvidenceRecord,
  PolicyEvaluation,
  PolicyVerdict,
  DecisionStatus,
} from './types'

export type PolicyInput = {
  artifact: Artifact
  evidence: EvidenceRecord[]
  tenantId: string
  environment: EnvironmentScope
  dataClassification: DataClassification
  deploymentBoundary: DeploymentBoundary
  intendedUse: string
  policyId?: string
  policyVersion?: string
}

const DISALLOWED_LICENSE_HINTS = [
  'no license',
  'unknown license',
  'proprietary-unclear',
]

function hasEvidence(
  evidence: EvidenceRecord[],
  domain: EvidenceRecord['domain'],
): boolean {
  return evidence.some(
    (e) =>
      e.domain === domain &&
      e.verification !== 'seed' &&
      e.verification !== 'observed',
  )
}

function hasAnyEvidence(
  evidence: EvidenceRecord[],
  domain: EvidenceRecord['domain'],
): boolean {
  return evidence.some((e) => e.domain === domain)
}

/**
 * Evaluate artifact against baseline Securist supply-chain + model + crypto rules.
 */
export function evaluatePolicy(input: PolicyInput): PolicyEvaluation {
  const {
    artifact,
    evidence,
    tenantId,
    environment,
    dataClassification,
    deploymentBoundary,
    intendedUse,
  } = input

  const failing: string[] = []
  const mitigation: string[] = []
  const triggers: string[] = []
  const evidenceIds = evidence.map((e) => e.id)

  // License
  const licenseEv = evidence.filter((e) => e.domain === 'license')
  if (licenseEv.length === 0) {
    failing.push('missing_license_evidence')
    mitigation.push('Record a license assertion from the canonical source.')
  } else if (
    licenseEv.some((e) =>
      DISALLOWED_LICENSE_HINTS.some((h) =>
        e.assertion.toLowerCase().includes(h),
      ),
    )
  ) {
    failing.push('disallowed_or_unclear_license')
    mitigation.push(
      'Confirm license allows intended use or select an alternative.',
    )
  }

  // Provenance / source version
  if (!hasAnyEvidence(evidence, 'provenance')) {
    failing.push('missing_source_or_version_digest')
    mitigation.push(
      'Capture version, tag, commit, or content digest from upstream.',
    )
  }

  // Model governance for models
  if (artifact.kind === 'model') {
    if (!hasAnyEvidence(evidence, 'model_governance')) {
      failing.push('missing_model_card_or_limits')
      mitigation.push(
        'Attach model-card facts: intended use, limits, base model, evaluation notes.',
      )
    }
    if (
      deploymentBoundary === 'external_service' &&
      dataClassification !== 'public'
    ) {
      failing.push('private_data_boundary_incompatible')
      mitigation.push(
        'Use local-only or controlled-cloud boundary for non-public data with remote models.',
      )
    }
  }

  // Crypto agility when domain tagged
  if (artifact.domains.includes('post_quantum')) {
    if (!hasAnyEvidence(evidence, 'crypto_agility')) {
      failing.push('crypto_inventory_required')
      mitigation.push(
        'Inventory algorithms and migration path; do not treat “quantum-safe” as marketing.',
      )
    }
  }

  // Security signals
  if (
    environment === 'production' &&
    !hasEvidence(evidence, 'security') &&
    !hasAnyEvidence(evidence, 'security')
  ) {
    failing.push('production_without_security_evidence')
    mitigation.push(
      'Run or record a security review before production approval.',
    )
  }

  // Stale review
  if (artifact.nextReviewAt) {
    const next = Date.parse(artifact.nextReviewAt)
    if (!Number.isNaN(next) && next < Date.now()) {
      failing.push('stale_review')
      mitigation.push('Complete re-review; update next review date.')
      triggers.push('review_date_elapsed')
    }
  }

  // Restricted data always needs local-only by default policy
  if (
    dataClassification === 'restricted' &&
    deploymentBoundary !== 'local_only'
  ) {
    failing.push('restricted_data_requires_local_only')
    mitigation.push(
      'Set deployment boundary to local-only for restricted data.',
    )
  }

  triggers.push(
    'license_change',
    'new_release_or_digest',
    'model_card_change',
    'security_advisory',
    'review_date_elapsed',
  )

  let verdict: PolicyVerdict = 'approve'
  if (
    failing.includes('disallowed_or_unclear_license') ||
    failing.includes('restricted_data_requires_local_only') ||
    failing.includes('private_data_boundary_incompatible')
  ) {
    verdict = 'deny'
  } else if (
    failing.includes('missing_license_evidence') ||
    failing.includes('missing_model_card_or_limits') ||
    failing.includes('production_without_security_evidence') ||
    failing.includes('stale_review')
  ) {
    verdict = 'review_required'
  } else if (failing.length > 0) {
    verdict = 'conditional'
  }

  const explanation = buildExplanation(verdict, failing, artifact, intendedUse)

  return {
    id: `eval-${artifact.id}-${Date.now()}`,
    tenantId,
    artifactId: artifact.id,
    policyId: input.policyId || 'securist-baseline',
    policyVersion: input.policyVersion || '1.0.0',
    environment,
    dataClassification,
    deploymentBoundary,
    intendedUse,
    verdict,
    explanation,
    failingChecks: failing,
    requiredMitigation: mitigation,
    evidenceIds,
    reReviewTriggers: triggers,
    evaluatedAt: new Date().toISOString(),
    isSeed: artifact.isSeed,
  }
}

function buildExplanation(
  verdict: PolicyVerdict,
  failing: string[],
  artifact: Artifact,
  intendedUse: string,
): string {
  if (verdict === 'approve') {
    return `Baseline policy allows ${artifact.name} for “${intendedUse}” under the stated boundary. Evidence coverage is sufficient for this scope; re-review on listed triggers.`
  }
  if (verdict === 'deny') {
    return `Baseline policy denies ${artifact.name} for “${intendedUse}”: ${failing.join(', ')}. Mitigate or choose another artifact before adoption.`
  }
  if (verdict === 'conditional') {
    return `Baseline policy conditionally allows ${artifact.name} with open checks: ${failing.join(', ')}. Record mitigations before expanding scope.`
  }
  return `Baseline policy requires human review for ${artifact.name}: ${failing.join(', ') || 'insufficient verified evidence'}. Do not treat seed or observed-only facts as approval.`
}

export function verdictToStatus(verdict: PolicyVerdict): DecisionStatus {
  switch (verdict) {
    case 'approve':
      return 'approved'
    case 'conditional':
      return 'conditional'
    case 'deny':
      return 'paused'
    case 'review_required':
      return 'review_required'
    default:
      return 'watching'
  }
}
