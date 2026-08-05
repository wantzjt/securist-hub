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
| Tenant-scoped reads | Required tenantId or `SECURIST_DEFAULT_TENANT_ID` |
| Tenant-scoped writes | Required `tenantId`; parent artifact same-tenant check |
| Outbox | Same transaction as evidence/activity writes |
| Config fail-closed | `postgres` without URL → `missing_database_url` |
| Eve / LLM / daemon product flags | **Not enabled** by this seam |
| Production switch | **Not done** — human RM-003 after merge approval |

## Bootstrap

| Mode | Env | Behavior |
|------|-----|----------|
| Local/demo (default) | unset or `SECURIST_GRAPH_STORE=memory\|seed` | Process memory + seed snapshot (`isSeed`) |
| Durable | `SECURIST_GRAPH_STORE=postgres` + `DATABASE_URL` | Postgres adapter; optional `SECURIST_DEFAULT_TENANT_ID` for read defaults |

```bash
# Demo (default)
npm run dev

# After human provisions DB and applies migration (RM-003 — not this PR):
# SECURIST_GRAPH_STORE=postgres
# DATABASE_URL=postgres://...
# SECURIST_DEFAULT_TENANT_ID=public-demo   # optional read default
```

## Exact Vercel env vars (document only — do not set here)

Team **tarx** · Project **securist-hub**

| Name | When |
|------|------|
| `SECURIST_GRAPH_STORE` | `postgres` only after WO-002 merge + human RM-003 |
| `DATABASE_URL` | Required with postgres mode |
| `SECURIST_DATABASE_URL` | Optional alias |
| `SECURIST_DEFAULT_TENANT_ID` | Optional default for read paths |

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
