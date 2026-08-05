---
id: WO-006
title: Founder thesis — category-defining decision infrastructure
status: in_review
owner: grok
branch: docs/wo-006-founder-thesis
depends_on:
  - WO-003
contracts:
  - docs/SYSTEM-MODEL.md
  - docs/CANONICAL-CONTRACTS.md
  - docs/DECISIONS.md
  - docs/ROADMAP.md
  - docs/STRATEGIC-WEDGE-RESEARCH.md
  - docs/V1-LAUNCH-ROADMAP.md
  - docs/FOUNDER-THESIS.md
acceptance:
  - docs/FOUNDER-THESIS.md answers all seven founder questions with explicit choices
  - Distinguishes company from feed, catalog, agent wrapper, and scanner dashboard
  - No invented ARR, TAM, or pricing numbers
  - No product code, provision, credentials, or autonomous agents
  - Work-order protocol + verify:coordination green
non_goals:
  - Implementing product features
  - Database or Vercel changes
  - Closing design-partner deals
  - Replacing SYSTEM-MODEL or V1 launch history
  - Claiming market validation without interviews (WO-004)
verification:
  - npm run verify:coordination
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run build
---

# WO-006 — Founder thesis

## Context

Wedge research (WO-003) defined ICP and JTBD. Founder thesis answers whether Securist can become **category-defining decision infrastructure**—not a feature of GitHub/Snyk/HF.

## Plan

1. Write `docs/FOUNDER-THESIS.md` with sharp, non-hedging choices.
2. Link from roadmap; open focused research PR.

## Progress

- 2026-08-05: Claimed on `docs/wo-006-founder-thesis`.

## Blockers

- None for docs PR. Interviews (WO-004) and provision (WO-005) remain human tracks.
