---
id: WO-027
title: "PLG shareable Decision Brief re-run link after /assess"
status: in_review
owner: grok
branch: feat/wo-027-plg-shareable-rerun-link
depends_on:
  - WO-026
contracts: []
acceptance:
  - After successful public /assess, primary CTA is Copy re-run link (/assess?url=...)
  - Address bar syncs to the same re-run URL for native browser share
  - Honest non-durable copy: re-runs assess, does not save the brief, Team Graph not live
  - Copy page + Download draft JSON remain available as secondary actions
non_goals:
  - R1 durable store
  - npm
  - Announcement
verification:
  - Manual /assess run + Copy re-run link paste in fresh tab
  - npm run verify:coordination
---

# WO-027 — PLG shareable Decision Brief re-run link

## Context

Public /assess should leave a shareable, honest re-run path after a Decision Brief.
No durable brief storage or Team Graph claims.

## Progress

- 2026-08-12 — Implementation on branch; PR #58 open.
- 2026-08-12 — Work-order file added for coordination verify.

## Blockers

None.
  - npm
  - Announcement
verification:
  - Manual /assess run + Copy re-run link paste in fresh tab
  - npm run verify:coordination
---

# WO-027 — PLG shareable Decision Brief re-run link

## Context

Public /assess should leave a shareable, honest re-run path after a Decision Brief.
No durable brief storage or Team Graph claims.

## Progress

- 2026-08-12 — Implementation on branch; PR #58 open.
- 2026-08-12 — Work-order file added for coordination verify.

## Blockers

None.
