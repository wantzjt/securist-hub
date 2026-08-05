---
id: WO-002
title: Repair and re-review Postgres Decision Graph seam (PR #2)
status: ready
owner: unassigned
branch: ""
depends_on:
  - WO-001
contracts:
  - migrations/001_decision_graph.sql
  - src/lib/decision-graph/store.ts
  - src/lib/decision-graph/outbox.ts
  - docs/SYSTEM-MODEL.md
  - docs/CANONICAL-CONTRACTS.md
  - docs/OPERATIONS.md
acceptance:
  - PR #2 rebased on current main with no unrelated product churn
  - Tenant-scoped reads and writes enforced at the store boundary
  - Transactional outbox behavior (graph mutation + outbox atomicity)
  - Bootstrap path clear for local/demo vs postgres mode
  - Lint, typecheck, lifecycle fixture, and seam tests green
  - Codex re-review recorded; human merge approval
  - Explicit non-claim: no production provision until RM-003 / human ops
non_goals:
  - Merging PR #2 before repair criteria pass
  - Provisioning Postgres or setting production DATABASE_URL
  - Deploying durable mode to secur.ist
  - Enabling Eve, remote LLMs, or daemon product flags
  - Competing schema shapes outside migrations/001_decision_graph.sql
  - Implementing this repair inside the agent-control-plane PR
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
  - npm run verify:coordination
  - Codex review notes on tenant scope + transactional outbox
---

# WO-002 — Postgres seam repair (PR #2)

## Context

PR #2 (`feat/postgres-decision-graph-store`) introduced a store seam sketch. It is **not merge-ready**. Known follow-ups include tenant-scoped reads/writes, transactional outbox behavior, bootstrap clarity, and lint. Do **not** provision infrastructure or claim production durability until this work order is `complete` and a human approves RM-003.

## Plan (for the future owner — not this PR)

1. Rebase `feat/postgres-decision-graph-store` (or successor branch) onto current `main`.
2. Fix tenant isolation for all read/write paths; add honest tests (no static-analysis theater).
3. Make outbox append transactional with durable graph writes.
4. Document bootstrap; keep memory/seed default until switch is approved.
5. Open or update PR; Codex review; human merge decision only.

## Progress

- 2026-08-05: Work order filed as `ready`; depends on WO-001. No implementation in control-plane PR.

## Blockers

- Depends on WO-001 merge for coordination process (soft process dep).
- Human credentials and provision remain blocked until repair acceptance (RM-003).
