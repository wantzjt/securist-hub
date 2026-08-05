# Securist roadmap — now / next / later

**Canonical operational roadmap** for the hub repository.  
Launch history and V1 thesis live in [`docs/V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md) — do **not** fork a second strategy document.

| Field | Meaning |
|-------|---------|
| **ID** | Stable work item id (maps to a work order when active) |
| **Owner** | `grok` \| `codex` \| `human` \| shared |
| **Status** | `now` \| `next` \| `later` \| `blocked` \| `done` |
| **Depends on** | Other item IDs that must complete first |
| **Acceptance** | Done when… |
| **Non-goals** | Explicitly out of scope for this item |

Authority invariants are in [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) and [`DECISIONS.md`](./DECISIONS.md).  
Agent roles: [`AGENT-OPERATIONS.md`](./AGENT-OPERATIONS.md).  
Active execution: [`ops/work-orders/`](../ops/work-orders/).

---

## NOW

### RM-001 — Agent coordination control plane

| | |
|--|--|
| **Owner** | grok (implement) · codex (review) · human (merge) |
| **Status** | `now` |
| **Depends on** | — |
| **Work order** | [`WO-001`](../ops/work-orders/WO-001-agent-control-plane.md) |

**Acceptance**

- [x] Canonical `docs/ROADMAP.md` with id/owner/status/dependency/acceptance/non-goals
- [x] Append-only `docs/DECISIONS.md` with established foundation decisions
- [x] Work-order format + at least WO-001 and WO-002
- [x] `docs/AGENT-OPERATIONS.md` role split (Grok / Codex / human)
- [x] PR template requires work-order ID, contracts, verification, non-goals
- [x] Dependency-free coordination verification script + CI gate
- [ ] Focused PR merged to `main`

**Non-goals**

- Postgres provision, Vercel env changes, deploy
- Repair or merge of PR #2
- New product UI, route-local domain models, Eve enablement

---

## NEXT

### RM-002 — Repair and re-review Postgres seam (PR #2)

| | |
|--|--|
| **Owner** | grok (repair on rebased branch) · codex (contract/integration review) · human (merge decision) |
| **Status** | `next` |
| **Depends on** | RM-001 |
| **Work order** | [`WO-002`](../ops/work-orders/WO-002-postgres-seam-repair.md) |

**Context:** PR #2 (`feat/postgres-decision-graph-store`) is **not merge-ready**. It must be rebased on current `main` and corrected before any claim of production readiness.

**Acceptance**

- [ ] Rebased on current `main` with a clean diff
- [ ] Tenant-scoped reads **and** writes end-to-end
- [ ] Transactional outbox behavior (graph write + outbox commit together)
- [ ] Bootstrap path documented; lint clean; lifecycle + seam tests green
- [ ] Codex re-review complete; human merge approval
- [ ] **Still no** production switch without RM-003

**Non-goals**

- Provisioning Postgres or setting `DATABASE_URL` in Vercel
- Enabling Eve, remote LLMs, or daemon product flags
- Replacing memory/seed default until adapter is approved

### RM-003 — Provision TARX-scoped Postgres (after RM-002)

| | |
|--|--|
| **Owner** | human (credentials + provision) · codex (verify deploy scope) |
| **Status** | `next` |
| **Depends on** | RM-002 |

**Acceptance**

- [ ] Postgres under **tarx** / `securist-hub` only (see [`VERCEL-SCOPE.md`](./VERCEL-SCOPE.md))
- [ ] `migrations/001_decision_graph.sql` applied deliberately
- [ ] `DATABASE_URL` + `SECURIST_GRAPH_STORE=postgres` set only after adapter approval
- [ ] Production smoke: typecheck/build/lifecycle; no SEED-as-LIVE

**Non-goals**

- Hobby / personal Vercel scope
- Auto-migration on every deploy without operator intent
- Agents creating or pasting credentials into chat/logs

---

## LATER

### RM-004 — Allowlisted change detection

| | |
|--|--|
| **Owner** | shared |
| **Status** | `later` |
| **Depends on** | RM-002 (durable facts preferred); RM-003 for production persistence |

**Acceptance**

- [ ] Explicit watchlists / catalog rows only — never whole-internet crawl
- [ ] Immutable public-source snapshots; material diffs → re-review queue
- [ ] Version/digest/license/model-card/provenance/crypto-agility fingerprints

**Non-goals**

- Silent approval inheritance across versions
- Bulk-forking or private source access without policy

### RM-005 — Signed operator evidence alpha

| | |
|--|--|
| **Owner** | shared |
| **Status** | `later` |
| **Depends on** | RM-002; auth/nonce design review |

**Acceptance**

- [ ] Per-operator auth or signatures; durable nonce replay protection
- [ ] Minimized share-safe payloads only; redaction tests
- [ ] Fail-open field work if hub ingest unavailable

**Non-goals**

- Storing raw local paths, secrets, prompts, or private data on hub
- Public Activity as source of truth for operator events

### RM-006 — Eve proposals (still propose-only)

| | |
|--|--|
| **Owner** | shared |
| **Status** | `later` |
| **Depends on** | Foundation contracts; explicit feature flag review |

**Acceptance**

- [ ] Eve remains candidate evidence + draft workflows only
- [ ] No durable decision writes; no auto external writes
- [ ] Feature flags off until human enablement gates pass ([`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md) automation table)

**Non-goals**

- Autonomous PRs, remote LLM decision authority, unscoped tools

---

## Done (reference)

| ID | Item | Note |
|----|------|------|
| RM-000 | Public Decision Graph V1 | On `main` — see launch history |

---

## How to use this file

1. Pick the highest **now/next** item with deps satisfied.  
2. Open or claim a work order under `ops/work-orders/` (one agent per work order).  
3. One work order → one implementation branch → one PR.  
4. Update the work order status; chat is never canonical.  
5. When scope shifts, append a decision to [`DECISIONS.md`](./DECISIONS.md) rather than rewriting history quietly.
