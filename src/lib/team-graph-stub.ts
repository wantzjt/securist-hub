/**
 * Team Graph stub API (WO-032).
 *
 * Honest pre-R1 surface: typed contracts, no durable writes,
 * no DATABASE_URL, no Postgres, Team Graph not live.
 *
 * Do not import decision-graph store/config from this module.
 */
import {
  TEAM_GRAPH_ILLUSTRATION_V1,
  teamGraphNotLive,
  teamGraphStatus,
} from '../../packages/contracts/src/team-graph'
import type {
  TeamGraphReReviewRequestV1,
  TeamGraphStatusV1,
  TeamGraphStubErrorV1,
} from '../../packages/contracts/src/team-graph'

export {
  TEAM_GRAPH_DURABLE,
  TEAM_GRAPH_ERROR_NOT_LIVE,
  TEAM_GRAPH_HONESTY_V1,
  TEAM_GRAPH_ILLUSTRATION_V1,
  TEAM_GRAPH_LIVE,
  TEAM_GRAPH_NOT_LIVE_MESSAGE,
  TEAM_GRAPH_PERSISTENCE,
  TEAM_GRAPH_R1_GATE,
  TEAM_GRAPH_STATUS_LABEL,
  teamGraphNotLive,
  teamGraphStatus,
} from '../../packages/contracts/src/team-graph'

const FORBIDDEN_ENV = [
  'DATABASE_URL',
  'SECURIST_DATABASE_URL',
  'SECURIST_GRAPH_STORE',
  'SECURIST_DEFAULT_TENANT_ID',
] as const

/**
 * Stub must not consult durability env. Presence of DATABASE_URL is ignored.
 * This function never reads those keys — listed only so tests can prove it.
 */
export const TEAM_GRAPH_STUB_IGNORES_ENV = FORBIDDEN_ENV

export function getTeamGraphStubStatus(): TeamGraphStatusV1 {
  return teamGraphStatus()
}

export function getTeamGraphOneArtifact(
  artifactId: string,
): TeamGraphStubErrorV1 {
  void artifactId
  return teamGraphNotLive('get_one_artifact')
}

export function requestTeamGraphReReview(
  _request: TeamGraphReReviewRequestV1,
): TeamGraphStubErrorV1 {
  void _request
  return teamGraphNotLive('request_re_review')
}

export function teamGraphIllustration() {
  return TEAM_GRAPH_ILLUSTRATION_V1
}
