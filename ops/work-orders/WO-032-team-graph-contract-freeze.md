---
id: WO-032
title: 'Team Graph contract freeze (pre-R1)'
status: in_review
owner: grok
branch: feat/wo-032-team-graph-contracts
depends_on:
  - WO-031
contracts:
  - packages/contracts/src/team-graph.ts
  - docs/TEAM-GRAPH-CONTRACTS.md
  - docs/CANONICAL-CONTRACTS.md
  - docs/R1-READINESS-PACK.md
  - src/lib/team-graph-stub.ts
  - src/routes/team.tsx
  - migrations/001_decision_graph.sql
acceptance:
  - Frozen contracts for Decision / owner / policy / evidence / re-review request matching roadmap language
  - Stub API plus /team UI remain coming next / not live with zero LIVE Team Graph claims
  - Migration notes for WO-008 handoff; no DATABASE_URL; no Postgres provision
  - R1-READINESS-PACK aligned; R1 not activated
  - Explicit R1/Postgres is John-only (WO-008)
non_goals:
  - Human Postgres / R1 activation
  - Team Graph live
  - Announce
  - package registry publish
  - WO-033 fake durability loop
verification:
  - npm run test:team-graph-contracts
  - npm run test:product-surface
  - rg for Team Graph / contract freeze / pre-R1 / WO-032 artifacts
  - rg for WO-008 / John-only / not live until R1 callouts
  - verify:coordination and lint
---

# WO-032 — Team Graph contract freeze (pre-R1)

## Context

Freeze Team Graph types, API stubs, and honesty labels before R1 so Build and COS stop drifting. **R1 / Postgres durability remains John-only (WO-008).** Team Graph is **not live** until R1 is human-signed.

## Plan

- Versioned contracts in `packages/contracts/src/team-graph.ts`
- Stub GET/POST that refuse durable writes and ignore DATABASE_URL
- `/team` shows owner / policy / evidence / re-review on one artifact as coming next
- Migration notes mapped onto `001_decision_graph.sql` for WO-008
- Align R1-READINESS-PACK; do not activate R1

## Progress

- 2026-08-12 — Implementation on branch feat/wo-032-team-graph-contracts; PR open.

## Blockers

None for this freeze. Durability remains blocked on WO-008.
