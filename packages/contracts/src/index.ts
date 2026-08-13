/**
 * @securist/contracts v0.1
 *
 * Eve agents may propose.
 * Securist contracts decide (policy + graph).
 * Humans approve external writes.
 *
 * Eve is NOT the Decision Graph, policy engine, or local operator runtime.
 */
export * from './evidence'
export * from './proposals'
export * from './agents'
export * from './graph'
export * from './decision-brief'
export * from './public-assess'
export * from './local-assess'
export * from './team-graph'

export const CONTRACTS_VERSION = '0.1.6' as const
