---
id: WO-002
title: Repair and re-review Postgres Decision Graph seam (PR #2)
status: complete
owner: grok
branch: feat/postgres-seam-repair
depends_on:
  - WO-001
contracts:
  - migrations/001_decision_graph.sql
  - src/lib/decision-graph/store.ts
  - src/lib/decision-graph/outbox.ts
  - src/lib/decision-graph/postgres-store.ts
  - docs/SYSTEM-MODEL.md
  - docs/CANONICAL-CONTRACTS.md
  - docs/OPERATIONS.md
  - docs/INFRA-AUDIT-POSTGRES.md
acceptance:
  - Rebased on current main (post WO-001) as feat/postgres-seam-repair
  - Tenant-scoped reads and writes enforced at the store boundary
  - Transactional outbox behavior (graph mutation + outbox atomicity)
  - Bootstrap path clear for local/demo vs postgres mode
  - Lint, typecheck, lifecycle fixture, and seam tests green
  - Codex re-review recorded; human merge approval
  - Explicit non-claim: no production provision until RM-003 / human ops
non_goals:
  - Provisioning Postgres or setting production DATABASE_URL
  - Deploying durable mode to secur.ist
  - Enabling Eve, remote LLMs, or daemon product flags
  - Competing schema shapes outside migrations/001_decision_graph.sql
  - Changing Decision Graph domain types or state-machine transitions
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
  - npm run verify:coordination
---

# WO-002 — Postgres seam repair

## Context

PR #2 sketched a Postgres adapter but was not merge-ready (tenant scope, transactional outbox, bootstrap, lint; conflicting with main after V1 + control plane). This work order implements the repair on `feat/postgres-seam-repair` from current `main`.

## Plan

1. Re-implement seam on main with tenant-scoped R/W.
2. Transactional outbox for evidence/activity writes.
3. Clear bootstrap (memory default; postgres fail-closed).
4. Tests + docs; open PR under Work-Order: WO-002.
5. Supersede PR #2; no provision/deploy.

## Progress

- 2026-08-05: Claimed by grok on `feat/postgres-seam-repair`.
- 2026-08-05: Merged as PR #4 (`2bea5de`). Complete. Production switch is WO-005 / RM-003.

## Blockers

- None for this WO.
