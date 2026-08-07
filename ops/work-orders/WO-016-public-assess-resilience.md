---
id: WO-016
title: "Public Assess Resilience (timeout, cache, honest failure)"
status: proposed
owner: unassigned
branch: ""
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
  - Full suite including verify:system-graph and clean-worktree
---

# WO-016 — Public Assess Resilience (queued)

**Status: proposed — do not implement until claimed after WO-014.**

## Intent

Harden live `secur.ist/assess` against GitHub API flakiness and load without weakening the public-assess trust boundary.

## Scope (when claimed)

1. Explicit outbound timeout on GitHub API calls  
2. Bounded cache of **public** repo facts only  
3. Honest error states for timeout / upstream 5xx / rate limit  
4. Human production rate-control checklist  

## Non-goals

Tokens for anonymous path · private input logging · accounts · Graph writes · pretend SLAs
