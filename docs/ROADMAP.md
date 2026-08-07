# Securist roadmap — now / next / later

**Canonical operational roadmap** for the hub repository.  
Launch history: [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md).  
GTM: [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) · Company: [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md).  
**Buyer language:** [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md) · Strategy: [`STRATEGY.md`](./STRATEGY.md).  
**Building in public:** [`BUILDING-IN-PUBLIC.md`](./BUILDING-IN-PUBLIC.md) · GitHub About checklist: [`GITHUB-ABOUT-CHECKLIST.md`](./GITHUB-ABOUT-CHECKLIST.md).  
Release train: [`RELEASE-PLAN.md`](./RELEASE-PLAN.md).  
Operator distribution: [`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md).  
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
**Commercial (D-012):** Free = private individual Operator (local state, local MCP, no source upload, no credits). Paid = shared durable Decision Graph (policy, reviewers, re-review, CI). Enterprise = paid private/air-gapped team control plane. Price **active governed artifacts** + reviewer capacity—never tokens/scans. *Keep your code local for free. Pay when Securist becomes your team’s shared memory and control plane.*

**Operator distribution honesty:** Internally shipped on `main` (monorepo). RC tooling on WO-018. **Not** public `npx @securist/operator` until human-signed release + publish gate ([`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md)).

> Free Local Operator: available from the Securist monorepo today.  
> Public install: forthcoming after signed distribution.

### Golden path (judge the roadmap by this loop)

```text
Public repository
  → honest Decision Brief              LIVE (/assess)
  → private Local Operator             BUILT · RC proof (WO-018) · not npm-public
  → shared decision + owner + policy   NOT LIVE (R1 / WO-008)
  → material change reopens review     NOT LIVE
```

**Announcement is held** until this loop works brilliantly end-to-end—not when the website looks polished.

### Strategic sequence (do not reorder lightly)

1. **WO-012** — free private Operator (`LocalDecisionBriefV1`) — **internally shipped** (PR #19).  
2. **WO-018** — Local Operator **release-candidate proof** (preflight + signed pack + clean-machine verify) — **agent tooling**; human still signs.  
3. **Human** — sign RC with offline key · clean-machine verify · then  
4. **R1 / WO-008** — durable **paid Team Graph** (shared memory) — human provision only.  
5. **Narrow Team Graph workflow** — owner + policy + evidence + re-review for one artifact.  
6. **Change detection / CI enforcement / AI propose-only** — only after the loop is trusted.

---

## EXECUTION LAW — strong delivery without process veto

| Actor | Cadence |
| ----- | ------- |
| **Grok** | At most **one** active implementation work order · **one** narrow PR · full local verification |
| **Codex** | Adversarial review → **approve** / **P0–P1 blocker** / **go-no-go** |
| **Human** | Credentials, migration, production evidence, customer interviews, **final release signature** |

---

## NOW

### Track A — Durable graph (R1) · **paid Team Graph**

| | |
| -- | -- |
| **Owner** | **human** only |
| **Status** | `now` · **blocked** on provision authority · **parallel priority** |
| **Work order** | [`WO-008`](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) |

**R1 is where paid company value starts:** shared decisions, policy, owner, drift, re-review.  
**R1 is not active** until WO-008 exit is human-signed. No private durability claims before then.

### Track B — Wedge validation (R2 inputs)

| | |
| -- | -- |
| **Owner** | **human** |
| **Status** | `now` |
| **Work order** | [`WO-004`](../ops/work-orders/WO-004-design-partner-interviews.md) |
| **Buyer language** | [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md) |

### Track C — Free Operator → distribution RC

| | |
| -- | -- |
| **Owner** | grok (RC tooling WO-018) · **human** (sign, clean-machine, publish) |
| **Status** | **WO-012 complete** · **WO-018 RC proof** · **not** public npm/npx |
| **Work order** | [`WO-018`](../ops/work-orders/WO-018-operator-rc-proof.md) · [`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md) |
| **Human next** | `SECURIST_OPERATOR_SIGNING_KEY=… npm run operator:rc` then clean verify |
| **Live product** | Public `/assess` (PR #14) + monorepo `securist doctor` / `securist assess .` |
| **Distribution** | [`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md) — human-signed install next |
| **Not claimed publicly** | `npx @securist/operator` until release lane exit |

TARX behind the curtain. Synthesis unavailable until real signed model pack.

### Track D — Public Decision Brief funnel

| | |
| -- | -- |
| **Owner** | codex |
| **Status** | `now` · public-surface only |
| **Work order** | [`WO-015`](../ops/work-orders/WO-015-public-funnel-surface.md) |

Public assess remains the primary entry. This narrow surface lane makes the
next boundary explicit: source-available Local Operator for private code and
future Team Graph for shared decisions. It does not activate accounts, R1, or
public Operator distribution.

---

## NEXT

| ID | Item | Unblock when |
| -- | ---- | ------------ |
| WO-008 / R1 | Paid Team Graph (durable shared memory) | Human provision + WO-008 exit |
| Operator release | Signed package + clean-machine install | Human key + [`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md) |
| RM-004 | Repo trust gap / lockfile import | After local Operator + R1 preferred |
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
| WO-012 contracts | LocalDecisionBrief + honest provenance | PR #17 |
| WO-012 Operator | Free private Local Operator (monorepo) | PR #19 · **internally shipped** |
| WO-013 | Open-build GitHub front door | README + community docs |
| WO-012 contracts | LocalDecisionBrief + honest provenance | PR #17 · **filing complete** |

---

## How to use this file

1. One authorized claimed work order only.  
2. Chat is never canonical.  
3. System graph + clean-tree gates apply to every PR.
