/**
 * Central decision status transitions.
 * Material triggers force review_required — never silent approved.
 */
import type { DecisionStatus } from './types'

export type TransitionResult =
  | { ok: true; to: DecisionStatus }
  | { ok: false; code: 'transition_denied'; error: string }

/** Allowed edges (from → to[]). */
const ALLOWED: Record<DecisionStatus, DecisionStatus[]> = {
  not_reviewed: ['watching', 'paused', 'review_required', 'retired'],
  watching: [
    'conditional',
    'approved',
    'paused',
    'review_required',
    'retired',
    'not_reviewed',
  ],
  conditional: ['approved', 'watching', 'paused', 'review_required', 'retired'],
  /** alias used in product copy */
  conditionally_approved: [
    'approved',
    'watching',
    'paused',
    'review_required',
    'retired',
    'conditional',
  ],
  approved: ['review_required', 'paused', 'retired', 'conditional'],
  review_required: [
    'conditional',
    'conditionally_approved',
    'approved',
    'paused',
    'watching',
    'retired',
  ],
  paused: ['watching', 'review_required', 'retired', 'not_reviewed'],
  retired: [],
}

export function canTransition(
  from: DecisionStatus,
  to: DecisionStatus,
): boolean {
  if (from === to) return true
  const next = ALLOWED[from]
  return next.includes(to)
}

export function transitionDecision(
  from: DecisionStatus,
  to: DecisionStatus,
): TransitionResult {
  if (from === to) return { ok: true, to }
  if (!canTransition(from, to)) {
    return {
      ok: false,
      code: 'transition_denied',
      error: `Illegal decision transition ${from} → ${to}`,
    }
  }
  return { ok: true, to }
}

/**
 * Material triggers must not leave the artifact quietly approved.
 * From approved (or conditional) → review_required.
 */
export function applyMaterialTrigger(
  current: DecisionStatus,
): TransitionResult {
  if (current === 'retired') {
    return {
      ok: false,
      code: 'transition_denied',
      error: 'Retired decisions do not re-open via material trigger',
    }
  }
  if (current === 'review_required') return { ok: true, to: 'review_required' }
  return transitionDecision(current, 'review_required')
}

export function normalizeStatus(s: DecisionStatus): DecisionStatus {
  if (s === 'conditionally_approved') return 'conditional'
  return s
}
