---
id: WO-009
title: Adoption Assurance public surface
status: in_review
owner: codex
branch: feat/adoption-assurance-surface
depends_on: []
contracts:
  - docs/FOUNDER-THESIS.md
  - src/components/SiteChrome.tsx
  - src/routes/services.tsx
acceptance:
  - Services is reachable from the primary navigation and footer
  - The public page presents three fixed-scope Adoption Assurance offers
  - The page makes human approval and service boundaries explicit
  - The page provides a working contact path through the existing operations inbox
non_goals:
  - New Decision Graph schema, state machine, or tenant data handling
  - Claiming R1 is active or accepting customer-private data in SEED mode
  - Pentesting, MSSP, SCA, GRC, or AI-approval positioning
  - Vercel scope, credential, database, or deployment configuration changes
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
  - npm run verify:coordination
---

# WO-009 — Adoption Assurance public surface

## Context

The founder explicitly authorized a monetization surface now. Securist needs a
clear way to offer founder-led, fixed-scope Decision Graph onboarding and
re-review work without positioning itself as a pentest shop, MSSP, or report
consultancy.

## Plan

1. Add a `/services` route centred on Adoption Assurance.
2. Add Services to the existing Build navigation and footer.
3. Present Adoption Baseline, Decision Readiness Sprint, and Re-review Response
   with boundaries and a contact path.
4. Preserve the Decision Graph and human-approval invariants; do not add a
   customer-data path.

## Progress

- 2026-08-06: Claimed after founder authorization; route and navigation built.
- 2026-08-06: Local lint, typecheck, lifecycle, graph, and production build pass.
- 2026-08-06: Browser smoke test passed for `/services` and `/`; fixed an
  unrelated duplicate React key discovered on the catalog table.

## Blockers

- None. Public deployment follows normal PR review and TARX production release.
