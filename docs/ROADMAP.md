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

**Product sentence (locked):** *Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.*  
**North-star metric:** time from material change to an accountable re-review.  
**Not the product:** AI security chat, MCP-as-product, or scanner feed theater. TARX stays behind the curtain (local privacy-preserving execution + signed model pack).

### Strategic sequence (do not reorder lightly)

1. **WO-012** — `securist assess .` genuinely useful offline and private (`LocalDecisionBriefV1`).  
2. **R1** — durable team graph so a decision survives beyond one laptop.  
3. **Change detection** — before autonomous action.  
4. **CI/GitHub enforcement** — after teams trust decision/re-review.  
5. **AI propose-only remediation** — only after the loop is trusted.

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
| **Status** | `now` · **WO-010 complete** · **WO-012 contracts filed (PR #17)** · implementation **ready to claim** |
| **Live product** | Public `/assess` → ephemeral `PublicDecisionBriefV1` (PR #14) |
| **Next work order** | [`WO-012`](../ops/work-orders/WO-012-local-operator-assess.md) — claim for Operator implementation |
| **Scope (WO-012)** | Local `securist assess .` → honest `LocalDecisionBriefV1` · available/verified/used provenance · stdio MCP · deterministic without theater |
| **Not in WO-012** | GitHub App · Verify · Eve · accounts · external writes · durable team graph (R1) · production deploy |

TARX behind the curtain: Runtime mandatory · signed Model Pack when doctor allows · adapters only · no silent cloud/unsigned fallback.

---

## NEXT

| ID | Item | Unblock when |
| -- | ---- | ------------ |
| WO-012 | Local Operator `assess .` + read-only MCP | **ready** — claim to implement |
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
| WO-010 | Public assess → ephemeral Decision Brief | PR #14 · **V1 public launch** |
| WO-012 contracts | LocalDecisionBrief + honest provenance | PR #17 · **filing complete** |

---

## How to use this file

1. One authorized claimed work order only.  
2. Chat is never canonical.  
3. System graph + clean-tree gates apply to every PR.
