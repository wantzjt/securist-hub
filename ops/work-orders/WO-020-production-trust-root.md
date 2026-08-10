---
id: WO-020
title: "Production Operator trust-root (Gate 1 public key)"
status: in_progress
owner: grok
branch: chore/wo-020-production-trust-root
depends_on:
  - WO-018
contracts: []
acceptance:
  - Monorepo packages/operator/keys/trust-root.pem is the production public trust root (not fixture-public)
  - Matching private key exists only offline (never in git, CI, npm, or chat)
  - Local Gate 1: operator:rc + operator:rc:verify-clean PASS with signerKeyId securist-operator-release-key
  - ROADMAP / OPERATOR-RELEASE-LANE reflect Gate 1 local PASS and remaining human steps
  - WO-018 and WO-019 status corrected to complete after merge
  - No private key material, runtime-identity.json, or .operator-rc artifacts committed
  - publicNpxClaim remains false; announcement remains HOLD
non_goals:
  - Committing or transmitting the private signing key
  - npm publish or public npx @securist/operator
  - Vercel mutation, R1 Postgres provision (WO-008)
  - Limited dogfood cohort ops or product surface redesign
  - Second-machine verify (human optional follow-up)
verification:
  - git show HEAD:packages/operator/keys/trust-root.pem | head -1 matches BEGIN PUBLIC KEY
  - npm run operator:rc:preflight
  - npm run test:operator
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:clean-worktree
---

# WO-020 — Production Operator trust-root

## Context

WO-018 shipped RC tooling. Gate 1 (human-signed RC) was blocked because:

1. Committed `trust-root.pem` was the old **fixture** public key (renamed from `fixture-public.pem`).
2. Matching `fixture-private.pem` was deleted from the tree but remains **burned in git history** — never reuse as a release key.
3. No offline production keypair had been established.

## Plan

1. Human/Grok generate **new Ed25519** keypair offline under `~/.securist/keys/` (private `0600`).
2. Replace monorepo **public only** `packages/operator/keys/trust-root.pem`.
3. Prove local Gate 1: `operator:rc` + `operator:rc:verify-clean` with `signerKeyId=securist-operator-release-key`.
4. Commit public trust-root + status docs only. Open one PR.
5. Human backs up private key offline (not an agent task; documented in ROADMAP).

## Progress

- 2026-08-08 — Keypair established offline; local Gate 1 PASS (evidence under gitignored `.operator-rc/gate1-20260808T175344Z/`).
- 2026-08-10 — WO-020 branch + PR for public trust-root + roadmap accuracy.

## Blockers

- Human must **backup** `~/.securist/keys/securist-operator-release-private.pem` off this machine.
- Optional second-machine clean verify.
- Publish gate (E–F in OPERATOR-RELEASE-LANE) still human-only; not this WO.
