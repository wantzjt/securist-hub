---
id: WO-003
title: Strategic wedge research (Decision Graph GTM)
status: complete
owner: grok
branch: docs/wo-003-strategic-wedge-research
depends_on:
  - WO-001
contracts:
  - docs/ROADMAP.md
  - docs/DECISIONS.md
  - docs/SYSTEM-MODEL.md
  - docs/V1-LAUNCH-ROADMAP.md
  - docs/STRATEGIC-WEDGE-RESEARCH.md
acceptance:
  - docs/STRATEGIC-WEDGE-RESEARCH.md published with cited primary sources
  - Deep-dive competitive map, JTBD forces, design-partner kit, RM-003 checklist linkage
  - First buyer JTBD, alternatives, wedge, ICP, pricing hypothesis, design-partner questions
  - One-page recommendation with first customer, artifact class, paid workflow, outcome, and 12-month non-build list
  - No invented market statistics
  - Work order + PR body follow coordination protocol
  - verify:coordination green
non_goals:
  - Product code, schema, state machine, or store changes
  - Database provision, Vercel env, deploy, credentials
  - Changing PR #4 / Postgres seam implementation
  - Claiming validated GTM without design-partner interviews
  - Competing strategy that replaces V1-LAUNCH-ROADMAP or SYSTEM-MODEL
verification:
  - npm run verify:coordination
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run build
---

# WO-003 — Strategic wedge research

## Context

Securist’s compounding asset is the Decision Graph (adopt → validate → govern → re-review → contribute), not an activity feed. Public Decision Graph V1 and the durable store seam (WO-002 / PR #4) are on `main`. Before more product surface, the team needs a cited wedge and ICP hypothesis for design partners.

## Plan

1. Research alternatives from primary product/docs sources (GitHub, SCA/supply-chain, model governance, internal process).
2. Write `docs/STRATEGIC-WEDGE-RESEARCH.md` answering JTBD, alternatives, wedge, ICP, pricing, interviews, recommendation.
3. Register work item on roadmap; open focused docs PR.

## Progress

- 2026-08-05: Claimed; research on `docs/wo-003-strategic-wedge-research` (PR #5).
- 2026-08-05: Deep dive — competitive map, JTBD forces, kit, WO-004/WO-005, roadmap realignment.
- 2026-08-05: Merged PR #5 (`e3986aa`). Complete. Interviews = WO-004. Provision = WO-005.

## Blockers

- None for this WO.
