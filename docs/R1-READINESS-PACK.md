# R1 readiness pack — Team Graph Postgres (docs only)

**Status:** Ready for human decision · **not provisioned**  
**Date:** 2026-08-10  
**Owner:** **human only** for credentials / env / migration / deploy  
**Work orders:** [`WO-008`](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) · [`WO-005`](../ops/work-orders/WO-005-rm003-postgres-provision.md)  
**Checklists:** [`RM-003-PROVISION-CHECKLIST.md`](./RM-003-PROVISION-CHECKLIST.md) · [`RELEASE-PLAN.md`](./RELEASE-PLAN.md) · [`VERCEL-SCOPE.md`](./VERCEL-SCOPE.md)

Agents must **not** provision, set secrets, or declare R1 live from this document.

---

## Why R1 matters (product)

```text
Free:  public Assess + private Local Operator
Paid:  shared Team Graph — owner, policy, evidence, re-review under change
```

R1 flips production Decision Graph from **memory/seed** to **Postgres durable**.  
Until R1 exit is human-signed, **do not** claim multi-user durability or paid Team Graph live.

---

## Code readiness (already on main)

| Item | State |
|------|--------|
| Postgres store seam | Merged (WO-002 / PR #4) |
| Fail-closed missing URL | `missing_database_url` |
| Fail-closed missing default tenant | `missing_default_tenant_id` |
| Schema | `migrations/001_decision_graph.sql` only |
| Default production mode | **Still memory/seed** |
| Tests | `npm run test:graph` · `test:lifecycle` |

---

## Human authority gate (required first)

R1 stays **blocked** until you write **explicit provision authority**, e.g. on WO-008 Progress:

```text
I authorize R1 Postgres provision for tarx / securist-hub on <UTC date>.
Go/no-go owner: <name>
```

Without that line, agents stop at this pack.

---

## Exact execution order (when authorized)

### 0. Preconditions

- [ ] Authority line recorded on WO-008  
- [ ] Access to Vercel team **tarx** · project **securist-hub** only ([`VERCEL-SCOPE.md`](./VERCEL-SCOPE.md))  
- [ ] Human operator available (not an agent session alone)  

### 1. Provision Postgres

- [ ] Marketplace DB under **tarx** / **securist-hub** (not Hobby / personal)  
- [ ] Prefer **pooled** connection string for serverless  

### 2. Migration

```bash
# Human machine only — never commit the URL
psql "$DATABASE_URL" -f migrations/001_decision_graph.sql
```

### 3. Environment (Production)

| Variable | Value |
|----------|--------|
| `SECURIST_GRAPH_STORE` | `postgres` |
| `DATABASE_URL` | pooler URL from provisioner |
| `SECURIST_DEFAULT_TENANT_ID` | e.g. `public-demo` (required) |

```bash
vercel env add SECURIST_GRAPH_STORE production --scope tarx
vercel env add DATABASE_URL production --scope tarx
vercel env add SECURIST_DEFAULT_TENANT_ID production --scope tarx
```

### 4. Redeploy

```bash
vercel deploy --prod --yes --scope tarx
# or rely on production follows main after env is set
```

### 5. Smoke

- [ ] `/`, `/artifacts`, one profile, `/activity` load  
- [ ] No `missing_database_url` / `missing_default_tenant_id`  
- [ ] Empty durable graph does not present seed as LIVE org telemetry  
- [ ] Capture evidence **privately** (no secrets in git): UTC, deployer initials, redacted env names  

### 6. Rollback

```text
SECURIST_GRAPH_STORE=memory  → redeploy
```

App returns to seed/demo; DB may remain unused.

### 7. Close WO-008

- [ ] R1 exit criteria in [`RELEASE-PLAN.md`](./RELEASE-PLAN.md) checked  
- [ ] Go/no-go owner + UTC on WO-008 Progress  
- [ ] WO-008 `status: complete`  

---

## What R1 does **not** unlock by itself

- Public Operator npm  
- Automatic private-repo cloud assess  
- Eve / daemon product enablement  
- Design-partner interviews (WO-004 still human)  
- Announcement  

---

## Suggested sequence vs Operator publish

| Order | Recommendation |
|-------|----------------|
| **Default** | Optional GitHub Release RC **before** R1 — free path sharable without paid infra |
| **Parallel** | R1 can run the same week if you want paid Team Graph story sooner |
| **Do not** | Announce “shared durable decisions” before R1 exit |

---

## Agent resume line

```text
Resume R1 from docs/R1-READINESS-PACK.md — authority [not granted | granted on WO-008]
```
