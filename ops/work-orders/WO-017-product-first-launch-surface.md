---
id: WO-017
title: "Product-first launch surface"
status: in_review
owner: grok
branch: feat/wo-017-product-first-launch-surface
depends_on:
  - WO-015
  - WO-016
contracts: []
acceptance:
  - Production mismatch explained in PR (commit vs UX expression)
  - Homepage, /assess, sample artifact, /services, nav form one product journey
  - Hero + ladder + Decision Brief preview + buyer outcome + open-build strip
  - Research demoted; Services = Adoption Assurance / Re-review Response
  - Public-assess honesty and contract tests remain green
  - Desktop + mobile evidence screenshots under docs/evidence/wo-017
  - Full verification, system-graph, clean-worktree
non_goals:
  - Decision Graph contract / schema / state-machine changes
  - Persistence, auth, billing, accounts
  - Operator trust-boundary or package-signing changes
  - Vercel scope, deploy settings, or production alias changes
  - Fake metrics, logos, compliance badges, public npx, Team Graph-as-live
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:public-assess
  - npm run test:decision-brief-contracts
  - npm run test:product-surface
  - npm run operator:build
  - npm run test:operator
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
---

# WO-017 — Product-first launch surface

## Production diagnosis (2026-08-07)

| Surface | Commit / state |
|---------|----------------|
| `origin/main` | `f16827e` (WO-016) |
| GitHub Production deployment | `f16827e` — **matches main** |
| Live `secur.ist` | Serves WO-015 funnel copy (hero “Permission for code and models”, Assess CTA, ladder) |

**Mismatch is not deploy lag.** Production is on main. The gap is **product expression**: hero subtext weaker than locked product sentence; no homepage Decision Brief preview; research grid still competes with product; missing buyer-outcome and open-build proof; dual-forge meta/chrome framing still reads as ops catalog.

This WO redesigns the public product surface only—no contract or deploy changes.
