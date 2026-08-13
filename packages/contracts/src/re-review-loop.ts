/**
 * North-star re-review loop (WO-033).
 *
 * Material change -> permission reopens -> accountable re-review.
 * Runs only against a postgres Decision Graph store.
 * Team Graph product surface remains NOT LIVE. Infra durable != paid GA.
 */
import type { TeamGraphReReviewTriggerV1 } from './team-graph'

export const RE_REVIEW_LOOP_WORK_ORDER = 'WO-033' as const
export const RE_REVIEW_LOOP_CONTRACT_VERSION = '1' as const
export const RE_REVIEW_PRODUCT_SURFACE = 'not_live' as const
export const RE_REVIEW_ERROR_NOT_POSTGRES = 'graph_store_not_postgres' as const
export const RE_REVIEW_ERROR_MISSING_CLIENT = 'missing_postgres_client' as const
export const RE_REVIEW_ERROR_ARTIFACT_NOT_FOUND = 'artifact_not_found' as const
export const RE_REVIEW_ERROR_TRANSITION_DENIED = 'transition_denied' as const

export const RE_REVIEW_NOT_POSTGRES_MESSAGE =
  'North-star re-review loop is fail-closed unless SECURIST_GRAPH_STORE=postgres. In-memory/seed is not a live loop. Team Graph product surface remains not live.' as const

export type ReReviewProductSurfaceV1 = typeof RE_REVIEW_PRODUCT_SURFACE

export type MaterialChangeInputV1 = {
  contractVersion: typeof RE_REVIEW_LOOP_CONTRACT_VERSION
  kind: 'material_change'
  tenantId: string
  artifactId: string
  artifactVersionId?: string
  trigger: TeamGraphReReviewTriggerV1
  whatChanged: string
  whyItMatters: string
  beforeFingerprint?: string
  afterFingerprint?: string
  requestedBy: string
  occurredAt?: string
}

export type ReReviewAuditTrailV1 = {
  contractVersion: typeof RE_REVIEW_LOOP_CONTRACT_VERSION
  kind: 're_review_audit_trail'
  workOrder: typeof RE_REVIEW_LOOP_WORK_ORDER
  whatChanged: string
  whyItMatters: string
  trigger: TeamGraphReReviewTriggerV1
  policyId: string
  policyVersion: string
  policyName: string
  whoMustReApprove: {
    ownerId: string
    displayName: string
    accountableHuman: true
  }
  priorStatus: string
  newStatus: 'review_required'
  changeEventId: string
  decisionId: string
  activityId: string
  evidenceIds: string[]
}

export type NorthStarReReviewRequestV1 = {
  contractVersion: typeof RE_REVIEW_LOOP_CONTRACT_VERSION
  kind: 'north_star_re_review_request'
  workOrder: typeof RE_REVIEW_LOOP_WORK_ORDER
  live: false
  storeMode: 'postgres'
  productSurface: ReReviewProductSurfaceV1
  artifactId: string
  artifactVersionId?: string
  trigger: TeamGraphReReviewTriggerV1
  reason: string
  requestedBy: string
}

export type ReReviewLoopOkV1 = {
  ok: true
  live: false
  storeMode: 'postgres'
  productSurface: ReReviewProductSurfaceV1
  permissionReopened: true
  request: NorthStarReReviewRequestV1
  audit: ReReviewAuditTrailV1
}

export type ReReviewLoopFailClosedV1 = {
  ok: false
  live: false
  productSurface: ReReviewProductSurfaceV1
  error:
    | typeof RE_REVIEW_ERROR_NOT_POSTGRES
    | typeof RE_REVIEW_ERROR_MISSING_CLIENT
    | typeof RE_REVIEW_ERROR_ARTIFACT_NOT_FOUND
    | typeof RE_REVIEW_ERROR_TRANSITION_DENIED
    | 'missing_database_url'
    | 'missing_default_tenant_id'
    | 'invalid_store_mode'
    | 'tenant_required'
  message: string
}

export type ReReviewLoopResultV1 = ReReviewLoopOkV1 | ReReviewLoopFailClosedV1

export const PRODUCT_TRUTH_REREVIEW_CHECKLIST_V1 = [
  'Brief surface still matches SESSION-RESUME',
  'Admission packs still say Team Graph is not live',
  'Public copy /team remains Coming next',
] as const

export function reReviewFailClosed(
  error: ReReviewLoopFailClosedV1['error'],
  message?: string,
): ReReviewLoopFailClosedV1 {
  return {
    ok: false,
    live: false,
    productSurface: 'not_live',
    error,
    message:
      message ||
      (error === RE_REVIEW_ERROR_NOT_POSTGRES
        ? RE_REVIEW_NOT_POSTGRES_MESSAGE
        : 'North-star re-review failed closed: ' + error),
  }
}
