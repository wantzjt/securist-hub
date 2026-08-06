# Securist roadmap — now / next / later

**Canonical operational roadmap** for the hub repository.  
Launch history: [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md).  
GTM: [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) · Company: [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md).  
Release train: [`RELEASE-PLAN.md`](./RELEASE-PLAN.md).

| Field | Meaning |
|-------|---------|
| **ID** | Stable work item id |
| **Owner** | `grok` \| `codex` \| `human` \| shared |
| **Status** | `now` \| `next` \| `later` \| `blocked` \| `done` |

Authority: [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`DECISIONS.md`](./DECISIONS.md) · [`AGENT-OPERATIONS.md`](./AGENT-OPERATIONS.md)

---

## FREEZE — operational process

**As of PR #9 merge:** stop inventing new process frameworks, release-train docs, or coordination machinery.

| Actor | Cadence |
|-------|---------|
| **Grok** | At most **one** active implementation work order · **one** narrow PR · full local verification |
| **Codex** | Adversarial review: scope, contracts, tenant safety, tests, release impact → **approve** / **P0–P1 blocker** / **go-no-go** |
| **Human** | Credentials, migration, production evidence, customer interviews, **final release signature** |

**No new UI, agents, feeds, or model integrations** until an active track produces real evidence (R1 live and/or interview+PoV bar).

---

## NOW — only two active tracks

### Track A — Durable graph (R1)

| | |
|--|--|
| **Owner** | **human** only |
| **Status** | `now` · **blocked** on provision authority |
| **Work order** | [`WO-008`](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) |
| **Checklist** | [`RM-003-PROVISION-CHECKLIST.md`](./RM-003-PROVISION-CHECKLIST.md) · twin notes on [WO-005](../ops/work-orders/WO-005-rm003-postgres-provision.md) |

**Do:** TARX Postgres, migration `001`, set `SECURIST_GRAPH_STORE` + `DATABASE_URL` + `SECURIST_DEFAULT_TENANT_ID`, smoke, rollback, evidence.  
**Do not:** product expansion, Eve/daemon, agent-created credentials.

**R1 is not active** until WO-008 exit is human-signed.

### Track B — Wedge validation (R2 inputs)

| | |
|--|--|
| **Owner** | **human** (conversations) |
| **Status** | `now` |
| **Work order** | [`WO-004`](../ops/work-orders/WO-004-design-partner-interviews.md) |
| **Kit** | [`DESIGN-PARTNER-INTERVIEW-KIT.md`](./DESIGN-PARTNER-INTERVIEW-KIT.md) |

**Do:** ≥5 scored interviews; ≥3 confirm wedge; ≥2 end-to-end **stale-approval kill** PoVs.  
**Do not:** invent product surface to impress partners.

**Founder bar before major surface expansion** ([`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) §7): interviews + PoVs as above.

---

## NEXT (frozen until evidence)

Open **only** after Track A and/or B produce real evidence and a new work order is explicitly unblocked.

| ID | Item | Unblock when |
|----|------|----------------|
| RM-004 | Allowlisted change detection | R1 durable preferred + interview signal |
| RM-005 | Signed operator evidence alpha | Interview signal + R1 |
| RM-006 | Eve proposals (propose-only) | Feature-flag review + founder bar |

---

## Done (reference)

| ID | Item | Note |
|----|------|------|
| RM-000 | Public Decision Graph V1 | `main` |
| RM-001 | Agent coordination control plane | PR #3 |
| RM-002 | Postgres store seam | PR #4 |
| RM-010–011 | Wedge research + founder thesis | PR #5–#7 |
| RM-012 | Strong release ops (R0–R3 docs + verifier) | PR #9 · **process complete** |

---

## How to use this file under freeze

1. Work **only** WO-004 or WO-008 unless a human opens a new WO after evidence.  
2. Grok does not open parallel product WOs.  
3. Codex returns approve / P0–P1 blocker / go-no-go — not scope expansion.  
4. Chat is never canonical.
