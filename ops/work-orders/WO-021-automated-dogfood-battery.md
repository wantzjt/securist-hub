---
id: WO-021
title: "Automated dogfood / golden-path battery"
status: complete
owner: grok
branch: test/wo-021-automated-dogfood-battery
depends_on:
  - WO-020
contracts: []
acceptance:
  - CI-safe golden-path suite covers Assess → Operator ladder honesty
  - Production trust-root integrity asserted (not burned fixture)
  - Dogfood RC pack + verify-clean via dir and tarball green
  - Adversarial fail-closed (forged signature, missing identity, wrong key)
  - When SECURIST_OPERATOR_SIGNING_KEY present: production RC + verify-clean green
  - npm run test:golden-path wired into CI
  - No private keys committed; publicNpxClaim remains false
non_goals:
  - Human manual dogfood cohort ops
  - npm publish / public npx unlock
  - R1 Postgres provision
  - Vercel / Datadog product changes
  - Website redesign
verification:
  - npm run test:golden-path
  - npm run test:operator-rc
  - npm run test:operator
  - npm run test:public-assess
  - npm run test:product-surface
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
  - npm run verify:coordination
  - npm run verify:clean-worktree
---

# WO-021 — Automated dogfood battery

## Context

Gate 1 public trust-root is on `main` (WO-020). Founder is **not** the dogfood
tester — agents must **pound** the golden path with automated fixtures:

```text
Public Assess (LIVE) → Local Operator signed RC → honest fail-closed
```

## Plan

1. Add `packages/operator/fixtures/run-golden-path-tests.ts`.
2. Wire `npm run test:golden-path` + CI.
3. Expand operator-rc fixtures where needed.
4. Locally exercise production-signed RC when offline key is present (not in CI secrets).

## Progress

- 2026-08-10 — Claimed; battery implementation.

## Blockers

None for CI path. Production-key assertions require founder offline key on the runner machine only.
