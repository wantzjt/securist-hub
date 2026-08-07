---
id: WO-015
title: Public Decision Brief funnel surface
status: in_progress
owner: codex
branch: feat/wo-015-public-funnel
depends_on: []
contracts: []
acceptance:
  - Home explains the public assess, local/private, and shared/team ladder without claiming unavailable capabilities
  - A completed public Decision Brief has truthful next actions for local private assessment and future shared re-review
  - Services removes founder-led wording and retains its explicit service boundaries
  - No Decision Graph, persistence, authentication, analytics, or deployment behavior changes
non_goals:
  - Public npx distribution, accounts, Team Graph activation, or lead capture
  - New contracts, Graph state-machine changes, model calls, or external writes
  - Services expansion into pentesting, MSSP, MDR, GRC, or approval-on-behalf-of-customer positioning
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:public-assess
  - npm run test:decision-brief-contracts
  - npm run test:operator
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
---

# WO-015 — Public Decision Brief funnel surface

## Context

Securist already has a live public assess path and a source-available private
Local Operator, but the public site does not yet make the three-stage product
ladder explicit at the point of value. The services surface also retains
"Founder-led" copy that conflicts with the requested product posture.

## Plan

1. Add an availability ladder to home that routes public, local/private, and
   future shared/team needs without implying that R1 is live.
2. Add a compact, post-brief next-step block on `/assess`.
3. Reframe `/services` around a Re-review Response and fixed-scope Adoption
   Assurance, keeping all non-consulting and human-approval boundaries.
4. Do not alter any canonical contract or Decision Graph read/write path.

## Progress notes

- 2026-08-07: Claimed from a clean worktree after founder-authorized funnel
  direction. System model, canonical contracts, surface contracts, lifecycle,
  decision records, and system graph read before implementation.

## Blockers

- None.
