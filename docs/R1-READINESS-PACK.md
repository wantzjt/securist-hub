# R1 readiness pack — Team Graph Postgres (docs only)

**Status:** Authority granted in writing · provision **not done** · **R1 not active**  
**Date:** 2026-08-13  
**Owner:** **human only** for credentials / env / migration / deploy  
**Work orders:** [`WO-008`](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) · [`WO-005`](../ops/work-orders/WO-005-rm003-postgres-provision.md)  
**Contract freeze:** [`WO-032`](../ops/work-orders/WO-032-team-graph-contract-freeze.md) · [`TEAM-GRAPH-CONTRACTS.md`](./TEAM-GRAPH-CONTRACTS.md) — frozen, **not live**, does **not** activate R1  
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


## WO-032 contract freeze (does not activate R1)

Team Graph Decision / owner / policy / evidence / re-review **contracts are frozen** on `main` (WO-032).  
`/team` and stub API remain **coming next / not live**.

WO-032 does **not** grant provision authority. Do not set connection-string env, do not run migrations, do not flip `SECURIST_GRAPH_STORE=postgres` from this freeze.

Handoff mapping onto `migrations/001_decision_graph.sql` lives in [`TEAM-GRAPH-CONTRACTS.md`](./TEAM-GRAPH-CONTRACTS.md). Optional `re_review_requests` table is John-only after authority — not required to exit R1.

## Human authority gate (required first)

**Authority granted in writing (provision not done).**

Founder (John Wantz) authorized R1 Postgres provision for tarx / securist-hub in Securist COS chat ("Yes do so", 2026-08-12 22:44 America/Chicago / 2026-08-13 ~03:44Z). Recorded on [`WO-008`](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) Progress.

This is **intent to provision**, not completion. Remaining steps (Vercel env, migration, smoke, R1 exit sign-off) stay **human-only**. **R1 is not active.** Team Graph is **not live.** Agents must still **not** provision, mutate env, or declare R1 live.

Historical template (already satisfied by the COS chat line):

```text
I authorize R1 Postgres provision for tarx / securist-hub on <UTC date>.
Go/no-go owner: <name>
```

---

## Exact execution order (when authorized)

### 0. Preconditions

- [x] Authority line recorded on WO-008  
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
Resume R1 from docs/R1-READINESS-PACK.md — authority granted on WO-008 (provision not done; R1 not active)
```
