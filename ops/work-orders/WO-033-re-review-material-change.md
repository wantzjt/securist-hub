---
id: WO-033
title: "Re-review on material change (north-star loop)"
status: blocked
owner: grok
branch: ""
depends_on:
  - WO-032
  - WO-008
contracts:
  - docs/TEAM-GRAPH-CONTRACTS.md
  - docs/SESSION-RESUME.md
  - docs/R1-READINESS-PACK.md
acceptance:
  - Documented re-review trigger for material changes
  - Loop artifacts re-check Brief surface, admission packs, and public claims
  - Evidence shows dependence on WO-032 plus human-signed R1
  - Owner path clear for COS vs Build vs John
  - Team Graph not live until R1
non_goals:
  - Shipping Team Graph live before human-signed R1
  - package registry publish
  - Broad announce
  - Bypassing WO-032 or John R1 sign-off
  - Fake durability / in-memory live loop
verification:
  - rg for re-review / material change / north-star docs
  - rg for WO-032 and human-signed R1 dependency callouts
  - verify:coordination and lint
---

# WO-033 — Re-review on material change (north-star loop)

## Context

North-star loop: when material product truth changes, Securist must re-review Briefs, packs, and claims. **Hard dependencies:** WO-032 complete and **human-signed R1 (WO-008)**. Do not implement a fake live loop beforehand.

## Plan

Deferred until WO-008 exit is human-signed.

## Progress

- 2026-08-12 — Filed `blocked` after WO-032 merge (PR #74). Not started. No fake durability.

## Blockers

- **Human-signed R1 / WO-008** not complete. Team Graph remains not live.
- Do not claim a live re-review loop on stub contracts.
