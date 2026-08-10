---
id: WO-023
title: "Publish-gate prep + R1 readiness + session resume pack"
status: in_review
owner: grok
branch: docs/wo-023-publish-r1-resume-pack
depends_on:
  - WO-022
contracts: []
acceptance:
  - docs/OPERATOR-PUBLISH-GATE.md defines GitHub Release-first ship without public npx
  - docs/R1-READINESS-PACK.md consolidates human-only Postgres steps without authorizing provision
  - docs/SESSION-RESUME.md is the cold-start handoff for tonight
  - npm run operator:rc:publish-prep validates production RC and drafts release notes offline
  - ROADMAP + OPERATOR-RELEASE-LANE point at the new docs
  - No credentials, no GH release, no npm publish, no Vercel env mutation
non_goals:
  - Creating a GitHub Release or npm publish
  - Provisioning Postgres or setting DATABASE_URL
  - Announcement or public npx site unlock
  - Product surface redesign beyond doc links if any
verification:
  - node scripts/operator-rc-publish-prep.mjs fails closed on dogfood-only latest RC OR succeeds on production RC
  - npm run lint
  - npm run typecheck
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:clean-worktree
---

# WO-023 — Shutdown pack

## Context

Founder shutting down until tonight. Need: publish-gate plan, R1 readiness without
provision, and a single resume file so the next session does not re-explore history.

## Plan

1. OPERATOR-PUBLISH-GATE.md + publish-prep script  
2. R1-READINESS-PACK.md  
3. SESSION-RESUME.md  
4. ROADMAP / release lane / WO-008 progress note  

## Progress

- 2026-08-10 — Claimed.

## Blockers

None for docs. Human gates remain for publish upload and R1 authority.
