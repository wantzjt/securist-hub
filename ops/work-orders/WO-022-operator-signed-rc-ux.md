---
id: WO-022
title: "Operator UX: signed RC path + roadmap honesty"
status: complete
owner: grok
branch: feat/wo-022-operator-signed-rc-ux
depends_on:
  - WO-020
  - WO-021
contracts: []
acceptance:
  - /operator presents two honest paths: monorepo and signed RC tarball
  - Signed RC path does not claim public download, public npm, or npx
  - product-surface constants cover OPERATOR_RC_COMMANDS + distribution status
  - Ladder private step mentions monorepo or signed RC, not Electron/npx
  - ROADMAP / OPERATOR-RELEASE-LANE / BUYER status reflect Gate 1 + WO-021 done
  - product-surface + golden-path suites green
  - No Graph/auth/billing/Postgres/publish changes
non_goals:
  - GitHub Release publish or npm publish
  - Public download URL for RC tarball
  - Claiming public npx available
  - R1 provision
  - Electron desktop product
verification:
  - npm run test:product-surface
  - npm run test:golden-path
  - npm run test:public-assess
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:operator
  - npm run build
  - npm run verify:coordination
  - npm run verify:clean-worktree
---

# WO-022 — Operator signed RC UX

## Context

Gate 1 (WO-020) and automated dogfood (WO-021) proved signed Operator RCs.
The public `/operator` page still taught **only** monorepo clone—developers who
receive a signed tarball had no first-class UX path. Roadmap docs lagged
completion status.

## Plan

1. Add `OPERATOR_RC_COMMANDS` + distribution status to product-surface.
2. Rewrite `/operator` as dual path (monorepo · signed RC) with fail-closed honesty.
3. Align ROADMAP, OPERATOR-RELEASE-LANE, BUYER-MESSAGING.
4. Extend product-surface fixtures.

## Progress

- 2026-08-10 — Claimed; implementation.

## Blockers

None for site/docs. Actual public distribution remains human publish gate E–F.
