---
id: WO-010
title: "Securist V1: Start a Decision (public assess + Decision Brief)"
status: in_progress
owner: grok
branch: docs/v1-start-a-decision-spec
depends_on:
  - WO-007
  - WO-011
contracts:
  - docs/SECURIST-V1-START-A-DECISION.md
  - docs/SYSTEM-MODEL.md
  - docs/FOUNDER-THESIS.md
  - docs/SURFACE-CONTRACTS.md
  - ops/system-graph.json
acceptance:
  - Homepage: Permission for code and models; Assess primary; sample Decision Brief secondary
  - /assess: public GitHub only; intended use; environment; boundary; no email; immediate ephemeral Decision Brief
  - Reject private URLs, secrets, local paths, unsupported providers
  - Label observed / unknowns / gaps / LIVE; no vuln-from-narrative; not a pentest
  - Copy/download local draft; Save and monitor disabled (post-R1 hinge)
  - Artifact profile framed as Decision Brief with Start a decision CTA
  - Nav: Assess / Decision Briefs primary; Research group; Services secondary
  - System graph registers assess paths; Decision Graph canonical; Postgres not production-active
  - Full verification green including clean-worktree
non_goals:
  - MCP server (WO-012)
  - GitHub App
  - Verify / exploitation runtime
  - Eve
  - Accounts / private workspaces
  - Automated external issues or PRs
  - New process documents
  - Production deploy or mutation
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
---

# WO-010 — Start a Decision (implementation)

## Context

Strategic correction: founder-led intake is **not** the product. Securist must provide **immediate automated value** via public-repo assess → share-safe Decision Brief.

Build spec: [`docs/SECURIST-V1-START-A-DECISION.md`](../../docs/SECURIST-V1-START-A-DECISION.md).  
Scope law: **D-010** — explicit founder scope is open; D-009 is not a product veto.  
Depends on system graph / clean-tree gates from **WO-011** (merged).

## Status

**In progress** on branch `docs/v1-start-a-decision-spec` under D-010.

## Plan

1. Implement automated pre-R1 flow (home, assess, brief result, profile CTA, Research nav).
2. Register authority-sensitive paths in `ops/system-graph.json`; update value-loop honestly.
3. Full verification suite + clean worktree.
4. One PR: Work-Order WO-010 with screenshots and behavior notes.
5. No deploy or production mutation.

## Progress

- 2026-08-06: Spec filed; earlier blocked under freeze.
- 2026-08-06: D-010 + WO-011 unlocked; implementation on this branch.
- 2026-08-06: Public assess lib, `/assess` route, homepage rewrite, nav, profile CTA, system graph.

## Public-data behavior (exact)

- Only `github.com/owner/repo` public repositories.
- Fetches: repo metadata, latest release, HEAD commit SHA, root `package.json` when present.
- Rejects: private repos, secrets/paths, non-GitHub providers, non-repo paths.
- Labels LIVE observed facts; never invents vulnerabilities; not a pentest.

## Persistence behavior (exact)

- `durable: false`, `persistence: ephemeral_client_only`.
- Does **not** write Decision Graph store, Postgres, or customer-private records.
- Client may copy/download JSON draft only.
- Save and monitor: UI hinge only until R1.

## Blockers

- R1 private durability remains honestly blocked (WO-008 / human evidence).
- Remote CI may fail on GitHub Actions infra independently of this code.
