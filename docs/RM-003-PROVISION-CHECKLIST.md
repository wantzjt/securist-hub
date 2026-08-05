# RM-003 — TARX Postgres provision checklist (human only)

**Status:** Ready for human execution after WO-002 / PR #4 on `main`  
**Work order:** [WO-005](../ops/work-orders/WO-005-rm003-postgres-provision.md)  
**Scope lock:** [`VERCEL-SCOPE.md`](./VERCEL-SCOPE.md) — team **tarx**, project **securist-hub** only  
**Agents:** Do **not** create credentials, paste secrets into chat, or run provision commands without explicit human handoff.

Detail: [`INFRA-AUDIT-POSTGRES.md`](./INFRA-AUDIT-POSTGRES.md)

---

## Preconditions

- [x] Decision Graph Postgres seam merged (WO-002 / PR #4)  
- [x] Fail-closed config: missing URL → `missing_database_url`; missing default tenant → `missing_default_tenant_id`  
- [ ] Human operator available with tarx Vercel + DB marketplace access  

---

## Steps

### 1. Provision database

- [ ] In Vercel **tarx** / **securist-hub**, provision Postgres (Marketplace Neon/Supabase/etc.)  
- [ ] Prefer **pooled** connection string for serverless  
- [ ] Confirm project org is **tarx** (not Hobby)

### 2. Apply migration

```bash
# On a machine with the production URL (never commit it)
psql "$DATABASE_URL" -f migrations/001_decision_graph.sql
```

- [ ] Migration applied once; no competing schema shapes  

### 3. Set environment variables

Production (and Preview only if testing durable mode there):

| Variable | Required | Example / note |
|----------|----------|----------------|
| `SECURIST_GRAPH_STORE` | yes | `postgres` |
| `DATABASE_URL` | yes | from provisioner (pooler recommended) |
| `SECURIST_DEFAULT_TENANT_ID` | yes | e.g. `public-demo` for public surface reads |

Optional alias: `SECURIST_DATABASE_URL` if `DATABASE_URL` unset.

CLI pattern (human):

```bash
vercel env add SECURIST_GRAPH_STORE production --scope tarx
vercel env add DATABASE_URL production --scope tarx
vercel env add SECURIST_DEFAULT_TENANT_ID production --scope tarx
```

### 4. Redeploy

```bash
vercel deploy --prod --yes --scope tarx
# or ship via Git push if Production follows main
```

### 5. Smoke

- [ ] `/` and `/artifacts` load  
- [ ] No SEED-as-LIVE confusion on public Activity  
- [ ] Startup does **not** throw `missing_database_url` / `missing_default_tenant_id`  
- [ ] With empty DB, surfaces degrade safely (empty graph)—not mid-request `tenant_scope` from missing default  

### 6. Rollback

- [ ] Set `SECURIST_GRAPH_STORE=memory` (or remove) and redeploy to return to seed/demo store  

---

## Explicit non-goals for this checklist

- Enabling Eve / LLM providers / auto-PR  
- Loading production customer secrets into seed  
- Agent-owned credential creation  
- Whole-internet watchlists  
