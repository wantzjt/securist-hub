---
id: WO-010
title: "Securist V1: Start a Decision (implementation)"
status: blocked
owner: unassigned
branch: ""
depends_on:
  - WO-007
contracts:
  - docs/SECURIST-V1-START-A-DECISION.md
  - docs/SYSTEM-MODEL.md
  - docs/FOUNDER-THESIS.md
  - docs/SURFACE-CONTRACTS.md
acceptance:
  - Implements docs/SECURIST-V1-START-A-DECISION.md only
  - Homepage CTAs, /assess pre-R1 honesty, profile CTA, Research nav
  - No Verify, MCP server, GitHub App, Eve, or private data in SEED
  - Full local verification green
non_goals:
  - Strategy memos
  - Securist Verify / agent execution
  - MCP implementation
  - Services nav productization
  - Product expansion beyond the build spec
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run build
  - npm run verify:coordination
  - Manual: / /assess /artifacts sample CTA
---

# WO-010 — Start a Decision (implementation)

## Context

Build spec locked in [`docs/SECURIST-V1-START-A-DECISION.md`](../../docs/SECURIST-V1-START-A-DECISION.md). Company thesis: chain of custody for permission (and later authorized defensive work) under change. External lead: permission for code and models—not “AI Security Operations.”

## Status

**Blocked** until human reopens product scope (D-009). Prefer R1 (WO-008) and/or WO-004 evidence first.

## Plan (when unblocked)

1. Claim: `in_progress`, owner grok, one branch.  
2. Implement only the build spec.  
3. Codex: approve / P0–P1 blocker / go-no-go.  
4. Human merge.

## Progress

- 2026-08-06: Spec filed; implementation blocked under freeze.

## Blockers

- Human product-scope reopen.  
- Pre-R1: no customer-private data in memory/SEED.
