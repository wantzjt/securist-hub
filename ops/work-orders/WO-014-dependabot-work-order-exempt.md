---
id: WO-014
title: "Dependabot Work-Order exemption (author login only)"
status: in_review
owner: grok
branch: ops/wo-014-dependabot-work-order-exempt
depends_on:
  - WO-012
contracts: []
acceptance:
  - Human/agent PRs still require Work-Order: WO-XXX when REQUIRE_PR_WORK_ORDER=1
  - REQUIRE_PR_WORK_ORDER=0 skips check (CI sets only for dependabot[bot] login)
  - Exemption uses github.event.pull_request.user.login only — not branch/title/body
  - No weakening of branch protection, verify job, CodeQL, secret scanning, system-graph, clean-worktree
  - Full verification green
non_goals:
  - Product, contract, schema, or deploy changes
  - Exempting humans via branch names, titles, labels, or PR body content
  - Disabling Work-Order discipline for agents
  - WO-016 Public Assess Resilience (queued, not this PR)
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
  - Local: REQUIRE_PR_WORK_ORDER=1 without body fails; =0 passes
---

# WO-014 — Dependabot Work-Order exemption

## Problem

Dependabot PRs fail `verify:coordination` because PR bodies lack `Work-Order: WO-XXX`. Human/agent discipline must stay fully enforced.

## Decision

CI sets `REQUIRE_PR_WORK_ORDER=0` **only** when:

`github.event.pull_request.user.login == 'dependabot[bot]'`

`verify-coordination.mjs` honors `REQUIRE_PR_WORK_ORDER=0` as an explicit skip (previously pull_request event still forced the check).

## Progress

- 2026-08-07: Implemented; PR under this WO.

## Follow-on (not this WO)

**WO-016** (queue only): Public Assess Resilience — outbound timeout, bounded public-fact cache, honest upstream-failure state, production rate-control checklist. No tokens, private-input logging, accounts, Graph writes, or fake rate-limit claims.
