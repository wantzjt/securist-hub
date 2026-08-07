---
id: WO-016
title: "Public Assess Resilience (timeout, cache, honest failure)"
status: in_review
owner: grok
branch: ops/wo-016-public-assess-resilience
depends_on:
  - WO-010
  - WO-014
contracts:
  - packages/contracts/src/public-assess.ts
  - src/lib/public-repo-assess.ts
acceptance:
  - Explicit GitHub outbound timeout on public assess fetches
  - Bounded public-fact cache (no private input; no customer secrets)
  - Honest upstream-failure / rate-limit states (no fake claims)
  - Production rate-control checklist documented for humans
  - Still no privileged token on anonymous assess; no Graph/tenant writes
non_goals:
  - Privileged GitHub tokens for anonymous assess
  - Private-input logging
  - Accounts or Team Graph
  - Fake or inflated rate-limit guarantees
  - Private repo assessment
verification:
  - npm run test:public-assess
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:decision-brief-contracts
  - npm run operator:build
  - npm run test:operator
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
---

# WO-016 — Public Assess Resilience

## Intent

Harden live `secur.ist/assess` against GitHub API flakiness and load without weakening the public-assess trust boundary.

## Scope

1. Explicit outbound timeout on GitHub API calls  
2. Bounded cache of **public** repo facts only (key = owner/repo; never intendedUse)  
3. Honest error states for timeout / upstream 5xx / rate limit  
4. Human production rate-control checklist  

## Non-goals

Tokens for anonymous path · private input logging · accounts · Graph writes · pretend SLAs

## Progress

- 2026-08-07: Claimed after launch merges (#29 front door, #30 funnel) and WO-014 Dependabot exemption.
