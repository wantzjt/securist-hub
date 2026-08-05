---
id: WO-004
title: Design-partner interviews (wedge validation)
status: ready
owner: human
branch: ""
depends_on:
  - WO-003
contracts:
  - docs/STRATEGIC-WEDGE-RESEARCH.md
  - docs/DESIGN-PARTNER-INTERVIEW-KIT.md
  - docs/DECISIONS.md
acceptance:
  - At least 5 interviews attempted using the kit scoring sheet
  - Written confirm/revise/kill judgment on the wedge
  - If confirm: human decision recorded in DECISIONS.md (or explicit defer)
  - No product scope expansion without a new work order
non_goals:
  - Product engineering on this work order
  - Paid conversion metrics as success criteria for the research phase
  - Agent-led impersonation of customer interviews
  - Postgres provision (WO-005 / RM-003)
verification:
  - Interview notes exist (private; not necessarily in git)
  - DECISIONS.md updated only by human when ICP accepted/rejected
  - npm run verify:coordination when any repo docs change
---

# WO-004 — Design-partner interviews

## Context

WO-003 published a cited wedge hypothesis. Validation requires human conversations using [`docs/DESIGN-PARTNER-INTERVIEW-KIT.md`](../../docs/DESIGN-PARTNER-INTERVIEW-KIT.md).

## Plan

1. Recruit 5–8 ICP-matching partners (security/platform eng).  
2. Run kit; score confirm/revise/kill.  
3. Human appends decision outcome to `DECISIONS.md` if ready.  
4. Open product work orders only for confirmed gaps (e.g. allowlisted change detection).

## Progress

- 2026-08-05: Filed `ready`; blocked on human calendar, not engineering.

## Blockers

- Human time / partner access.
