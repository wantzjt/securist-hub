---
id: WO-024
title: "Intel firm meeting readiness pack"
status: in_progress
owner: grok
branch: docs/wo-024-intel-meeting-readiness
depends_on:
  - WO-023
contracts: []
acceptance:
  - docs/meeting/INTEL-ONE-PAGER.md is a tight buyer-facing brief for intel/CTI firms
  - docs/meeting/DEMO-SCRIPT.md is a 5-minute live demo script (public assess + Operator)
  - docs/meeting/NON-PROMISES.md lists hard non-claims for the room
  - docs/meeting/PRE-MEETING-CHECKLIST.md is founder-executable
  - Stale WO-011/013–017 front matter marked complete (matches merged PRs)
  - SESSION-RESUME + ROADMAP point at meeting pack and RC prep state
  - No R1 provision, no npm publish, no public npx site unlock, no announcement
non_goals:
  - Provisioning Postgres or Team Graph
  - npm publish or public npx claims
  - Broad launch announcement
  - Product surface redesign
  - Impersonating customer interviews
verification:
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run lint
  - test -f docs/meeting/INTEL-ONE-PAGER.md
  - test -f docs/meeting/DEMO-SCRIPT.md
  - test -f docs/meeting/NON-PROMISES.md
  - test -f docs/meeting/PRE-MEETING-CHECKLIST.md
---

# WO-024 — Intel firm meeting readiness

## Context

Founder meeting top intel firms next week. Product ladder through WO-023 is solid.
Need autonomous prep: meeting kit, WO hygiene, Operator RC ready for optional GitHub
pre-release, and a cold-start resume that does not re-litigate strategy.

## Plan

1. Meeting kit under `docs/meeting/`
2. Mark merged-but-stale WOs complete
3. Update SESSION-RESUME + ROADMAP NEXT
4. Local signed RC + publish-prep (gitignored artifacts; release upload human or authorized)
5. GitHub About polish where API allows

## Progress

- 2026-08-12 — Claimed. Operator RC re-signed and verify-clean green locally.
  Tarball sha256 `8242def0c4967cae4216f12d24003c79584539c7a50c13ca923457acd69cad40`.
- 2026-08-12 — Meeting kit under `docs/meeting/` (one-pager, demo, non-promises, checklist).
- 2026-08-12 — Stale WO-011 / WO-013–017 marked complete (merged PRs).
- 2026-08-12 — GitHub About description + topics updated (permission-system framing).
- 2026-08-12 — Pre-release published: https://github.com/wantzjt/securist-hub/releases/tag/operator-v0.1.0-rc.1
  (signed RC tarball · not npm · publicNpxClaim false).
- 2026-08-12 — Offline doctor + assess dry-run on sample-target: Runtime verified · LocalDecisionBriefV1.

## Blockers

- Private key backup remains human-only (off-machine copy).
- npm still forbidden; site must not claim public npx.
- R1 remains blocked without explicit provision authority.
