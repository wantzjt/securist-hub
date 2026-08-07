# Securist roadmap — now / next / later

**Canonical operational roadmap** for the hub repository.  
Launch history: [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md).  
GTM: [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) · Company: [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md).  
Release train: [`RELEASE-PLAN.md`](./RELEASE-PLAN.md).  
Product build: [`SECURIST-V1-START-A-DECISION.md`](./SECURIST-V1-START-A-DECISION.md).

| Field | Meaning |
| ----- | ------- |
| **ID** | Stable work item id |
| **Owner** | `grok` \| `codex` \| `human` \| shared |
| **Status** | `now` \| `next` \| `later` \| `blocked` \| `done` |

Authority: [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`DECISIONS.md`](./DECISIONS.md) · [`AGENT-OPERATIONS.md`](./AGENT-OPERATIONS.md)

**Current scope law:** D-010 supersedes D-009's absolute freeze. Explicit founder-authorized work orders may proceed. One WO/branch/PR, full regression verification, and human gates for credentials, production mutation, and external writes remain mandatory.

---

## EXECUTION LAW — strong delivery without process veto

| Actor | Cadence |
| ----- | ------- |
| **Grok** | At most **one** active implementation work order · **one** narrow PR · full local verification |
| **Codex** | Adversarial review → **approve** / **P0–P1 blocker** / **go-no-go** |
| **Human** | Credentials, migration, production evidence, customer interviews, **final release signature** |

---

## NOW

### Track A — Durable graph (R1)

| | |
| -- | -- |
| **Owner** | **human** only |
| **Status** | `now` · **blocked** on provision authority |
| **Work order** | [`WO-008`](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) |

**R1 is not active** until WO-008 exit is human-signed. No private durability claims before then.

### Track B — Wedge validation (R2 inputs)

| | |
| -- | -- |
| **Owner** | **human** |
| **Status** | `now` |
| **Work order** | [`WO-004`](../ops/work-orders/WO-004-design-partner-interviews.md) |

### Track C — Product V1 (founder-authorized)

| | |
| -- | -- |
| **Owner** | grok (implement) · codex (review) |
| **Status** | `now` · **in progress** under D-010 |
| **Spec** | [`SECURIST-V1-START-A-DECISION.md`](./SECURIST-V1-START-A-DECISION.md) |
| **Work order** | [`WO-010`](../ops/work-orders/WO-010-v1-start-a-decision.md) |
| **Scope** | Homepage, `/assess` public repo assess, Decision Brief, Research nav |
| **Not in this build** | MCP server, GitHub App, Verify, Eve, accounts, private persistence |

Immediate pre-R1 value: paste public GitHub URL → share-safe Decision Brief (no private store).

---

## NEXT

| ID | Item | Unblock when |
| -- | ---- | ------------ |
| WO-012 | Read-only local MCP `assess .` | After WO-010 |
| RM-004 | Repo trust gap / lockfile import | After Start a Decision + R1 preferred |
| RM-005 | Securist Verify / signed evidence | After adoption loop trusted |
| RM-006 | Eve proposals (propose-only) | Feature-flag review + founder bar |

---

## Done (reference)

| ID | Item | Note |
| -- | ---- | ---- |
| RM-000 | Public Decision Graph V1 | `main` |
| RM-001 | Agent coordination | PR #3 |
| RM-002 | Postgres store seam | PR #4 |
| RM-010–011 | Wedge + founder thesis | PR #5–#7 |
| RM-012 | Strong release ops | PR #9 |
| WO-011 | Internal system graph gates | PR #16 |

---

## How to use this file

1. One authorized claimed work order only.  
2. Chat is never canonical.  
3. System graph + clean-tree gates apply to every PR.
