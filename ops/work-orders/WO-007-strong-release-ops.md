---
id: WO-007
title: Strong Release Operations (R0–R3 train)
status: complete
owner: grok
branch: ops/wo-007-strong-release
depends_on:
  - WO-006
contracts:
  - docs/RELEASE-PLAN.md
  - docs/FOUNDER-THESIS.md
  - docs/ROADMAP.md
  - docs/OPERATIONS.md
  - docs/INFRA-AUDIT-POSTGRES.md
  - ops/release/R3-STRONG-RELEASE.md
  - scripts/verify-release-readiness.mjs
acceptance:
  - RELEASE-PLAN.md defines R0–R3 entry/exit without claiming R1 active pre-provision
  - R3-STRONG-RELEASE.md is an executable go/no-go checklist
  - verify:release-readiness offline verifier exists and is wired to CI
  - WO-008 filed for R1 Postgres activation prep (human-owned, blocked)
  - No deploy, credentials, product UI, or Decision Graph schema changes
non_goals:
  - Provisioning Postgres or setting Vercel env
  - Running production migration or deploy
  - Product UI or Decision Graph type/schema/state-machine changes
  - Eve, daemon, or LLM enablement
  - Faking live security or customer evidence in CI
verification:
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
---

# WO-007 — Strong Release Operations

## Context

Founder thesis (WO-006) and wedge research set the bar for design-partner beta. Securist needs an explicit **R0 → R1 → R2 → R3** release train so humans and agents do not confuse public authority, durable graph activation, proof-of-value, and strong release.

## Plan

1. Document release trains in `docs/RELEASE-PLAN.md`.
2. Write executable R3 checklist under `ops/release/`.
3. Add offline `verify:release-readiness` and wire into CI (docs process only).
4. File WO-008 for R1 activation prep (human-gated).

## Progress

- 2026-08-06: Claimed on `ops/wo-007-strong-release`.
- 2026-08-06: Merged as PR #9 (`592218e`). Complete. Process freeze in effect (D-009).

## Blockers

- None for this WO. Active human tracks: WO-008 (R1) and WO-004 (interviews/PoV).
