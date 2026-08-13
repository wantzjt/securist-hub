---
id: WO-008
title: R1 durable Decision Graph activation preparation
status: blocked
owner: human
branch: ""
depends_on:
  - WO-007
  - WO-005
contracts:
  - docs/RELEASE-PLAN.md
  - docs/RM-003-PROVISION-CHECKLIST.md
  - docs/INFRA-AUDIT-POSTGRES.md
  - docs/VERCEL-SCOPE.md
  - migrations/001_decision_graph.sql
  - ops/release/R3-STRONG-RELEASE.md
acceptance:
  - Explicit human provision authority recorded before any credential or env mutation
  - Postgres provisioned under tarx / securist-hub only
  - migrations/001_decision_graph.sql applied with rollback plan documented
  - SECURIST_GRAPH_STORE, DATABASE_URL, SECURIST_DEFAULT_TENANT_ID set and confirmed
  - Production smoke evidence captured (routes, no missing_database_url / missing_default_tenant_id)
  - R1 exit criteria in RELEASE-PLAN.md checked and signed by human go/no-go owner
non_goals:
  - Agent-created credentials or chat-logged secrets
  - Declaring R1 active without human sign-off
  - Eve / daemon / LLM enablement
  - Customer data import beyond design-partner scope
  - Major product surface expansion (blocked by founder thesis interview/PoV bar)
verification:
  - docs/RM-003-PROVISION-CHECKLIST.md fully checked by human
  - RELEASE-PLAN.md R1 exit criteria satisfied with evidence paths listed
  - Rollback to SECURIST_GRAPH_STORE=memory verified or documented
---

# WO-008 — R1 Postgres activation preparation

## Context

**R1** = durable Decision Graph activation in production (not seed/memory default).  
Code seam is on `main` (WO-002 / PR #4). **R1 is not active** until a human completes provision under **tarx** scope.

This work order is **blocked** until explicit human provision authority. It does **not** authorize agents to create credentials, set env vars, run migrations, or deploy.

Related: [WO-005](./WO-005-rm003-postgres-provision.md) · [`RM-003-PROVISION-CHECKLIST.md`](../../docs/RM-003-PROVISION-CHECKLIST.md) · [`RELEASE-PLAN.md`](../../docs/RELEASE-PLAN.md)

## Required environment names (human only)

| Variable | Required | Notes |
|----------|----------|--------|
| `SECURIST_GRAPH_STORE` | yes | Must be `postgres` for R1 |
| `DATABASE_URL` | yes | Prefer pooler URL; never commit |
| `SECURIST_DEFAULT_TENANT_ID` | yes | Fail-closed if missing (`missing_default_tenant_id`) |

Optional: `SECURIST_DATABASE_URL` alias if `DATABASE_URL` unset.

## Migration

```bash
# Human machine with production URL — never commit the URL
psql "$DATABASE_URL" -f migrations/001_decision_graph.sql
```

- Schema only: `migrations/001_decision_graph.sql`  
- No competing shapes  

## Rollback

1. Set `SECURIST_GRAPH_STORE=memory` (or remove) in Vercel **tarx** / **securist-hub**.  
2. Redeploy.  
3. Confirm seed/demo store and honest SEED labeling.  
4. DB may remain provisioned; app simply stops using postgres mode.

## Smoke (after human deploy)

- [ ] `/`, `/artifacts`, one Artifact Profile, `/activity` load  
- [ ] No startup `missing_database_url` / `missing_default_tenant_id`  
- [ ] Empty durable graph does not present seed rows as LIVE org telemetry without labels  
- [ ] Capture evidence: deploy URL, timestamp, operator initials (private ops log — not secrets in git)

## Evidence capture (for R1 exit)

| Item | Where stored |
|------|----------------|
| Provisioner + scope proof (tarx) | Private ops log |
| Migration applied at (UTC) | Private ops log |
| Env names present (values redacted) | Private ops log |
| Smoke checklist results | Private ops log + optional note in this WO Progress |
| Go/no-go owner name + UTC | This WO Progress when unblocked |

## Plan (when unblocked)

1. Human grants provision authority in writing (PR comment or WO note).  
2. Set status `in_progress`, owner human, branch if any ops docs update.  
3. Execute [`RM-003-PROVISION-CHECKLIST.md`](../../docs/RM-003-PROVISION-CHECKLIST.md).  
4. Complete R1 exit criteria in [`RELEASE-PLAN.md`](../../docs/RELEASE-PLAN.md).  
5. Mark this WO `complete` only after go/no-go owner signs R1 exit.

## Progress

- 2026-08-06: Filed `blocked` pending human provision authority. No credentials created.
- 2026-08-06: Confirmed as **one of two active tracks** under D-009 freeze (with WO-004). No product expansion on this track—activation only.
- 2026-08-10: Docs pack [`R1-READINESS-PACK.md`](../../docs/R1-READINESS-PACK.md) consolidates steps for cold resume. **Still blocked** — no provision, no env, no migration. Code seam + fail-closed tests remain green on `main`.
- 2026-08-12: WO-032 froze Team Graph contracts (Decision / owner / policy / evidence / re-review) and stub API. **Still blocked** — freeze does not grant provision authority, does not set env, does not run migrations.

## Blockers

- **Explicit human provision authority** not yet granted.  
- Vercel tarx access and Marketplace DB remain human-only.
