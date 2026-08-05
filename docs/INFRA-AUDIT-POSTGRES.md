# Infra audit — Postgres Decision Graph store seam

**Date:** 2026-08-05  
**Repo:** [wantzjt/securist-hub](https://github.com/wantzjt/securist-hub)  
**Scope:** Production-ready **adapter seam** only. No credentials created. No deploy. No Eve / daemon / remote model enablement.

## Status

| Item | State |
|------|--------|
| Canonical schema | `migrations/001_decision_graph.sql` (reused; no competing shapes) |
| Memory/seed store | **Still the default** (local/demo) |
| Postgres adapter | `src/lib/decision-graph/postgres-store.ts` behind `DecisionGraphStore` |
| Durable outbox | `postgres-outbox.ts` → `outbox_events` table |
| Config switch | `SECURIST_GRAPH_STORE` + `DATABASE_URL` |
| Fail-closed | `postgres` mode without URL → `DecisionGraphConfigError` (`missing_database_url`) |
| Eve / LLM / daemon flags | **Unchanged / not enabled** by this seam |
| Activity | Remains a **projection** (writes go to `activity_events` + outbox consumers) |

## Authority (unchanged)

1. Decision Graph is source of truth.  
2. Activity is a read projection.  
3. Version-bound approvals; material change → `review_required`.  
4. Tenant required before persist.  
5. Evidence is append-only.  

## Provisioning path (next ops step — not done here)

1. Provision Postgres (Vercel Marketplace Neon/Supabase/etc. under **tarx** scope).  
2. Set env vars (below) on project **securist-hub** (`--scope tarx`).  
3. Apply `migrations/001_decision_graph.sql` once.  
4. Set `SECURIST_GRAPH_STORE=postgres`.  
5. Redeploy. Surfaces do not need route-local models rewritten.

## Exact Vercel environment variables

Team: **tarx** · Project: **securist-hub**  
See also `docs/VERCEL-SCOPE.md`.

### Required for durable Postgres mode

| Name | Environments | Value / notes |
|------|----------------|---------------|
| `SECURIST_GRAPH_STORE` | Production (and Preview if testing DB) | `postgres` |
| `DATABASE_URL` | Production (and Preview if testing DB) | Postgres connection string from the provisioned store (pooler URL recommended on serverless) |

### Optional alias

| Name | Notes |
|------|--------|
| `SECURIST_DATABASE_URL` | Accepted if `DATABASE_URL` is unset. Prefer `DATABASE_URL` for Marketplace defaults. |

### Local / demo only (do not set on production durable path)

| Name | Value | Notes |
|------|--------|--------|
| `SECURIST_GRAPH_STORE` | `memory` or `seed` (or **omit**) | Process-local seed snapshot; all rows `isSeed` / verification seed |
| `DATABASE_URL` | unset | Required only when mode is `postgres` |

### Existing public / optional (unchanged by this PR)

| Name | Notes |
|------|--------|
| `VITE_PUBLIC_HOSTNAME` | `secur.ist` |
| `VITE_PUBLIC_GITHUB_ORG` | `securist` |
| `VITE_PUBLIC_HF_ORG` | `securist` |
| `GITHUB_TOKEN` | Optional read-only PAT for public flywheel |
| `SECURIST_DAEMON_SECRET` | Dev-only; daemon ingest still not “turned on” as a product flag |
| `SECURIST_FEATURE_EVE_GATEWAY` | Still off unless explicitly set later |
| `SECURIST_FEATURE_LLM_PROVIDERS` | Still off |
| `SECURIST_FEATURE_AUTO_DRAFT_PR` | Must remain off |

### Explicitly **not** introduced

- No service-role keys for third-party LLM providers  
- No Eve remote runtime URLs  
- No auto-migration on deploy (run SQL deliberately)  
- No credentials committed to git  

## CLI checklist (when ready to provision)

```bash
# Link (if needed)
vercel link --yes --project securist-hub --scope tarx

# After Marketplace/DB provision — add URL (do not paste secrets into chat logs)
vercel env add DATABASE_URL production --scope tarx
vercel env add SECURIST_GRAPH_STORE production --scope tarx
# value: postgres

# Apply migration with your SQL client against the provisioned DB
# psql "$DATABASE_URL" -f migrations/001_decision_graph.sql

# Deploy is a separate operator step — not part of this PR's success criteria
# vercel deploy --prod --yes --scope tarx
```

## Code map

| Path | Role |
|------|------|
| `src/lib/decision-graph/config.ts` | Mode + URL validation |
| `src/lib/decision-graph/store.ts` | Factory; default memory/seed |
| `src/lib/decision-graph/postgres-store.ts` | Postgres `DecisionGraphStore` |
| `src/lib/decision-graph/postgres-outbox.ts` | Durable outbox port |
| `src/lib/decision-graph/mappers.ts` | SQL rows ↔ domain types |
| `migrations/001_decision_graph.sql` | Canonical schema |
| `src/lib/decision-graph/fixtures/run-store-tests.ts` | Tenant isolation + outbox replay + lifecycle |

## Test command

```bash
npm run test:graph
```

## Residual risks / follow-ups

| Risk | Mitigation / next |
|------|-------------------|
| Serverless connection storms | Use pooler URL; pool `max` kept low in adapter |
| Empty Postgres after switch | Operator must migrate + seed or ingest; seed mode remains for demo |
| Decision status updates on Eve path | Still in-memory mutation on artifact object in seed mode; durable decision writes stay human-gated |
| Preview envs without DB | Keep Preview on `memory`/`seed` or give Preview its own `DATABASE_URL` |

## Audit conclusion

**Ready to provision Postgres next.** One env switch (`SECURIST_GRAPH_STORE=postgres` + `DATABASE_URL`), one migration, no surface model rewrites. Memory/seed default preserved for local/demo.
