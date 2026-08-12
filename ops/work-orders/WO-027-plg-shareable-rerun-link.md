---
id: WO-027
title: "PLG shareable Decision Brief re-run link after /assess"
status: complete
owner: grok
branch: feat/wo-027-plg-shareable-rerun-link
depends_on:
  - WO-026
contracts: []
acceptance:
  - After successful public /assess, primary CTA is Copy re-run link
  - Address bar syncs to the same re-run URL
  - Honest non-durable copy; Team Graph not live
  - Copy page + Download draft JSON remain secondary
non_goals:
  - R1 durable store
  - package registry publish
  - Announcement
verification:
  - Manual /assess + Copy re-run link in fresh tab
  - coordination verify
---

# WO-027

PLG shareable Decision Brief re-run link after /assess.

## Progress

- 2026-08-12 — Implementation on branch; PR #58 open.
- 2026-08-12 — Work-order file added for coordination verify.
- 2026-08-12 — PR #58 merged; complete.

## Blockers

None.
