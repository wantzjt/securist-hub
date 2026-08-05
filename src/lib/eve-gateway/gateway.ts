/**
 * Eve → Securist constrained gateway.
 * Eve may submit candidate evidence + proposals only.
 * Never mutates approvals or arbitrary graph rows.
 */
import { contentHash } from '../decision-graph/hash'
import { evaluatePolicy } from '../decision-graph/policy'
import { getDecisionGraphStore } from '../decision-graph/store'
import { applyMaterialTrigger } from '../decision-graph/state-machine'
import type { EvidenceRecord } from '../decision-graph/types'
import type {
  CandidateEvidenceV1,
  ContributionProposalV1,
  EveAgentId,
  ReviewTaskV1,
  SignedValidationSummaryV1,
  ValidationPlanV1,
} from './types'
import { EVE_AGENT_IDS } from './types'

export type GatewayResult<T = unknown> =
  { ok: true; data: T } | { ok: false; code: string; error: string }

const workflow = {
  reviewTasks: [] as ReviewTaskV1[],
  validationPlans: [] as ValidationPlanV1[],
  contributionProposals: [] as ContributionProposalV1[],
}

function isEveAgent(id: string): id is EveAgentId {
  return (EVE_AGENT_IDS as readonly string[]).includes(id)
}

function redactOk(blob: string): boolean {
  return !/-----BEGIN |api[_-]?key|password=|ghp_[A-Za-z0-9]|\/Users\/|C:\\\\/i.test(
    blob,
  )
}

/** Keep runtime boundaries intact when typed payloads arrive over a network edge. */
function fieldEquals(
  input: unknown,
  field: string,
  expected: unknown,
): boolean {
  return (
    typeof input === 'object' &&
    input !== null &&
    (input as Record<string, unknown>)[field] === expected
  )
}

/**
 * Scout / change analyst → candidate evidence (verification = observed at most).
 * Re-runs deterministic policy; may open a review task — never auto-approves.
 */
export async function submitCandidateEvidence(
  candidate: CandidateEvidenceV1,
): Promise<
  GatewayResult<{
    evidenceId: string
    reviewTaskId?: string
    verdict?: string
  }>
> {
  if (
    !fieldEquals(candidate, 'contractVersion', '1') ||
    !fieldEquals(candidate, 'kind', 'candidate_evidence')
  ) {
    return {
      ok: false,
      code: 'contract',
      error: 'Invalid candidate evidence contract',
    }
  }
  if (!isEveAgent(candidate.agentId)) {
    return { ok: false, code: 'agent', error: 'Unknown or disallowed agentId' }
  }
  if (!redactOk(JSON.stringify(candidate))) {
    return { ok: false, code: 'redaction', error: 'Private material rejected' }
  }
  if (!String(candidate.tenantId || '').trim()) {
    return {
      ok: false,
      code: 'tenant_required',
      error: 'tenantId required before persist',
    }
  }

  const store = await getDecisionGraphStore()
  const artifact = await store.getArtifact(
    candidate.artifactId,
    candidate.tenantId,
  )
  if (!artifact) {
    return { ok: false, code: 'not_found', error: 'Unknown artifactId' }
  }

  const evidenceId = `ev-eve-${contentHash(candidate.agentId + candidate.observedAt + candidate.assertion)}`
  const record: EvidenceRecord = {
    id: evidenceId,
    tenantId: candidate.tenantId,
    artifactId: candidate.artifactId,
    domain: candidate.domain,
    assertion: candidate.assertion.slice(0, 2000),
    source: `eve:${candidate.agentId}:${candidate.sourceLabel}`,
    observedAt: candidate.observedAt,
    /** Eve never elevates past observed — humans / policy path elevates */
    verification: 'observed',
    contentHash: candidate.contentHash || contentHash(candidate.assertion),
    isSeed: false,
  }
  await store.appendEvidence(record)

  const evidence = await store.listEvidence(
    candidate.artifactId,
    candidate.tenantId,
  )
  const evaluation = evaluatePolicy({
    artifact,
    evidence,
    tenantId: candidate.tenantId,
    environment: 'development',
    dataClassification: 'public',
    deploymentBoundary: 'local_only',
    intendedUse: artifact.purpose.slice(0, 160),
  })

  let reviewTaskId: string | undefined
  if (
    evaluation.verdict === 'review_required' ||
    evaluation.verdict === 'deny' ||
    evaluation.verdict === 'conditional'
  ) {
    reviewTaskId = `rt-${contentHash(evidenceId + evaluation.verdict)}`
    const task: ReviewTaskV1 = {
      contractVersion: '1',
      kind: 'review_task',
      tenantId: candidate.tenantId,
      artifactId: candidate.artifactId,
      reason: evaluation.failingChecks.join(', ') || evaluation.verdict,
      plainEnglish: evaluation.explanation,
      policyVerdict: evaluation.verdict,
      failingChecks: evaluation.failingChecks,
      status: 'open',
      createdAt: new Date().toISOString(),
      agentId: 'policy_explainer',
      runId: candidate.runId,
    }
    workflow.reviewTasks.unshift(task)

    await store.appendActivity({
      id: `act-${reviewTaskId}`,
      tenantId: candidate.tenantId,
      source: 'policy',
      verification: 'observed',
      artifactId: candidate.artifactId,
      whatHappened: `Re-review trigger for ${artifact.name}: ${evaluation.verdict}`,
      whyItMatters: evaluation.explanation.slice(0, 400),
      securistAction:
        'Open Artifact Profile and complete evidence before expanding use.',
      visibility: 'public',
      occurredAt: new Date().toISOString(),
      isSeed: false,
    })

    // In-memory status nudge only; durable decision writes remain human-gated
    const next =
      evaluation.verdict === 'deny'
        ? applyMaterialTrigger(
            artifact.status === 'approved' || artifact.status === 'conditional'
              ? artifact.status
              : 'watching',
          )
        : applyMaterialTrigger(
            artifact.status === 'approved' ? 'approved' : artifact.status,
          )
    if (next.ok) {
      artifact.status = next.to
      artifact.updatedAt = new Date().toISOString()
    } else if (evaluation.verdict === 'deny') {
      artifact.status = 'paused'
      artifact.updatedAt = new Date().toISOString()
    } else {
      artifact.status = 'review_required'
      artifact.updatedAt = new Date().toISOString()
    }
  }

  return {
    ok: true,
    data: {
      evidenceId,
      reviewTaskId,
      verdict: evaluation.verdict,
    },
  }
}

/** Policy explainer / validation planner → store proposal only */
export async function submitValidationPlan(
  plan: ValidationPlanV1,
): Promise<GatewayResult<{ planId: string }>> {
  if (
    !fieldEquals(plan, 'contractVersion', '1') ||
    !fieldEquals(plan, 'kind', 'validation_plan')
  ) {
    return { ok: false, code: 'contract', error: 'Invalid validation plan' }
  }
  if (!fieldEquals(plan, 'executesOnPrivateData', false)) {
    return {
      ok: false,
      code: 'boundary',
      error: 'Validation planner must not execute on private data',
    }
  }
  if (!isEveAgent(plan.agentId) || plan.agentId !== 'validation_planner') {
    return {
      ok: false,
      code: 'agent',
      error: 'Only validation_planner may submit plans',
    }
  }
  if (!redactOk(JSON.stringify(plan))) {
    return { ok: false, code: 'redaction', error: 'Private material rejected' }
  }
  const store = await getDecisionGraphStore()
  if (!(await store.getArtifact(plan.artifactId, plan.tenantId))) {
    return { ok: false, code: 'not_found', error: 'Unknown artifactId' }
  }
  workflow.validationPlans.unshift(plan)
  return {
    ok: true,
    data: { planId: `vp-${contentHash(plan.createdAt + plan.artifactId)}` },
  }
}

/** Contribution planner → draft only; never creates PR */
export function submitContributionProposal(
  proposal: ContributionProposalV1,
): GatewayResult<{ proposalId: string }> {
  if (
    !fieldEquals(proposal, 'contractVersion', '1') ||
    !fieldEquals(proposal, 'kind', 'contribution_proposal')
  ) {
    return {
      ok: false,
      code: 'contract',
      error: 'Invalid contribution proposal',
    }
  }
  if (!fieldEquals(proposal, 'requiresHumanApproval', true)) {
    return {
      ok: false,
      code: 'approval',
      error: 'Contribution proposals must require human approval',
    }
  }
  if (proposal.status !== 'draft') {
    return {
      ok: false,
      code: 'status',
      error: 'Eve may only create draft proposals',
    }
  }
  if (
    !isEveAgent(proposal.agentId) ||
    proposal.agentId !== 'contribution_planner'
  ) {
    return {
      ok: false,
      code: 'agent',
      error: 'Only contribution_planner may submit drafts',
    }
  }
  if (!redactOk(JSON.stringify(proposal))) {
    return { ok: false, code: 'redaction', error: 'Private material rejected' }
  }
  workflow.contributionProposals.unshift(proposal)
  return {
    ok: true,
    data: {
      proposalId: `cp-${contentHash(proposal.createdAt + proposal.title)}`,
    },
  }
}

/** TARX / local operator → signed validation summary (minimized) */
export async function submitValidationSummary(
  summary: SignedValidationSummaryV1,
): Promise<GatewayResult<{ runId: string }>> {
  if (
    !fieldEquals(summary, 'contractVersion', '1') ||
    !fieldEquals(summary, 'kind', 'validation_summary')
  ) {
    return { ok: false, code: 'contract', error: 'Invalid validation summary' }
  }
  if (!redactOk(JSON.stringify(summary))) {
    return { ok: false, code: 'redaction', error: 'Private material rejected' }
  }
  if (!String(summary.tenantId || '').trim()) {
    return {
      ok: false,
      code: 'tenant_required',
      error: 'tenantId required before persist',
    }
  }
  const store = await getDecisionGraphStore()
  if (!(await store.getArtifact(summary.artifactId, summary.tenantId))) {
    return { ok: false, code: 'not_found', error: 'Unknown artifactId' }
  }
  const runId = `val-${contentHash(summary.operatorId + summary.ranAt)}`
  await store.appendActivity({
    id: `act-${runId}`,
    tenantId: summary.tenantId,
    source: 'operator',
    verification: 'observed',
    artifactId: summary.artifactId,
    whatHappened: `Local validation summary from ${summary.runtime}`,
    whyItMatters: summary.resultSummary.slice(0, 400),
    securistAction:
      'Human reviews signed summary; may approve contribution next.',
    visibility: 'organization',
    occurredAt: summary.ranAt,
    isSeed: false,
  })
  return { ok: true, data: { runId } }
}

export function listWorkflowState() {
  return {
    reviewTasks: workflow.reviewTasks.slice(0, 50),
    validationPlans: workflow.validationPlans.slice(0, 50),
    contributionProposals: workflow.contributionProposals.slice(0, 50),
  }
}

/**
 * Demo vertical slice (deterministic, no live Eve process required).
 * Watched change → candidate evidence → policy → review task + test plan.
 */
export async function runVerticalSliceDemo(
  artifactId = 'art-scout-daemon',
): Promise<
  GatewayResult<{
    stages: string[]
    evidenceId?: string
    reviewTaskId?: string
    planId?: string
  }>
> {
  const stages: string[] = []
  const ts = new Date().toISOString()

  stages.push('watched_artifact_changed')
  const ev = await submitCandidateEvidence({
    contractVersion: '1',
    kind: 'candidate_evidence',
    tenantId: 'public-demo',
    artifactId,
    domain: 'security',
    assertion:
      'Eve Scout (demo): no new public security advisory observed in allowlisted window; change analyst should still compare digests on next release.',
    sourceLabel: 'public-watchlist-demo',
    sourceUrl: 'https://github.com/Securist-InfoSec/scout-daemon',
    observedAt: ts,
    agentId: 'scout',
    runId: `demo-${Date.now()}`,
  })
  stages.push('eve_scout_candidate_evidence')
  if (!ev.ok) return ev

  stages.push('deterministic_policy_rereview')
  if (ev.data.reviewTaskId) stages.push('profile_review_required')

  const gap = await submitCandidateEvidence({
    contractVersion: '1',
    kind: 'candidate_evidence',
    tenantId: 'public-demo',
    artifactId: 'art-securebert',
    domain: 'license',
    assertion:
      'unknown license — Scout could not confirm SPDX on public card (demo).',
    sourceLabel: 'hf-public-card',
    observedAt: ts,
    agentId: 'change_analyst',
    runId: `demo-gap-${Date.now()}`,
  })
  stages.push('eve_explanation_and_test_plan')

  const plan = await submitValidationPlan({
    contractVersion: '1',
    kind: 'validation_plan',
    tenantId: 'public-demo',
    artifactId: 'art-securebert',
    recipe:
      '1) Pull model locally under HF license. 2) Run smoke eval on public sample only. 3) Record digest + runtime versions. 4) Do not upload weights.',
    dataBoundary: 'local_only',
    expectedEvidence: ['license', 'model_governance', 'provenance'],
    agentId: 'validation_planner',
    createdAt: ts,
    executesOnPrivateData: false,
  })

  stages.push('human_approves_local_validation')
  stages.push('tarx_signed_summary')
  stages.push('human_approves_upstream_or_adapter')

  return {
    ok: true,
    data: {
      stages,
      evidenceId: ev.data.evidenceId,
      reviewTaskId: gap.ok ? gap.data.reviewTaskId : ev.data.reviewTaskId,
      planId: plan.ok ? plan.data.planId : undefined,
    },
  }
}
