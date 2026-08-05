# Decision log

Lightweight **append-only** record of material product and engineering decisions.  
Newest entries at the bottom. Do not rewrite past decisions — supersede with a new entry.

Related: [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`CANONICAL-CONTRACTS.md`](./CANONICAL-CONTRACTS.md) · [`ROADMAP.md`](./ROADMAP.md)

---

## Template

```markdown
### D-NNN — Short title

| | |
|--|--|
| **Date** | YYYY-MM-DD |
| **Owner** | name or role |
| **Status** | accepted \| superseded by D-XXX |

**Context**  
Why a decision was needed.

**Decision**  
What we chose.

**Alternatives considered**  
What we rejected and why (brief).

**Consequences**  
What must now be true in code, ops, and reviews.
```

---

## Established decisions

### D-001 — Decision Graph is canonical

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · foundation gate |
| **Status** | accepted |

**Context**  
Surfaces (`/models`, `/tools`, Scout, Activity, daemon, Eve) risk inventing parallel domain shapes.

**Decision**  
The Decision Graph + policy engine is the source of truth for trust, evidence, and decisions. Every product surface is a view of the graph. No route-local competing domain models.

**Alternatives considered**  
- Graph database first — deferred until query/scale needs prove it.  
- Per-route TypeScript models — rejected (drift and dual authority).

**Consequences**  
New features extend `src/lib/decision-graph/` and `packages/contracts` (or projections of them). PRs that add parallel “catalog truth” are out of contract.

---

### D-002 — Activity is a projection

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · foundation gate |
| **Status** | accepted |

**Context**  
Ops UIs often become accidental ledgers.

**Decision**  
Activity is a **read projection** of durable graph facts (via outbox consumers). It must not invent source facts or accept unauthenticated public writes as authority.

**Alternatives considered**  
- Activity as mutable event store — rejected (dual ledger).

**Consequences**  
Outbox / event table is the bridge from durable writes to UI. Projectors never own trust state.

---

### D-003 — LIVE is not SEED

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · foundation gate |
| **Status** | accepted |

**Context**  
Demo and curated data must not be mistaken for organization telemetry.

**Decision**  
- **LIVE** = a current live source returned data this fetch.  
- **HYBRID** = mix of live + seed/curated.  
- **SEED** = curated fallback / demo — always labeled (`isSeed`, verification `seed`, or UI [SEED]).

**Alternatives considered**  
- Silent fallback to seed without labels — rejected (false confidence).

**Consequences**  
Public Activity and Artifact Profiles must not present seed rows as live org signal.

---

### D-004 — AI proposes only

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · foundation gate |
| **Status** | accepted |

**Context**  
LLMs and Eve agents can generate fluent but unowned claims.

**Decision**  
AI / Eve output is a **proposal or extracted candidate fact** only. Verification stays `observed` at most until humans/policy elevate. No authoritative durable decision writes from AI paths.

**Alternatives considered**  
- Auto-approve on model confidence — rejected.

**Consequences**  
Eve gateway remains propose-only. Feature flags for remote LLM stay off until explicit enablement gates pass.

---

### D-005 — External writes need policy + human

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · foundation gate |
| **Status** | accepted |

**Context**  
Upstream PRs, adapters, and cloud writes can harm customers and reputation if automated carelessly.

**Decision**  
External writes require **explicit policy permission and human approval**. `SECURIST_FEATURE_AUTO_DRAFT_PR` remains off by default; draft-only workflows still need human authorization before default-branch impact.

**Alternatives considered**  
- Fully automated contribution bots — rejected for V1+.

**Consequences**  
Contribution records and draft PR paths must record human approval. Agents must not open production external writes without a human gate.

---

### D-006 — TARX Vercel scope only

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · ops |
| **Status** | accepted |

**Context**  
Securist was briefly associated with Hobby / wrong team scope.

**Decision**  
All Securist hub deploys and production resources use Vercel team **tarx**, project **securist-hub**. Never Hobby or personal account for production.

**Alternatives considered**  
- Hobby for “just testing prod domains” — rejected (domain and secret drift).

**Consequences**  
CLI always `--scope tarx`. See [`VERCEL-SCOPE.md`](./VERCEL-SCOPE.md). Agents do not re-link projects without human confirmation.

---

### D-007 — Version-bound approvals; material change re-opens trust

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · foundation gate |
| **Status** | accepted |

**Context**  
Trust must not silently inherit across releases.

**Decision**  
An approval binds to one artifact version, policy version, scope, and evidence set. Material source/policy/validation/evidence changes force `review_required` (or equivalent re-open) — never quiet `approved`.

**Alternatives considered**  
- Sticky approvals until manual revoke — rejected.

**Consequences**  
State machine and lifecycle fixture are gates. Store adapters must not bypass transitions.

---

### D-008 — Postgres seam before provision (process)

| | |
|--|--|
| **Date** | 2026-08-05 |
| **Owner** | human · ops |
| **Status** | accepted |

**Context**  
PR #2 sketched a Postgres adapter but is not merge-ready (tenant scope, transactional outbox, bootstrap, lint).

**Decision**  
1. Do **not** merge or deploy PR #2 as-is.  
2. Repair and re-review on a rebased branch (roadmap RM-002 / WO-002).  
3. Provision TARX-scoped Postgres **only after** repair approval (RM-003).  
4. Agents never create credentials or claim production durability without human ops.

**Alternatives considered**  
- Merge now and fix forward in production — rejected.  
- Parallel competing schemas — rejected; reuse `migrations/001_decision_graph.sql`.

**Consequences**  
Coordination plane (RM-001) lands first. Infrastructure work is human-gated after code review.
