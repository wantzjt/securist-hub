---
id: WO-028
title: "Share-grade Brief surface (OG + markdown export + print)"
status: complete
owner: grok
branch: feat/wo-028-share-grade-brief
depends_on:
  - WO-027
contracts: []
acceptance:
  - OG social meta for assess route with honest ephemeral wording
  - Export markdown of on-screen Decision Brief after success
  - Print CSS for readable Save as PDF; keep Brief and ephemeral stamp
  - Copy re-run link remains PRIMARY share CTA
  - Visible ephemeral stamp on Brief and markdown export header
non_goals:
  - package registry publish
  - Broad announce
  - Team Graph live
  - Durable private Brief store
verification:
  - rg share-grade markers on assess and styles
  - verify:coordination and lint
---

# WO-028

Share-grade Brief surface (OG + markdown export + print).

## Progress

- 2026-08-12 — Implementation on branch feat/wo-028-share-grade-brief; PR open.
- 2026-08-12 — PR #66 merged; complete.

## Blockers

None.
