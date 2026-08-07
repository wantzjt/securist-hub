---
id: WO-019
title: "Developer-native information architecture"
status: proposed
owner: unassigned
branch: ""
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

# WO-019 — Developer-native information architecture (queued)

**Status: proposed — do not claim until human Operator RC sign-off path is clear and this WO is explicitly claimed. Not concurrent with R1 provision work.**

## Problem

The public site exposes repository-internal and research routes as equal product destinations. It reads like a strange app/catalog rather than a developer product.

**Securist is not an Electron app.** It is a TanStack web app plus a local Node Operator. TARX may supply runtime substrate behind the curtain; Securist must not become a second desktop security app.

## Winning adoption loop

```text
Web assess → local CLI → GitHub/CI check → shared Team Graph
```

Not: “download another security desktop app.”

## Product surfaces (when claimed)

| Route | Role |
|-------|------|
| `/` | Focused category/product page — not a dashboard |
| `/assess` | Immediate utility: paste public repo → Decision Brief |
| `/operator` | Developer adoption: local-only promise, copyable monorepo commands, trust status, MCP notes; **exact** honesty (source today; public install only when released) |
| `/artifacts/:id` | Shareable Decision Brief profile (GitHub/HF-profile shape) |
| Team Graph | One clearly marked **coming next** destination |
| Research | Collapsed: Activity, Models, Scout, Packages, Links — never compete with Assess |
| Services | Secondary; never lead nav |

## Four questions every brief/profile must answer

1. What is this artifact?  
2. What did Securist actually observe?  
3. What remains unknown?  
4. What should happen next—and who owns it?  

No dashboard until the user has a decision. No conversation UI as default (assistant may later explain a brief).

## Contact (scoped)

Canonical public contact: **`securist_info_sec@protonmail.com`**  
Replace placeholder contact in **footer / support / security contact surfaces only** in this WO (or a tightly scoped follow-up within it). Do not invent new product email products.

## Scope when claimed

Routes, nav, UI copy, onboarding, responsive/accessibility, product-surface tests.

## Non-goals

Graph contracts · auth · billing · persistence · Operator trust · deploy settings · public npm/Team Graph claims · Electron product · concurrent human signing or R1 provision work.

## After WO-019

Stickiness is browser + terminal + GitHub—not a new place to learn. Human tracks remain: Operator sign/clean-machine (WO-018 exit) → R1 (WO-008) → narrow Team Graph workflow.
