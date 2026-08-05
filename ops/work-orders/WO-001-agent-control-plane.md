---
id: WO-001
title: Agent coordination control plane
status: complete
owner: grok
branch: feat/agent-control-plane
depends_on: []
contracts:
  - docs/SYSTEM-MODEL.md
  - docs/CANONICAL-CONTRACTS.md
  - docs/OPERATIONS.md
  - docs/V1-LAUNCH-ROADMAP.md
  - docs/ROADMAP.md
  - docs/DECISIONS.md
  - docs/AGENT-OPERATIONS.md
acceptance:
  - Canonical roadmap with id, owner, status, dependency, acceptance, non-goals
  - Append-only decision log with foundation decisions recorded
  - Work-order format and WO-001 / WO-002 present
  - Agent operations role split documented
  - PR template requires work-order ID, contracts, verification, non-goals
  - Coordination verification script and CI workflow green
  - Focused PR opened; no product/DB/schema changes
non_goals:
  - Repairing or merging PR #2
  - Provisioning Postgres or touching Vercel settings
  - Deploying to production
  - Changing Decision Graph types, SQL migrations, or state machine
  - New product UI or route-local domain models
  - Enabling Eve, remote LLMs, or daemon product flags
verification:
  - npm run verify:coordination
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run build
---

# WO-001 — Agent coordination control plane

## Context

Grok, Codex, and humans need a shared, inspectable source of truth for work.

## Progress

- 2026-08-05: Merged as PR #3 (`de1baee`). Complete.
