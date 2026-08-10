---
id: WO-019
title: "Developer-native information architecture"
status: complete
owner: grok
branch: feat/wo-019-developer-native-ia
depends_on:
  - WO-017
  - WO-018
contracts: []
acceptance:
  - Product nav is Assess · Local Operator · Team Graph (coming next) only as primary
  - Research is a single collapsed area (Activity, Models, Scout, Packages, Links)
  - / is a decisive landing page, not a dashboard or catalog
  - /operator is the developer onboarding surface (monorepo today; public install only when released)
  - Artifact profiles read as shareable Decision Brief proof pages
  - Services is secondary; never leads nav
  - Canonical public contact securist_info_sec@protonmail.com on footer/support/security only
  - live / local / coming-next honesty preserved
  - First-time developer understands product + assess + local path + why teams pay, in under 30s
  - product-surface tests cover new IA; full regression green
non_goals:
  - Graph contracts, schema, state machine
  - Auth, billing, accounts, persistence
  - Operator trust/signing changes or npm publish
  - Deploy / Vercel settings
  - Claiming public npm, Team Graph live, or Electron desktop product
  - Concurrent work with human Operator sign or R1 provision
  - Conversation UI as the default experience
  - Datadog or any vendor as product connector / website mention
verification:
  - npm run test:product-surface
  - npm run lint
  - npm run typecheck
  - npm run test:public-assess
  - npm run test:decision-brief-contracts
  - npm run test:operator
  - npm run build
  - npm run verify:coordination
  - npm run verify:system-graph
  - npm run verify:clean-worktree
---

# WO-019 — Developer-native information architecture

**Claimed after Phase 3 human approval of release scorecard (HOLD announcement; claim WO-019 only).**

## Adoption loop

```text
Web assess → local CLI → GitHub/CI check → shared Team Graph
```

Not an Electron app. Not a research catalog.

## Progress

- 2026-08-07: Claimed; implementing nav, `/operator`, `/team`, contact, tests.
