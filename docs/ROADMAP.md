# Securist roadmap — now / next / later

**Canonical operational roadmap** for the hub repository.  
Launch history and V1 thesis live in [`docs/V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md) — do **not** fork a second strategy document.  
GTM research: [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) (hypothesis until design partners).

| Field | Meaning |
|-------|---------|
| **ID** | Stable work item id (maps to a work order when active) |
| **Owner** | `grok` \| `codex` \| `human` \| shared |
| **Status** | `now` \| `next` \| `later` \| `blocked` \| `done` |
| **Depends on** | Other item IDs that must complete first |
| **Acceptance** | Done when… |
| **Non-goals** | Explicitly out of scope for this item |

Authority: [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`DECISIONS.md`](./DECISIONS.md) · [`AGENT-OPERATIONS.md`](./AGENT-OPERATIONS.md) · [`ops/work-orders/`](../ops/work-orders/)

---

## NOW (two parallel tracks)

### RM-003 — Provision TARX-scoped Postgres

| | |
|--|--|
| **Owner** | human (credentials + provision) · codex (scope/smoke check) |
| **Status** | `now` |
| **Depends on** | RM-002 (done) |
| **Work order** | [`WO-005`](../ops/work-orders/WO-005-rm003-postgres-provision.md) |
| **Checklist** | [`RM-003-PROVISION-CHECKLIST.md`](./RM-003-PROVISION-CHECKLIST.md) |

**Acceptance**

- [ ] Postgres under **tarx** / `securist-hub` only  
- [ ] `migrations/001_decision_graph.sql` applied  
- [ ] `SECURIST_GRAPH_STORE=postgres`  
- [ ] `DATABASE_URL` set  
- [ ] `SECURIST_DEFAULT_TENANT_ID` set (required; fail-closed if missing)  
- [ ] Production redeploy + smoke; rollback to memory documented  

**Non-goals**

- Agent-created credentials · Eve/LLM enablement · Hobby scope  

### RM-010 — Strategic wedge research + design partners

| | |
|--|--|
| **Owner** | grok (research docs) · human (interviews) |
| **Status** | `now` |
| **Depends on** | RM-001 (done) |
| **Work orders** | [`WO-003`](../ops/work-orders/WO-003-strategic-wedge-research.md) (done) · [`WO-004`](../ops/work-orders/WO-004-design-partner-interviews.md) (interviews) |

**Acceptance**

- [x] Cited research: JTBD, alternatives, wedge, ICP, pricing, interviews  
- [x] Design-partner kit  
- [ ] ≥5 interviews scored confirm/revise/kill  
- [ ] Human accepts or rejects ICP in [`DECISIONS.md`](./DECISIONS.md)  

**Non-goals**

- Product code · deploy · inventing market stats · closing enterprise deals as research success  

### RM-011 — Founder thesis (category-defining company)

| | |
|--|--|
| **Owner** | grok (draft) · human (accept/reject after interviews) |
| **Status** | `now` |
| **Depends on** | RM-010 research draft (WO-003 done) |
| **Work order** | [`WO-006`](../ops/work-orders/WO-006-founder-thesis.md) |
| **Artifact** | [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) |

**Acceptance**

- [x] Explicit choices: contrarian insight, enduring product, wedge path, moat, business model, risks, 90-day plan  
- [ ] Human records accept/revise/kill after design partners (WO-004)  

**Non-goals**

- Product code · provision · inventing ARR/TAM · autonomous agents  

---

## NEXT

### RM-004 — Allowlisted change detection

| | |
|--|--|
| **Owner** | shared |
| **Status** | `next` |
| **Depends on** | RM-003 preferred for durable facts; RM-010 interviews inform priority |

**Acceptance**

- [ ] Explicit watchlists only — never whole-internet crawl  
- [ ] Immutable public snapshots; material diffs → re-review  
- [ ] Version/digest/license/model-card/provenance fingerprints  

### RM-005 — Signed operator evidence alpha

| | |
|--|--|
| **Owner** | shared |
| **Status** | `next` |
| **Depends on** | RM-003; interview signal that local validation will be attached |

---

## LATER

### RM-006 — Eve proposals (still propose-only)

| | |
|--|--|
| **Owner** | shared |
| **Status** | `later` |
| **Depends on** | Explicit feature-flag review; automation gates in V1 launch roadmap |

---

## Done (reference)

| ID | Item | Note |
|----|------|------|
| RM-000 | Public Decision Graph V1 | On `main` |
| RM-001 | Agent coordination control plane | PR #3 |
| RM-002 | Postgres Decision Graph store seam repair | PR #4 (superseded sketch PR #2) |

---

## How to use this file

1. Pick the highest **now** item with deps satisfied (human ops vs GTM can parallelize).  
2. One work order → one branch → one PR.  
3. Chat is never canonical.  
4. Scope shifts → append [`DECISIONS.md`](./DECISIONS.md).
