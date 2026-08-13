---
id: WO-033
title: "Re-review on material change (north-star loop)"
status: complete
owner: grok
branch: feat/wo-033-re-review-loop
depends_on:
  - WO-032
  - WO-008
contracts:
  - packages/contracts/src/re-review-loop.ts
  - src/lib/decision-graph/re-review-loop.ts
  - docs/RE-REVIEW-LOOP.md
  - docs/TEAM-GRAPH-CONTRACTS.md
  - docs/SESSION-RESUME.md
acceptance:
  - Re-review request on material change for one artifact covering owner, policy, evidence, re-review
  - Audit trail records what changed, which policy, who must re-approve
  - Fail closed if graph store is not postgres
  - /team and public copy remain NOT LIVE for Team Graph
non_goals:
  - Flipping /team to LIVE
  - Marking WO-008 complete
  - Paid Team Graph GA claim
  - Fake durability / in-memory live loop
verification:
  - test:re-review-loop
  - test:team-graph-contracts
  - test:product-surface
  - verify:coordination
  - lint
---

# WO-033 — Re-review on material change (north-star loop)

## Context

North-star loop: material change reopens permission and requires accountable re-review against the provisioned Postgres Decision Graph. Team Graph product surface stays **not live**. Infra durable is not paid Team Graph GA. WO-008 human exit remains open.

## Plan

- Fail-closed loop module (no in-memory live path)
- Persist change event, reopen artifact/decision to `review_required`, project activity
- Audit: what changed, policy id/version, named human owner
- Keep `/team` Coming next / stub
- Document product-truth checklist and owner path

## Progress

- 2026-08-12 — Filed `blocked` after WO-032 merge (PR #74). Not started. No fake durability.
- 2026-08-13 — Unstuck to `in_review` on feat/wo-033-re-review-loop. Postgres store provisioned (infra). Team Graph UI not live.
- 2026-08-13 — PR #77 merged (`b7cca11`). Complete. /team remains Coming next. WO-008 exit still unsigned.

## Blockers

None for this loop. WO-008 remains human-owned (exit unsigned). Do not claim Team Graph live.
