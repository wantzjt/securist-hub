# Founder thesis — Securist as decision infrastructure

**Work order:** [WO-006](../ops/work-orders/WO-006-founder-thesis.md)  
**Status:** Founder-level thesis for capital, focus, and refusal — **hypothesis until design partners falsify or confirm** ([WO-004](../ops/work-orders/WO-004-design-partner-interviews.md))  
**Date:** 2026-08-05  
**Depends on:** [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) · [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`DECISIONS.md`](./DECISIONS.md) · [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md)

This document makes **explicit choices**. It does not hedge with “all of the above.”  
It does **not** invent ARR, TAM, or price points. Numbers that appear are **thresholds and falsifiers**, not forecasts.

---

## One-line answer

**Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.**

Category (not a synonym set): the **permission system for AI-accelerated software adoption**.  
Not “AI security,” not an MCP product, not a repo scanner.

Operational SoR form (same job): whether a package or model is allowed under a named policy and boundary—and stays allowed as versions, digests, and cards drift—while GitHub, SCA, and agents remain **evidence or proposal producers**, not the decision.

If we cannot own that sentence in the customer’s head, we are a feature.

### The four questions every serious team gets

As coding agents make it trivial to pull in repos, packages, models, and tooling:

1. What entered our environment?  
2. Was it permitted for this use?  
3. What evidence supported that permission?  
4. What changed that means we must reconsider it?

| Layer | Answers |
|-------|---------|
| GitHub | What changed in code |
| SCA | A vulnerability may exist |
| AI agent | May propose a fix |
| **Securist** | **Is this still allowed, and why?** |

### Company shape (free vs paid)

**Refinement (D-012):** Free is **private and individual**. Paid is **shared, durable, and accountable**. Cloud is the normal paid delivery—not the value boundary. Air-gapped enterprise is still paid (team policy, durable decisions, re-review, audit).

| Tier | Promise |
|------|---------|
| **Free Operator** | Assess locally · private local state · local MCP · no source upload · no usage credits |
| **Team Graph** | Shared decisions · reviewers · policy · change detection · re-review alerts · CI enforcement |
| **Enterprise** | SSO · private/air-gapped deploy · fleet controls · audit export · support · custom policy |

| Layer | Free / acquisition | Paid control plane |
|-------|--------------------|--------------------|
| Public web | Assess a public repo (format proof) | — |
| Local Operator | Private individual utility | (same binary; free path stays local) |
| Team graph | — | Durable approvals, ownership, policies |
| Drift | Local change signal only | Re-review workflow, alerts, audit trail |
| Enforcement | Local recommendation | CI/GitHub gate for governed artifacts |

**Ethical line:** *Keep your code local for free. Pay when Securist becomes your team’s shared memory and control plane.*

**Pricing unit:** **active governed artifacts** + team/reviewer capacity—not AI tokens, not scan counts. Exact dollars: design-partner validation (not locked).

**Handoff UX:**

```text
Public Brief
  → “Assess your local code — free”

Local Brief
  → “Keep local” or “Turn this into a team decision”

Team Decision
  → policy + owner + evidence + re-review trigger
```

Free adoption compounds through developers; paid value compounds through **organizational memory**.

**TARX stays behind the curtain:** local, privacy-preserving agent execution and signed model supply chain. Buyers get “local assessment without shipping source code,” not infrastructure branding.

### Pivotal UX (not chat)

```text
You assessed this repository for production use.
3 evidence gaps remain.
A dependency manifest changed since review.
This permission is no longer current.
```

Conversation is useful **inside** that context (explain the gap, minimum evidence, what changed, draft a validation plan)—not as the product itself.

### North-star metric

**Time from material change to an accountable re-review.**  
Not chat messages, scan counts, or feed traffic.

---

## 1. The contrarian insight

### What is structurally broken

**Approvals for security-relevant software and models do not survive change.**

Teams “approve” a package or model once (in a ticket, wiki, meeting, or memory). The artifact then **moves**: new release digests, license text, model cards, maintainers, transitive risk, and intended-use pressure. The approval **does not move with it**. Trust is inherited silently—or forgotten until an incident.

That is not a documentation gap. It is a **missing operational object**: a **version-bound, scope-bound decision** with forced re-open on material drift ([`DECISION-LIFECYCLE.md`](./DECISION-LIFECYCLE.md); D-007 in [`DECISIONS.md`](./DECISIONS.md)).

### Why the stack fails *together*

| Layer | What it optimizes | Why it cannot be the decision SoR |
|-------|-------------------|-----------------------------------|
| **GitHub** (Dependabot, dependency review, advisories) | Repo-local vulnerability discovery and merge gates | Does not bind org policy version + boundary + local validation to an artifact **across** repos and time as a governed asset |
| **SCA / malware scanners** | Find, prioritize, fix known vulns or bad packages | Alerts are **inputs**; “still allowed under policy X for production?” is a different job |
| **GRC / compliance tools** | Framework mapping and audit narrative | Optimize for **checkbox evidence**, not engineer-owned adoption under drift |
| **Model cards / HF Hub** | Publisher documentation and hosting | Cards describe intent; they do not **enforce** tenant decisions or re-review when cards/digests change |
| **Tickets & spreadsheets** | Flexible human coordination | Approvals **age without binding** to version, policy, or evidence set |

The failure mode is collective: **excellent detection + soft, unversioned memory of “we said yes.”**

### Why now

1. **Supply-chain and model adoption are the same workflow shape** for security teams (public artifact → policy → local check → allow → something changes). Dual-forge is not a branding trick; it is the same Decision Graph ([`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md)).  
2. **AI increases proposal volume** (scouts, chat, “just pull this model”) without increasing trustworthy **decision authority**—so propose-only AI is a design requirement, not a feature flag story (D-004).  
3. **Scanners are table stakes.** Differentiation is no longer “more alerts”; it is **who owns allow/deny under change**.  
4. **Securist already encodes the invariants in product contracts** (version-bound approval, material change → `review_required`, Activity as projection). The company bet is that those invariants are the category, not implementation detail.

---

## 2. The enduring product

### Definition (one sentence)

**Securist is the permission system for AI-accelerated software adoption**—adopting, bounding, validating, and re-approving security-relevant code and models under change.

Not: “AI security” as a category label.  
Not: an MCP server (MCP is an interface later).  
Not: a repo scanner.  
Not: a security news feed or package/model catalog.  
Not: a generic AI agent.  
Not: a thin UI over GitHub or Snyk.

### Decision Graph as proprietary operational asset

The Decision Graph is **not** “we use Postgres and edges.” It is the **accumulated, tenant-scoped history of trust**:

```text
Artifact → ArtifactVersion → Evidence → PolicyEvaluation → Decision(scope)
                              ↑                ↑
                         change events    material drift → review_required
```

What makes it proprietary over time is **not** the schema (which is public in-repo). It is:

| Compounding input | What accumulates |
|-------------------|------------------|
| **Artifacts** | The org’s real allowlist—not the public seed catalog |
| **Validations** | Minimized local proof that this tenant actually ran something |
| **Approvals** | Who said yes, under which policy version and scope, for which version |
| **Drift events** | What broke trust and when re-review opened |
| **Contributions** | Human-authorized upstream/adapter work tied to the same graph |

Every closed re-review **teaches the org’s graph** how this tenant treats risk. That history cannot be reconstituted from a green Dependabot dashboard.

### What compounds (and what does not)

| Compounds | Does not compound |
|-----------|-------------------|
| Version-bound decisions under named policy | Pageviews on Activity |
| Re-review latency and stale-approval prevention | Raw scout API call volume |
| Templates of evidence/policy that fit this ICP | Generic “AI chat sessions” |
| Operator trust that local summaries stay share-safe | Autonomous external writes |

---

## 3. The wedge-to-platform path

**Choice:** Start narrow. Expand only when the prior layer is paid and operational—not when a blog post is interesting.

### Stage 0 — Authority surface (public, mostly free)

Public Artifact Profiles + honest LIVE/SEED labeling. Purpose: **language and trust**, not revenue. Success: design partners use the *vocabulary* of version-bound decisions.

### Stage 1 — Paid wedge (must win first)

| Element | Choice |
|---------|--------|
| **ICP** | Security / platform engineering leads with a stale informal allowlist ([`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) ICP-1) |
| **Artifact class** | **Security-relevant GitHub packages/repos** (tools and deps), not “all open source” |
| **Paid workflow** | Adopt → scoped conditional/approve → material change → **re-review** (+ optional local validation summary) |
| **Success metric** | Stale approvals avoided · time-to-re-review after material change |

**Refuse until Stage 1 is real:** governments as primary GTM, quantum as hero narrative, autonomous research agents as product center.

### Stage 2 — Same graph, second artifact class

**Security-domain models** (Hugging Face) on the **same** Decision Graph—same lifecycle, not a second product.  
**Must be true first:** Stage 1 customers already re-open package decisions on digest/license drift; at least some ask for models in the same review conversation.

### Stage 3 — Operating system for security adoption

Only after Stages 1–2:

- Org policy libraries and review queues as default work  
- Signed operator evidence as expected, not optional  
- Controlled contribution workflows (human-gated external writes)  
- Allowlisted change detection at volume  

**Must be true first:** renewal on governed-artifact + reviewer pricing; graph is cited in internal process (“check Securist”) not just bookmarked.

### Stage 4 — Category authority (not feature)

When Securist is the default place a serious team records “allowed under policy,” expansion into crypto-agility inventories, regulated buyers, and research agents is **distribution of the same object**—not a pivot into GRC suites or agent marketplaces.

**Explicit order of expansion (no hedge):**

1. Governed GitHub security packages  
2. Same-graph security models  
3. Deeper workflow embedding (validation + contributions)  
4. Broader artifact classes and regulated segments  

Never reverse 4 before 1.

---

## 4. The moat

### Fake moats (do not fund these as strategy)

| Fake moat | Why fake |
|-----------|----------|
| Pretty hub / catalog UI | Incumbents ship UI continuously |
| “We integrate GitHub and HF” | Integration is table stakes |
| Generic LLM features | Commodity; liability without decision authority |
| Public seed content | Not proprietary; must stay labeled SEED |
| Schema in git | Public by design; not the moat |

### Real moats (build these on purpose)

| Moat | Mechanism |
|------|-----------|
| **Proprietary decision history** | Tenant graph of approvals, evidence, drift, re-reviews—switching cost is losing institutional memory |
| **Workflow embedding** | Reviewers close `review_required` *in* Securist; tickets become projections, not SoR |
| **Policy + evidence templates for the ICP** | Reusable “how we allow a security CLI / CTI model” patterns that shorten time-to-decision |
| **Local-validation trust boundary** | Operators trust minimized summaries; hub refuses raw secrets—hard to bolt onto a feed |
| **Ecosystem authority** | Public profiles + dual-forge honesty (LIVE ≠ SEED) make Securist the *language* of adoption |
| **Distribution** | Start with public authority + design partners who already feel allowlist pain—not enterprise GRC RFPs |

### Why a large incumbent cannot just “add a dashboard”

GitHub, Snyk-class SCA, and HF can each add panels. They cannot cheaply become the **cross-tool, version-bound decision SoR** without:

1. **Cannibalizing** their core metric (merge velocity, alert volume, model downloads) in favor of **blocking silent inheritance**.  
2. **Owning human re-review** as a product center—not a notification.  
3. **Unifying packages and models** under one decision lifecycle with propose-only AI.  
4. **Accepting** that Activity is a projection of decisions, not the product.

Incumbents optimize **discovery and remediation**. Securist optimizes **permission under drift**. That is a different P&L and a different trust model.

---

## 5. The business model

### Who is who

| Role | Who |
|------|-----|
| **Economic buyer** | Security or platform eng lead (or CTO in smaller orgs) who owns allow/deny into real environments |
| **Daily user** | Same lead + small set of reviewers who close re-reviews and attach validation summaries |
| **Champion** | Engineer burned by stale allowlist or silent version drift; not a compliance tourist |

**Not buyer first:** pure GRC, board AI-governance theater, or AppSec measured only on CVE burn-down.

### What we price on (hypothesis)

**Price unit:** active **governed artifacts** (non-terminal decisions in org scope) + **reviewer capacity** for humans who close re-reviews.

**Do not price primarily on:** Activity views, raw API/scout calls, or all-employee seats.

Falsifiable packaging claim: *If partners will not accept artifact+reviewer metering as the bill shape, the business model thesis fails—even if they like the UI.*

### What makes renewal obvious (measurable outcomes)

Renewal is obvious when the buyer can show, without a slide deck:

1. **N stale approvals prevented** (material change opened `review_required` instead of silent continue).  
2. **Median time-to-re-review** after material change is known and improving.  
3. **Local validation** is attached to decisions that matter (share-safe), not “we think we ran it.”  

**Not renewal metrics:** MAU on feed, scout call counts, number of Eve chats.

No ARR targets here. The founder commitment is: **no Series-narrative pricing fiction before design-partner willingness-to-pay conversations.**

---

## 6. Strategic risks

### What makes this a feature, not a company

| Path to feature | How we die into someone else’s roadmap |
|-----------------|----------------------------------------|
| Compete on CVE coverage | Become “Snyk lite” |
| Optimize for feed engagement | Become “security Twitter” |
| Ship Eve as the product | Become “agent wrapper” with liability |
| Export-only to Jira with no SoR | Become a ticket formatter |
| Horizontal “govern everything” | Become unfocused GRC |

### Customer behavior that falsifies the thesis

From wedge research, hardened for founders:

- Decisions are fully automated from scan scores with **no** re-review culture.  
- Engineering will not open a profile; **Jira must be the only SoR**.  
- Pain is **only** CVE backlog volume.  
- **No** shareable local validation will ever be attached.  
- Buyer is **only** compliance; engineering refuses ownership.  
- They demand **all of open source / all models** on day one.  
- Success is defined as **feed DAU**.

Any one of these sustained across design partners → **kill or radically revise** the company thesis—not “add AI.”

### What we refuse to build even if asked

1. Autonomous production external writes (PRs, deploys) without human + policy gates.  
2. Silent approval inheritance across versions.  
3. Whole-internet crawl as the product core.  
4. “Better Dependabot/SCA” vulnerability database race.  
5. Enterprise GRC checkbox packs as the wedge.  
6. Unbounded agent tool use on private customer data.  
7. Treating seed/demo data as LIVE org decisions.  
8. Billing meters that reward feed addiction.

### Where AI automation creates unacceptable risk

| AI use | Allowed | Forbidden |
|--------|---------|-----------|
| Propose evidence candidates, drafts, explanations | Yes, labeled, observed-at-most | Elevating to approved/verified without humans |
| Draft validation plans / contribution text | Yes, draft-only | Executing private data plans by default |
| Auto-merge or auto-open customer PRs | Never without explicit policy + human | “Agentic DevOps” as default |
| Decision authority | Never | Any path where the model is the approver |

**Founder rule:** AI increases the rate of *candidates*; humans and deterministic policy own *decisions*. Violating that turns Securist into a liability product.

---

## 7. The 90-day founder plan

Parallel tracks already exist: **WO-005** (durable Postgres, human ops) and **WO-004** (interviews). This section is the **founder focus**, not a replacement checklist for provision.

### A. Five design-partner conversations (days 1–45)

- Run [`DESIGN-PARTNER-INTERVIEW-KIT.md`](./DESIGN-PARTNER-INTERVIEW-KIT.md) with ICP-1 only.  
- Target: **5 completed scored interviews**.  
- Output: confirm / revise / kill on wedge; if confirm, human records ICP in [`DECISIONS.md`](./DECISIONS.md).

### B. One proof-of-value workflow (days 15–60)

**Name:** *Stale-approval kill.*  

For each design partner (or internal dogfood):

1. Import or profile **10–30** real security-relevant GitHub artifacts they already use.  
2. Record **one** scoped decision bound to a version + policy.  
3. Simulate or observe a **material change** (new digest/tag).  
4. Show **forced `review_required`** and close re-review with optional validation summary.  

**PoV is not:** a prettier catalog page.

### C. One public authority motion (days 1–90)

Ship and promote **honest public Artifact Profiles** for a **curated allowlist** of security packages (and later models)—with strict LIVE/SEED labeling—so the *category language* spreads without claiming private org telemetry.

**Authority motion is not:** a viral feed or unscoped scout spam.

### D. One measurable success threshold before more product surface

**Before building** allowlisted mass change detection, paid packaging UI, or Eve enablement beyond propose-only:

| Threshold | Bar |
|-----------|-----|
| Interviews | ≥5 scored; **≥3 confirm** on wedge sharpness test |
| PoV | ≥2 partners (or one partner + serious dogfood) complete *stale-approval kill* end-to-end |
| Outcome | Partner can state **time-to-re-review** or **stale approval avoided** in their own words |
| Infra | RM-003 either done or explicitly deferred with memory/seed still honest |

**If the bar is missed:** do not expand surface; revise ICP or kill thesis.

### E. Founder weekly cadence (90 days)

| Week focus | Question |
|------------|----------|
| 1–2 | Recruit interviews; freeze “not building” list publicly in this doc |
| 3–6 | Run interviews; start one PoV |
| 7–10 | Finish five interviews; second PoV; public profile authority |
| 11–13 | Decision: **double down / revise / stop**; only then open product WOs for Stage 2 |

---

## What Securist is not (final refusal list)

| Not this | Because |
|----------|---------|
| Security content feed | Compounds attention, not decisions |
| Package/model marketplace | Competes with GitHub/HF distribution |
| Generic AI agent company | Liability without decision SoR |
| Scanner / SCA vendor | Wrong job; commoditizing |
| GRC checkbox suite | Wrong buyer for Stage 1 |
| Wrapper UI on one vendor | No proprietary decision history |

---

## Document control

- Complements—does not replace—[`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) (GTM research) or [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md) (launch history).  
- Product law remains [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) and [`DECISIONS.md`](./DECISIONS.md).  
- After WO-004 interviews, **accept or reject** this thesis in `DECISIONS.md` with a dated entry—do not leave it as eternal aspiration.
