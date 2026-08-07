# Decision log

Lightweight **append-only** record of material product and engineering decisions.  
Newest entries at the bottom. Do not rewrite past decisions — supersede with a new entry.

Related: [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`CANONICAL-CONTRACTS.md`](./CANONICAL-CONTRACTS.md) · [`ROADMAP.md`](./ROADMAP.md)

---

## Template

```markdown
### D-NNN — Short title

|            |                                 |
| ---------- | ------------------------------- |
| **Date**   | YYYY-MM-DD                      |
| **Owner**  | name or role                    |
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

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-05              |
| **Owner**  | human · foundation gate |
| **Status** | accepted                |

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

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-05              |
| **Owner**  | human · foundation gate |
| **Status** | accepted                |

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

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-05              |
| **Owner**  | human · foundation gate |
| **Status** | accepted                |

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

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-05              |
| **Owner**  | human · foundation gate |
| **Status** | accepted                |

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

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-05              |
| **Owner**  | human · foundation gate |
| **Status** | accepted                |

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

|            |             |
| ---------- | ----------- |
| **Date**   | 2026-08-05  |
| **Owner**  | human · ops |
| **Status** | accepted    |

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

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-05              |
| **Owner**  | human · foundation gate |
| **Status** | accepted                |

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

|            |             |
| ---------- | ----------- |
| **Date**   | 2026-08-05  |
| **Owner**  | human · ops |
| **Status** | accepted    |

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

---

### D-009 — Freeze process work; two active tracks only

|            |                     |
| ---------- | ------------------- |
| **Date**   | 2026-08-06          |
| **Owner**  | human · founder ops |
| **Status** | accepted            |

**Context**  
PR #9 delivered honest R0–R3 release gates. Further process invention risks theater. Founder thesis requires real interview and PoV evidence before surface expansion.

**Decision**

1. **Freeze** new operational-process frameworks (no new release trains, meta-verifiers, or coordination systems unless human reopens).
2. Cadence: **Grok** one WO / one PR / full local verify → **Codex** approve or P0–P1 blocker or go-no-go → **Human** credentials, migration, prod evidence, interviews, release signature.
3. **Only two active tracks:** [WO-008](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) (R1 Postgres, human) and [WO-004](../ops/work-orders/WO-004-design-partner-interviews.md) (interviews + PoV, human).
4. **No** new UI, agents, feeds, or model integrations until one track produces real evidence.

**Alternatives considered**

- Continue building process and product surface in parallel — rejected (dilutes decision-system focus).
- Agent-owned provision — rejected (D-008 / D-006).

**Consequences**  
Grok does not open product WOs under freeze. Codex does not expand scope. R1 stays unclaimed until human WO-008 exit. Roadmap NEXT items stay frozen until evidence.

---

### D-010 — Founder scope authority and regression guardrails

|            |                                                 |
| ---------- | ----------------------------------------------- |
| **Date**   | 2026-08-06                                      |
| **Owner**  | human · founder                                 |
| **Status** | accepted · supersedes D-009 clauses 1, 3, and 4 |

**Context**

D-009 correctly stopped process theater but was later applied as an absolute veto over explicit founder direction. That inverted the authority model and blocked the conversion surface the product needs. The repository also lacked a machine-checkable map from product authority to code, invariants, tests, and human gates.

**Decision**

1. The founder may explicitly authorize product or operational scope. Evidence bars inform sequencing; they do not overrule direct human scope authority.
2. Keep the useful cadence from D-009: one work order, one branch, one narrow PR, complete verification, human control of credentials, production migration, deploy, and external writes.
3. `ops/system-graph.json` is the canonical **repository architecture map**. It maps authority → implementation → invariant → automated check or human gate. It never replaces the customer Decision Graph.
4. Every work order starts and ends with a clean git tree. Generated tracked changes or non-ignored residue fail CI.
5. A change may extend the system, but it may not weaken an established invariant without an explicit superseding decision, updated contract, and regression proof.

**Alternatives considered**

- Preserve D-009 as an absolute product freeze — rejected; process cannot outrank explicit founder direction.
- Rely on prose architecture alone — rejected; paths and enforcement drift silently.
- Treat a green build as regression proof — rejected; it does not map product authority or detect generated tree residue.

**Consequences**

Product work may proceed through explicitly authorized work orders. CI validates the internal system graph before merge and checks repository cleanliness before install and after verification. R1 and external-write claims remain human-gated; this decision does not activate Postgres, private customer persistence, autonomous PRs, or deploy authority.

---

### D-011 — Product category: permission system (not AI security / MCP / scanner)

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-07              |
| **Owner**  | human · founder         |
| **Status** | accepted                |

**Context**

Public assess (WO-010) and local Operator contracts (WO-012 filing) need a durable product sentence so surfaces do not drift into chat, scanner, or infrastructure branding.

**Decision**

1. **Locked product sentence:** *Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.*
2. **Category:** permission system for AI-accelerated software adoption. Not “AI security,” not MCP-as-product, not a repo scanner.
3. **Four questions owned:** what entered · was it permitted · what evidence · what changed that forces reconsider.
4. **Business shape:** free public assess + generous local Operator; paid shared Decision Graph, re-review, and later enforcement.
5. **TARX:** behind the curtain (local privacy-preserving execution + signed model supply chain)—not customer-facing infrastructure brand.
6. **Pivotal UX:** permission no longer current under gaps/drift—not chat.
7. **North-star metric:** time from material change to an accountable re-review.
8. **Sequence:** WO-012 local private assess → R1 durable graph → change detection → CI/GitHub enforcement → AI propose-only remediation. Do not skip ahead to autonomous action.

**Consequences**

Marketing and WO acceptance criteria must not reframe Securist as a scanner or chat agent. Local CLI remains adoption-generous; monetization centers on shared memory and enforcement after R1.

---

### D-012 — Commercial architecture: free private / paid shared & accountable

|            |                         |
| ---------- | ----------------------- |
| **Date**   | 2026-08-07              |
| **Owner**  | human · founder         |
| **Status** | accepted                |

**Context**

D-011 locked category and north-star. Free vs paid must not be “cloud vs local.” Value boundary is **private individual utility** vs **shared durable organizational memory and control**.

**Decision**

1. **Free = private and individual.** Free Operator: assess locally, private local state, local MCP, no source upload, no usage credits. Public web assess remains free acquisition (share-safe public repos only).
2. **Paid = shared, durable, and accountable.** Team Graph: shared decisions, reviewers, policy, change detection, re-review alerts, CI enforcement. Cloud is the normal paid delivery path—not the definition of paid.
3. **Enterprise = paid private/air-gapped deployment** still paid because it provides team policy, durable decisions, re-review workflow, fleet governance, auditability—not because compute is remote.
4. **Pricing unit:** **active governed artifacts** plus team/reviewer capacity. **Never** AI token metering, scan counts, or model-call credits.
5. **Product handoff:** public assess → free local assess → optional team decision (policy + owner + evidence + re-review trigger).
6. **Ethical line:** *Keep your code local for free. Pay when Securist becomes your team’s shared memory and control plane.*
7. **Exact dollar pricing** remains a design-partner validation question (WO-004)—not locked here.

| Tier | Promise |
|------|---------|
| Free Operator | Assess locally · private local state · local MCP · no source upload · no credits |
| Team Graph | Shared decisions · reviewers · policy · drift/re-review · CI enforcement |
| Enterprise | SSO · private/air-gapped deploy · fleet controls · audit export · support · custom policy |

**Alternatives considered**

- Price local compute or model calls — rejected (penalizes adoption; wrong value unit).  
- Free = anything local, paid = only cloud — rejected (air-gapped team graph is still paid).  
- Free tier with credit meters for assess — rejected (friction and misaligned incentive).

**Consequences**

WO-012 must remain free-path honest (local-only, no hub persist). R1 activates paid path capability (durable shared graph), not “force cloud for individuals.” No billing UI, accounts product, or pricing page in current WOs—this decision constrains future commercial design only.

### D-013 — Public assess resilience without privileged tokens

|            |                                 |
| ---------- | ------------------------------- |
| **Date**   | 2026-08-07                      |
| **Owner**  | grok / founder                   |
| **Status** | accepted                        |

**Context**

Live `/assess` depends on unauthenticated GitHub REST. Flakiness and rate limits must not be papered over with tokens, fake success, or private-input logging.

**Decision**

1. Explicit per-call outbound timeout on public assess GitHub fetches.
2. Bounded in-process cache of **public** `owner/repo` facts only (never `intendedUse` / secrets).
3. Client-visible codes: `timeout`, `upstream_unavailable`, `rate_limited`, plus existing codes — no fake LIVE seed for public assess failures.
4. Human production checklist in `docs/PUBLIC-ASSESS-RATE-CONTROL.md`; not an SLA.
5. Still **no** `GITHUB_TOKEN` / Authorization on the anonymous path.

**Alternatives considered**

- Attach server token to raise rate limits — rejected (trust boundary for anonymous assess).  
- Unbounded multi-instance shared cache claiming global QPS — rejected (false capacity claims).  
- Silent seed fallback on GitHub failure for public assess — rejected (LIVE honesty).

**Consequences**

WO-016 implements timeout/cache/error map + fixtures. Ops must not advertise unlimited assess. Edge rate limits remain human-owned.
