/**
 * End-to-end fixture proving the operating contract:
 * artifact → evidence → policy → validation → approval
 *   → change → review_required → Activity
 *
 * Run via typecheck import or server demo; not a graph DB.
 */
import { contentHash } from '../hash'
import { evaluatePolicy } from '../policy'
import { applyMaterialTrigger, transitionDecision } from '../state-machine'
import { appendOutbox, markProjected } from '../outbox'
import type {
  Artifact,
  ArtifactVersion,
  Decision,
  DecisionScope,
  EvidenceRecord,
  ValidationRun,
  ChangeEvent,
  ActivityEventV2,
} from '../types'

export type LifecycleFixtureResult = {
  ok: boolean
  steps: string[]
  artifactId: string
  versionId: string
  decisionId: string
  finalStatus: string
  activityIds: string[]
  errors: string[]
}

const TENANT = 'fixture-tenant'

export function runE2ELifecycleFixture(): LifecycleFixtureResult {
  const steps: string[] = []
  const errors: string[] = []
  const activityIds: string[] = []
  const now = new Date().toISOString()

  // 1. Artifact
  const artifact: Artifact = {
    id: 'art-fixture-repo',
    tenantId: TENANT,
    kind: 'repo',
    name: 'fixture-supply-chain-lib',
    purpose:
      'Fixture library used to prove Decision Graph lifecycle in CI and local dev.',
    recommendedBoundary: 'Development only until approved.',
    domains: ['supply_chain', 'appsec'],
    canonicalUrl: 'https://github.com/example/fixture-supply-chain-lib',
    provider: 'github',
    status: 'not_reviewed',
    reviewOwner: 'fixture-owner',
    nextReviewAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isSeed: false,
    createdAt: now,
    updatedAt: now,
  }
  steps.push('artifact_created')

  // 2. Version (immutable)
  const version: ArtifactVersion = {
    id: 'ver-fixture-1.0.0',
    artifactId: artifact.id,
    versionLabel: '1.0.0',
    commitOrDigest: 'sha256:fixtureaaaaaaaa',
    releasedAt: now,
    observedAt: now,
    isSeed: false,
  }
  steps.push('artifact_version_bound')

  // 3. Evidence (append-only)
  const evidence: EvidenceRecord[] = [
    {
      id: 'ev-fixture-license',
      tenantId: TENANT,
      artifactId: artifact.id,
      versionId: version.id,
      domain: 'license',
      assertion: 'Apache-2.0 SPDX observed on public repository.',
      source: 'fixture:github',
      observedAt: now,
      verification: 'verified',
      contentHash: contentHash('apache-2.0'),
      isSeed: false,
    },
    {
      id: 'ev-fixture-prov',
      tenantId: TENANT,
      artifactId: artifact.id,
      versionId: version.id,
      domain: 'provenance',
      assertion: `Release digest ${version.commitOrDigest}`,
      source: 'fixture:github',
      observedAt: now,
      verification: 'verified',
      contentHash: contentHash(version.commitOrDigest || 'x'),
      isSeed: false,
    },
    {
      id: 'ev-fixture-sec',
      tenantId: TENANT,
      artifactId: artifact.id,
      versionId: version.id,
      domain: 'security',
      assertion: 'No known critical advisories in fixture window.',
      source: 'fixture:osv-stub',
      observedAt: now,
      verification: 'human_reviewed',
      contentHash: contentHash('no-crit'),
      isSeed: false,
    },
  ]
  steps.push('evidence_recorded')

  // 4. Policy evaluation (deterministic)
  const evaluation = evaluatePolicy({
    artifact,
    evidence,
    tenantId: TENANT,
    environment: 'development',
    dataClassification: 'public',
    deploymentBoundary: 'controlled_cloud',
    intendedUse: 'Fixture integration tests',
  })
  evaluation.isSeed = false
  steps.push(`policy_evaluated:${evaluation.verdict}`)

  // 5. Validation run (summary only)
  const validation: ValidationRun = {
    id: 'val-fixture-1',
    tenantId: TENANT,
    artifactId: artifact.id,
    operatorId: 'op-fixture',
    runtime: 'local-deterministic',
    toolVersions: { policy: '1.0.0', fixture: '1' },
    artifactDigest: version.commitOrDigest,
    resultSummary: 'Fixture validation passed on public sample (share-safe).',
    dataClassification: 'public',
    boundary: 'local_only',
    ranAt: now,
    isSeed: false,
  }
  steps.push(`validation_run_recorded:${validation.id}`)

  // 6. Approval bound to version + policy + scope + evidence
  const scope: DecisionScope = {
    tenantId: TENANT,
    environment: 'development',
    intendedUse: 'Fixture integration tests',
    dataClassification: 'public',
    deploymentBoundary: 'controlled_cloud',
  }

  let status = artifact.status
  let t = transitionDecision(status, 'watching')
  if (!t.ok) errors.push(t.error)
  else status = t.to

  t = transitionDecision(status, 'conditional')
  if (!t.ok) errors.push(t.error)
  else status = t.to

  // Only approve if policy allows
  if (evaluation.verdict === 'approve' || evaluation.verdict === 'conditional') {
    t = transitionDecision(status, 'approved')
    if (!t.ok) errors.push(t.error)
    else status = t.to
  }

  const decision: Decision = {
    id: 'dec-fixture-1',
    tenantId: TENANT,
    artifactId: artifact.id,
    artifactVersionId: version.id,
    status,
    summary: evaluation.explanation,
    riskPlain: 'Fixture residual risk accepted for development scope only.',
    actionPlain: 'Monitor for release digests; re-review on material change.',
    evaluationId: evaluation.id,
    evidenceIds: evidence.map((e) => e.id),
    policyId: evaluation.policyId,
    policyVersion: evaluation.policyVersion,
    scope,
    decidedAt: now,
    decidedBy: 'fixture-human',
    expiresAt: artifact.nextReviewAt,
    isSeed: false,
  }
  artifact.status = status
  steps.push(`decision_${status}`)

  // Outbox for projection
  const out1 = appendOutbox({
    id: 'ob-fixture-approved',
    tenantId: TENANT,
    artifactId: artifact.id,
    eventType: 'decision.approved',
    actorType: 'human',
    payloadFingerprint: contentHash(decision.id + status),
  })
  steps.push('outbox_decision')

  // 7. Material change (new digest) → must force review_required
  const version2: ArtifactVersion = {
    id: 'ver-fixture-1.1.0',
    artifactId: artifact.id,
    versionLabel: '1.1.0',
    commitOrDigest: 'sha256:fixturebbbbbbbb',
    releasedAt: now,
    observedAt: now,
    isSeed: false,
  }

  const change: ChangeEvent = {
    id: 'chg-fixture-release',
    tenantId: TENANT,
    artifactId: artifact.id,
    changeType: 'release_digest',
    whatHappened: 'New release 1.1.0 with different digest observed.',
    whyItMatters:
      'Prior approval bound to 1.0.0; new version must not inherit silently.',
    securistAction: 'Open review_required; re-run policy against 1.1.0 evidence.',
    verification: 'observed',
    visibility: 'public',
    beforeFingerprint: version.commitOrDigest,
    afterFingerprint: version2.commitOrDigest,
    materiality: 'version_digest',
    reReviewTrigger: true,
    occurredAt: now,
    isSeed: false,
  }

  const trigger = applyMaterialTrigger(artifact.status)
  if (!trigger.ok) errors.push(trigger.error)
  else {
    artifact.status = trigger.to
    decision.status = trigger.to
  }
  steps.push(`material_change→${artifact.status}`)

  if (artifact.status !== 'review_required') {
    errors.push('Expected review_required after material change')
  }

  // 8. Activity projection (from outbox + change — not source of truth)
  const activity: ActivityEventV2[] = [
    {
      id: 'act-fixture-approved',
      tenantId: TENANT,
      source: 'decision',
      verification: 'human_reviewed',
      artifactId: artifact.id,
      whatHappened: `Decision ${decision.status} for ${artifact.name}@${version.versionLabel}`,
      whyItMatters: 'Approval basis recorded against version and policy.',
      securistAction: 'Track watchlist for digests.',
      visibility: 'public',
      occurredAt: now,
      isSeed: false,
    },
    {
      id: 'act-fixture-rereview',
      tenantId: TENANT,
      source: 'change',
      verification: 'observed',
      artifactId: artifact.id,
      whatHappened: change.whatHappened,
      whyItMatters: change.whyItMatters,
      securistAction: change.securistAction,
      visibility: 'public',
      occurredAt: now,
      isSeed: false,
    },
  ]
  activityIds.push(...activity.map((a) => a.id))
  markProjected(out1.id)
  steps.push('activity_projected')

  // Illegal silent inherit check: version2 has no decision binding
  if (decision.artifactVersionId === version2.id) {
    errors.push('Decision must not silently bind to new version')
  }
  steps.push('no_silent_version_inherit')

  return {
    ok: errors.length === 0,
    steps,
    artifactId: artifact.id,
    versionId: version.id,
    decisionId: decision.id,
    finalStatus: artifact.status,
    activityIds,
    errors,
  }
}
