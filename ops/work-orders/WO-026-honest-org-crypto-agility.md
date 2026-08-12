---
id: WO-026
title: "Honest org pointers + crypto-agility inventory note"
status: in_progress
owner: grok
branch: feat/wo-026-honest-org-crypto-agility
depends_on:
  - WO-025
contracts: []
acceptance:
  - Beachhead package clone URLs use https://github.com/Securist-InfoSec/<repo> (not empty github.com/securist)
  - Hub brand.githubOrg / packages GITHUB_ORG / Scout prompts point at Securist-InfoSec; product hub stays wantzjt/securist-hub
  - /security and SECURITY.md include crypto-agility inventory note for X25519MLKEM768 without claiming Operator negotiates ML-KEM
  - Operator release signing remains Ed25519; no quantum-fear marketing
  - Non-promises retained: beachheads are scaffolds; HF org not claimed live if unavailable
non_goals:
  - npm publish
  - R1 / Postgres
  - Announcement
  - Product ladder rewrite
  - TARX as customer brand
verification:
  - npm run test:product-surface
  - npm run lint
  - npm run typecheck
  - npm run verify:coordination
  - curl -sS -o /dev/null -w '%{http_code}' https://github.com/Securist-InfoSec/scout-daemon  # expect 200
---

# WO-026 — Honest org pointers + crypto-agility inventory

## Context

Site/Scout still referenced empty user `github.com/securist`. Real public package org is
**Securist-InfoSec**. Product hub remains **wantzjt/securist-hub**. Founder also wants
hybrid PQ/T key agreement **X25519MLKEM768** as inventory posture only.

## Progress

- 2026-08-12 — Claimed from Grok Bot handoff.

## Blockers

None for code. Production `VITE_PUBLIC_GITHUB_ORG` may need human/Vercel update if set to `securist`.
