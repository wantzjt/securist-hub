---
id: WO-005
title: RM-003 TARX Postgres provision and production switch
status: ready
owner: human
branch: ""
depends_on:
  - WO-002
contracts:
  - migrations/001_decision_graph.sql
  - docs/INFRA-AUDIT-POSTGRES.md
  - docs/RM-003-PROVISION-CHECKLIST.md
  - docs/VERCEL-SCOPE.md
acceptance:
  - Postgres under tarx / securist-hub only
  - migrations/001_decision_graph.sql applied
  - SECURIST_GRAPH_STORE, DATABASE_URL, SECURIST_DEFAULT_TENANT_ID set
  - Production redeployed; smoke passes; rollback path documented
  - No secrets committed to git
non_goals:
  - Agent-created credentials or chat-logged connection strings
  - Eve / LLM / auto-PR enablement
  - Competing schema shapes
  - Design-partner sales (WO-004)
verification:
  - Checklist in docs/RM-003-PROVISION-CHECKLIST.md fully checked
  - Production does not throw missing_database_url or missing_default_tenant_id
  - Public SEED labeling still honest where seed remains
---

# WO-005 — RM-003 Postgres provision

## Context

Durable store seam is on `main` (WO-002 / PR #4). Production still defaults to memory/seed until a human provisions Postgres and flips env vars.

## Plan

Follow [`docs/RM-003-PROVISION-CHECKLIST.md`](../../docs/RM-003-PROVISION-CHECKLIST.md) exactly under **tarx** scope.

## Progress

- 2026-08-05: Filed `ready` for human ops.

## Blockers

- Human credentials and Marketplace access.
