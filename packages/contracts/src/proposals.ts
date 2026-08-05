/**
 * Eve may draft proposals. Securist stores them as workflow state.
 * Humans approve before any external write (PR, adapter publish, etc.).
 */
export type ReviewTaskV1 = {
  contractVersion: '1'
  kind: 'review_task'
  tenantId: string
  artifactId: string
  reason: string
  plainEnglish: string
  policyVerdict?: 'approve' | 'conditional' | 'review_required' | 'deny'
  failingChecks?: string[]
  proposedLocalTestPlan?: string
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed'
  createdAt: string
  agentId: string
  runId?: string
}

export type ContributionProposalV1 = {
  contractVersion: '1'
  kind: 'contribution_proposal'
  tenantId: string
  artifactId: string
  proposalType: 'issue' | 'docs' | 'patch' | 'adapter'
  title: string
  body: string
  /** Never auto-create PR — human approval required */
  requiresHumanApproval: true
  status: 'draft' | 'approved' | 'rejected' | 'submitted'
  createdAt: string
  agentId: string
  sandboxRef?: string
}

export type ValidationPlanV1 = {
  contractVersion: '1'
  kind: 'validation_plan'
  tenantId: string
  artifactId: string
  recipe: string
  dataBoundary: 'local_only' | 'controlled_cloud' | 'external_service'
  expectedEvidence: string[]
  agentId: string
  createdAt: string
  /** Eve proposes only — does not execute on private data */
  executesOnPrivateData: false
}
