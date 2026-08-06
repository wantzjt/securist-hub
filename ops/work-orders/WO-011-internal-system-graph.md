---
id: WO-011
title: Internal system graph and regression guardrails
status: in_review
owner: codex
branch: ops/wo-011-internal-system-graph
depends_on:
  - WO-001
  - WO-007
contracts:
  - docs/SYSTEM-MODEL.md
  - docs/DECISIONS.md
  - ops/system-graph.json
  - .github/workflows/ci.yml
acceptance:
  - Repository authority, implementation paths, invariants, checks, human gates, and value-loop status are machine-readable
  - All nine canonical invariants have stable IDs and at least one enforcement path
  - Projection and proposal nodes transitively depend on the canonical Decision Graph
  - Every contract, Decision Graph, migration, and Eve gateway source file has exactly one graph owner
  - Contract, migration, and state-machine changes without regression tests fail coordination verification
  - CI fails on dirty checkout state before install or after verification
  - Existing lint, typecheck, lifecycle, graph, build, coordination, and release checks remain green
non_goals:
  - Product UI or navigation changes
  - Postgres provision, migration, Vercel mutation, credentials, or deploy
  - MCP implementation, crawler, model integration, or external repository writes
  - Claiming automated checks prove live security or human evidence
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree after commit
---

# WO-011 — Internal system graph and regression guardrails

## Context

The product Decision Graph is canonical, but the repository had no executable map connecting that authority to code paths, projections, proposal boundaries, regression checks, release gates, and human authority. CI also did not verify that builds left the checkout clean.

## Plan

- Add a versioned, machine-readable repository system graph and schema.
- Give the nine System Model invariants stable IDs.
- Validate paths, references, canonical authority, dependencies, verification commands, and honest R1 state.
- Enforce clean trees at CI entry and exit and in agent handoffs.
- Record D-010 so explicit founder scope cannot be blocked by stale freeze language.

## Progress notes

- 2026-08-06: Claimed by Codex from clean `main` at `fb510f5`; renumbered to WO-011 after detecting Grok's earlier remote WO-010 claim.
- 2026-08-06: Added graph, schema, validator, clean-tree verifier, CI wiring, stable invariant IDs, and authority correction.
- 2026-08-06: Added exactly-one-owner coverage for contracts, Decision Graph, migrations, and Eve gateway sources; made regression tests mandatory for contract-sensitive changes.
- 2026-08-06: Full local suite green: lint, typecheck, lifecycle, graph 31/31, build, coordination, release readiness, and system graph.

## Blockers

None.
