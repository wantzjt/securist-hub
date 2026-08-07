/**
 * Shared Decision Brief honesty envelope (WO-010 / WO-012).
 *
 * Both public and local briefs share source/verification discipline.
 * They do **not** share visibility or shareability:
 * - PublicDecisionBriefV1 — public, share-safe, ephemeral web draft
 * - LocalDecisionBriefV1 — private local evidence, never automatically shareable
 *
 * Do not reuse PublicDecisionBriefV1 for local repository assessment.
 */

export type DecisionBriefLabelV1 = 'LIVE' | 'HYBRID' | 'SEED'

/** Observed or seed-labeled fact with mandatory provenance. */
export type DecisionBriefObservedFactV1 = {
  domain: string
  assertion: string
  verification: 'observed' | 'seed' | 'verified' | 'human_reviewed'
  /**
   * Provenance reference. For local briefs: relative, redacted, or catalog id —
   * never absolute filesystem paths or secret-bearing URLs.
   */
  source: string
}

/**
 * Common honesty fields for every Decision Brief draft.
 * Surfaces must not invent competing honesty shapes.
 */
export type DecisionBriefHonestyV1 = {
  contractVersion: '1'
  /** Pre-R1 drafts are never durable tenant decisions. */
  durable: false
  label: DecisionBriefLabelV1
  /** Draft briefs start not_reviewed; approval is a separate Decision Graph write. */
  decisionStatus: 'not_reviewed'
  observed: DecisionBriefObservedFactV1[]
  unknowns: string[]
  evidenceGaps: string[]
  reReviewTriggers: string[]
  /**
   * Non-authoritative only — never an approval or Decision Graph write.
   */
  policyHints: string[]
  disclaimers: string[]
}

export type DecisionBriefPersistenceV1 =
  | 'ephemeral_client_only'
  | 'local_only'
