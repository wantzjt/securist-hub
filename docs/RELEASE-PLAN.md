# Securist release plan — R0 → R1 → R2 → R3

**Purpose:** Operationalize the release train for a **design-partner-ready private Decision Graph beta**.  
**Authority:** [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) · [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`ROADMAP.md`](./ROADMAP.md)  
**Work orders:** [WO-007](../ops/work-orders/WO-007-strong-release-ops.md) (process) · [WO-008](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) (R1 human activation)

**Hard rule:** Do **not** claim **R1 is active** until a human has provisioned TARX-scoped Postgres, applied the migration, set the three required env vars, redeployed, and signed R1 exit. Memory/seed default on `main` is **not** R1.

**Hard rule (product surface):** No major surface expansion until founder bar: ≥5 interviews (≥3 confirm) and ≥2 stale-approval PoV runs ([`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) §7).

**Hard rule (process freeze, D-009):** After PR #9, do not invent further release/process machinery. Execute this train via **WO-008** (R1 human) and **WO-004** (interviews/PoV). Cadence: Grok one narrow WO/PR → Codex approve|blocker|go-no-go → Human credentials/migration/evidence/interviews/signature.

---

## Train overview

| Train | Name | Intent | Primary owner |
|-------|------|--------|----------------|
| **R0** | Public authority | Honest public profiles + seed discipline; language of version-bound decisions | shared (docs + public site) |
| **R1** | Durable graph activation | Production uses Postgres Decision Graph store | **human** (provision) |
| **R2** | Proof-of-value | Stale-approval kill with design partners / dogfood | human + design partners |
| **R3** | Strong release | Go/no-go for design-partner-ready **private** beta | human go/no-go owner |

```text
R0 public authority ──► R1 durable graph ──► R2 PoV ──► R3 strong release
     (may parallel)         (human only)      (interviews+PoV)   (checklist)
```

R0 can progress while R1 is still pending. **R2 private PoV that requires durable org decisions needs R1.** R3 requires R1 + R2 exit (or documented waiver by go/no-go owner with explicit residual risk).

---

## R0 — Public authority

### Intent

Establish Securist as the *language* of version-bound adoption decisions without claiming private org telemetry or durable production decisions.

### Entry criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R0-E1 | Public Decision Graph V1 surfaces on `main` | CI build/lifecycle |
| R0-E2 | LIVE / HYBRID / SEED semantics documented and labeled in product contracts | docs review |
| R0-E3 | Coordination control plane on `main` (work orders, CI) | CI `verify:coordination` |

### Exit criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R0-X1 | Public Artifact Profile index and at least one profile route render in production | **Human** smoke |
| R0-X2 | No seed row presented as LIVE org activity | **Human** smoke + product rules |
| R0-X3 | Founder thesis + wedge research published | docs on `main` |
| R0-X4 | `npm run verify:release-readiness` passes (process artifacts present) | **CI / local** |

### Non-claims

- R0 does **not** imply durable Postgres decisions.  
- R0 does **not** imply design-partner private beta.

---

## R1 — Durable Decision Graph activation

### Intent

Production (tarx / securist-hub) runs `SECURIST_GRAPH_STORE=postgres` with fail-closed config and migration applied.

### Entry criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R1-E1 | Postgres store seam on `main` (WO-002 / PR #4) | git history |
| R1-E2 | Fail-closed: missing URL → `missing_database_url`; missing default tenant → `missing_default_tenant_id` | unit/config tests in CI |
| R1-E3 | WO-008 exists and names env vars, migration, rollback, smoke | offline verifier |
| R1-E4 | **Explicit human provision authority** recorded on WO-008 | **Human only** |

### Exit criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R1-X1 | Postgres under **tarx** / **securist-hub** only | **Human** |
| R1-X2 | `migrations/001_decision_graph.sql` applied | **Human** |
| R1-X3 | Env set: `SECURIST_GRAPH_STORE=postgres`, `DATABASE_URL`, `SECURIST_DEFAULT_TENANT_ID` | **Human** (values never in git) |
| R1-X4 | Production redeployed; no startup config errors for graph store | **Human** smoke |
| R1-X5 | Rollback path documented and understood (`memory` / seed) | **Human** |
| R1-X6 | WO-008 marked complete with go/no-go owner + UTC | **Human** |

### Current status declaration

**R1 is not active** as of this document’s merge unless WO-008 Progress explicitly records completion. Default production path remains memory/seed until then.

### Non-goals for R1

- Customer multi-tenant onboarding at scale  
- Eve / daemon product flags  
- Claiming SEED catalog as LIVE org decisions  

---

## R2 — Proof-of-value (stale-approval kill)

### Intent

Validate the wedge with real (or serious dogfood) governed artifacts: version-bound approve → material change → `review_required` → re-review.

### Entry criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R2-E1 | R0 exit satisfied (public language exists) | process |
| R2-E2 | For **private durable** PoV: R1 exit satisfied | process |
| R2-E3 | Design-partner kit available | docs |
| R2-E4 | Lifecycle fixture green on `main` (state machine still holds) | CI `test:lifecycle` |

### Exit criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R2-X1 | ≥2 end-to-end stale-approval PoV runs completed | **Human** evidence |
| R2-X2 | ≥5 design-partner interviews scored; ≥3 confirm wedge | **Human** (WO-004) |
| R2-X3 | Partner or dogfood owner can state time-to-re-review or stale approval avoided | **Human** |
| R2-X4 | No silent version inherit observed in PoV path | lifecycle + **Human** PoV notes |

### Non-claims

- R2 does **not** authorize major product surface expansion by itself; founder bar still applies.  
- R2 does **not** require Eve or autonomous agents.

---

## R3 — Strong release (design-partner private beta)

### Intent

A single **go/no-go** that the private Decision Graph beta is operationally safe enough for invited design partners under tarx scope.

### Entry criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R3-E1 | R1 exit complete (durable graph on) | process + **Human** |
| R3-E2 | R2 exit complete **or** written residual-risk waiver by go/no-go owner | **Human** |
| R3-E3 | [`ops/release/R3-STRONG-RELEASE.md`](../ops/release/R3-STRONG-RELEASE.md) checklist in use | offline verifier presence |
| R3-E4 | CI green on release candidate commit | CI |

### Exit criteria

| # | Criterion | Automated? |
|---|-----------|------------|
| R3-X1 | All P0 items in R3 checklist PASS | mix (see checklist) |
| R3-X2 | No open P0 defects; P1 dispositioned (fix or accepted risk) | **Human** |
| R3-X3 | Customer-proof evidence pack listed (redacted) | **Human** |
| R3-X4 | Go/no-go owner signs PASS with UTC | **Human** |

### Executable checklist

→ **[`ops/release/R3-STRONG-RELEASE.md`](../ops/release/R3-STRONG-RELEASE.md)**

---

## Severity and stop rules (all trains)

| Severity | Definition | Stop rule |
|----------|------------|-----------|
| **P0** | Data loss risk, wrong LIVE/SEED claim, auth/config fail-open in postgres mode, silent approval inherit, secrets in git, wrong Vercel scope | **Stop release.** Do not proceed to next train. |
| **P1** | Broken critical route, migration/rollback unclear, missing required env documentation, incomplete R1 evidence | **Stop R3.** May continue R0 docs only. |
| **P2** | Cosmetic, non-blocking docs gaps, optional polish | Log; do not block R0; disposition before R3 exit |

---

## Related work orders

| WO | Role |
|----|------|
| WO-005 | RM-003 provision checklist twin (human) |
| WO-007 | This release operations process (docs + verifier) |
| WO-008 | R1 activation execution (human, blocked until authority) |
| WO-004 | Design-partner interviews (feeds R2) |

---

## What CI verifies vs humans

| Layer | CI / offline scripts | Human only |
|-------|----------------------|------------|
| Docs completeness | `verify:release-readiness`, `verify:coordination` | — |
| Unit/lifecycle/graph | `lint`, `typecheck`, `test:*`, `build` | — |
| TARX scope, real deploy, DB | — | Always |
| Secrets, env values | — | Always |
| Customer/PoV evidence | — | Always |
| Go/no-go signature | — | Always |

`verify:release-readiness` **never** fakes live Vercel, database, customer, or security evidence.
