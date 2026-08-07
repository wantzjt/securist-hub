---
id: WO-013
title: "Open-build GitHub front door (README + community docs)"
status: in_progress
owner: grok
branch: docs/wo-013-open-build-front-door
depends_on:
  - WO-012
contracts: []
acceptance:
  - README states product sentence, ladder, live vs not-live, try paths, verification
  - Explicit no public npx until signed distribution
  - CODE_OF_CONDUCT, SUPPORT, CHANGELOG, BUILDING-IN-PUBLIC present with real boundaries
  - GitHub About metadata checklist for human apply
  - Full verification suite green; no product/schema/UI changes
non_goals:
  - Deploy, package publish, release signing
  - Team Graph, accounts, billing, UI expansion
  - Contract/schema/state-machine changes
  - Changing repository description via API without human checklist
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:public-assess
  - npm run test:decision-brief-contracts
  - npm run operator:build
  - npm run test:operator
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
---

# WO-013 — Open-build front door

## Context

Public product (secur.ist) and CI posture are launch-ready. GitHub README still frames “dual-forge / open index / field layer,” which undercuts credibility.

## Progress

- 2026-08-07: Claimed; front-door docs PR.
