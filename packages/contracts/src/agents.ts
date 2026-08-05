/**
 * Narrow Eve specialist agents. Isolated tools/context ≠ security boundary.
 * Write tools still need explicit approval + Securist authorization.
 */
export const EVE_AGENT_IDS = [
  'scout',
  'change_analyst',
  'policy_explainer',
  'validation_planner',
  'contribution_planner',
] as const

export type EveAgentId = (typeof EVE_AGENT_IDS)[number]

export const EVE_AGENT_ROLES: Record<
  EveAgentId,
  { title: string; mayWrite: string; mustNot: string }
> = {
  scout: {
    title: 'Scout agent',
    mayWrite: 'Candidate evidence from allowlisted public GH/HF sources',
    mustNot: 'Mutate approvals, access private repos without scope, claim LIVE without observation',
  },
  change_analyst: {
    title: 'Change analyst',
    mayWrite: 'Material-drift explanations vs last approved snapshot',
    mustNot: 'Auto-stale approvals without Securist policy re-run',
  },
  policy_explainer: {
    title: 'Policy explainer',
    mayWrite: 'Plain-English summaries of deterministic policy failures',
    mustNot: 'Override policy verdict or invent failing checks',
  },
  validation_planner: {
    title: 'Validation planner',
    mayWrite: 'Local test recipe + boundary + expected evidence',
    mustNot: 'Run on private data or pull customer content to Eve',
  },
  contribution_planner: {
    title: 'Contribution planner',
    mayWrite: 'Draft issue/docs/patch in sandbox as proposal',
    mustNot: 'Create upstream PR or push default branch without human approval',
  },
}

/** Vertical slice stages (safe path) */
export const VERTICAL_SLICE_STAGES = [
  'watched_artifact_changed',
  'eve_scout_candidate_evidence',
  'deterministic_policy_rereview',
  'eve_explanation_and_test_plan',
  'profile_review_required',
  'human_approves_local_validation',
  'tarx_signed_summary',
  'human_approves_upstream_or_adapter',
] as const
