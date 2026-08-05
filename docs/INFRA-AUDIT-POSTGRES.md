# Infra audit — Postgres Decision Graph store seam (WO-002 repair)

**Date:** 2026-08-05  
**Repo:** [wantzjt/securist-hub](https://github.com/wantzjt/securist-hub)  
**Work order:** WO-002  
**Scope:** Durable store **adapter seam** only. No credentials. No provision. No deploy.

## Status after WO-002 repair

| Item | State |
|------|--------|
| Canonical schema | `migrations/001_decision_graph.sql` only |
| Memory/seed store | **Still the default** (local/demo) |
| Postgres adapter | `postgres-store.ts` + transactional outbox |
| Tenant-scoped reads | Explicit `tenantId` or required default (below) |
| Tenant-scoped writes | Required `tenantId`; parent artifact same-tenant check |
| Outbox | Same transaction as evidence/activity writes |
| Config fail-closed | `postgres` without URL → `missing_database_url`; without default tenant → `missing_default_tenant_id` |
| Eve / LLM / daemon product flags | **Not enabled** by this seam |
| Production switch | **Not done** — human RM-003 after merge approval |

## Bootstrap

| Mode | Env | Behavior |
|------|-----|----------|
| Local/demo (default) | unset or `SECURIST_GRAPH_STORE=memory\|seed` | Process memory + seed snapshot (`isSeed`) |
| Durable | `SECURIST_GRAPH_STORE=postgres` + `DATABASE_URL` + **`SECURIST_DEFAULT_TENANT_ID`** | Postgres adapter; default tenant **required** for current public surfaces |

Public server functions (Activity, Artifact Profiles, etc.) call the store **without** a per-request tenant. In postgres mode, missing `SECURIST_DEFAULT_TENANT_ID` fails at **config resolve** (`missing_default_tenant_id`) before serving — not mid-request with `tenant_scope`.

```bash
# Demo (default)
npm run dev

# After human provisions DB and applies migration (RM-003 — not this PR):
# SECURIST_GRAPH_STORE=postgres
# DATABASE_URL=postgres://...
# SECURIST_DEFAULT_TENANT_ID=public-demo   # REQUIRED for current public surface
```

## Exact Vercel env vars (document only — do not set here)

Team **tarx** · Project **securist-hub**

| Name | When |
|------|------|
| `SECURIST_GRAPH_STORE` | `postgres` only after WO-002 merge + human RM-003 |
| `DATABASE_URL` | **Required** with postgres mode |
| `SECURIST_DATABASE_URL` | Optional alias for `DATABASE_URL` |
| `SECURIST_DEFAULT_TENANT_ID` | **Required** with postgres mode (current public Securist surface) |

## Tests

```bash
npm run test:graph       # tenant isolation, transactional outbox, lifecycle, config
npm run test:lifecycle
npm run lint && npm run typecheck && npm run build
npm run verify:coordination
```

## Residual

- Live multi-tenant isolation still needs real Postgres integration tests at provision time (fake SQL proves adapter contracts, not network isolation).
- Provisioning and production switch remain **human-gated** (RM-003).
