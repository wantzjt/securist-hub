/** Re-export contracts for hub internal use (single package until publish). */
export type {
  CandidateEvidenceV1,
  SignedValidationSummaryV1,
} from '../../../packages/contracts/src/evidence'
export type {
  ReviewTaskV1,
  ContributionProposalV1,
  ValidationPlanV1,
} from '../../../packages/contracts/src/proposals'
export {
  EVE_AGENT_IDS,
  EVE_AGENT_ROLES,
  VERTICAL_SLICE_STAGES,
  type EveAgentId,
} from '../../../packages/contracts/src/agents'
export { CONTRACTS_VERSION } from '../../../packages/contracts/src/index'
