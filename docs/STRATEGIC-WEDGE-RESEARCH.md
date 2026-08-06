# Strategic wedge research — Securist Decision Graph

**Work order:** [WO-003](../ops/work-orders/WO-003-strategic-wedge-research.md)  
**Status:** Research hypothesis for design partners — **not** a validated GTM plan  
**Date:** 2026-08-05 (deep dive rev.)  
**Authority context:** Decision Graph is canonical ([`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md)); Activity is a projection; AI proposes only ([`DECISIONS.md`](./DECISIONS.md)). Launch thesis: [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md).

### Thesis (product, not market size)

Securist is the **decision system** for adopting, validating, governing, and safely contributing to security-relevant **code and models**. The compounding asset is a **version-bound Decision Graph** (artifact → evidence → policy evaluation → scoped decision → material change → re-review), not a content feed or alert stream.

This document cites **primary or first-party sources** for what alternatives *are and do*. It does **not** invent TAM/SAM statistics, win rates, or spend figures.

**Jobs-to-be-done framing:** Customers “hire” products to get a job done under specific circumstances ([Christensen Institute — Jobs to Be Done theory](https://www.christenseninstitute.org/theory/jobs-to-be-done/); [HBR — “Know Your Customers’ Jobs to Be Done”](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)). Securist’s hire is **adoption governance under change**, not **vulnerability discovery**.

---

## 1. First buyer and paid job-to-be-done

### Paid JTBD (hypothesis)

> **Should we adopt this artifact, under what policy and boundary, what did we validate locally, and what changed after approval?**

Decomposed into durable graph operations already specified in Securist contracts:

| JTBD fragment | Graph / product meaning |
|---------------|-------------------------|
| Should we adopt? | Decision status for a scope (env, data class, boundary, intended use) |
| Under what policy and boundary? | Policy version + evaluation + `DecisionScope` |
| What did we validate locally? | Minimized, signed validation summary / evidence — not raw private data on hub |
| What changed after approval? | Material change → forced `review_required`; no silent version inherit |

This matches the V1 north-star test: open one Artifact Profile and answer use / boundary / change / validation / next contribution in minutes ([`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md)).

### Forces of progress (qualitative, for interviews)

Use as interview probes—not as claimed market facts:

| Force | Example language to listen for |
|-------|--------------------------------|
| **Push** (status quo pain) | “Our approved-tools wiki is fiction”; “We approved v1.2; nobody re-checked v1.4” |
| **Pull** (new solution) | “I want one place that says *still allowed under policy X*” |
| **Anxiety** | “Another dashboard”; “Will legal/compliance own it and freeze engineering?” |
| **Habit** | “We just leave Dependabot open” / “Security reviews in Linear forever” |

### First buyer (role, not company logo)

**Buyer:** a **security or platform engineering lead** who owns *what* may enter development or production (dependencies, security tools, or security-domain models), and who is accountable when an approved thing drifts.

**User:** the same lead plus a small set of reviewers/operators who attach local validation evidence and close re-reviews.

**Economic buyer test (design partner):** Can they spend without a six-month RFP? Prefer teams where platform/security eng has budget or founder/CTO sponsorship.

**Not the first buyer:** feed consumers, casual scouts, pure compliance auditors without engineering ownership of adoption, or AppSec teams measured only on CVE backlog burn-down.

---

## 2. Closest alternatives teams use today

Alternatives below are described from **vendor/docs primary sources**. They solve adjacent problems well. None is claimed to “lose” to Securist on price or breadth—only positioned relative to the JTBD above.

### 2.1 GitHub-native workflows

| Capability | What it is (primary source) | Fit to Securist JTBD |
|------------|-----------------------------|----------------------|
| **Dependabot alerts / security updates** | Scans the dependency graph; alerts when GitHub Advisory Database entries affect the repo; can open PRs for security updates ([Dependabot alerts](https://docs.github.com/code-security/dependabot/dependabot-alerts/about-dependabot-alerts); [security updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates)) | Strong on **known vulnerability discovery and fix PRs** for dependencies **in a repo**. Weak as a **cross-artifact org decision ledger** with policy version, local validation, and re-review after material non-CVE change. |
| **GitHub Advisory Database** | Curated vulnerability advisories used by Dependabot ([GitHub Advisory Database](https://github.com/advisories)) | Input **evidence source**, not an adoption decision record. |
| **Dependency review** | Understands dependency changes in a PR; Action can fail PRs that introduce vulnerable versions or invalid licenses ([About dependency review](https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review); [actions/dependency-review-action](https://github.com/actions/dependency-review-action)) | Excellent **merge-time gate** for a **single repository’s lockfile**. Not ongoing **version-bound approval** of packages/models as **org-level assets** across repos and runtimes. |

**Honest read:** Teams already “do supply chain” in GitHub for **in-repo dependency risk**. They still use tickets/spreadsheets for “are we allowed to use X in production for use-case Y?”

### 2.2 Software supply-chain / security platforms

| Capability | What it is (primary source) | Fit to Securist JTBD |
|------------|-----------------------------|----------------------|
| **SCA (e.g. Snyk Open Source)** | Developer-first SCA: find, prioritize, and fix vulnerabilities and license issues in open-source libraries across the SDLC ([Snyk Open Source docs](https://docs.snyk.io/scan-fix-and-prevent/scan-with-snyk/snyk-open-source); [product overview](https://snyk.io/product/open-source-security-management/)) | Excellent at **vuln/license inventory and remediation**. Not a **decision graph** binding policy version + local validation + re-open on material non-vuln change. |
| **OpenSSF Scorecard** | Automated heuristics so maintainers improve practices and consumers judge whether dependencies are safe ([ossf/scorecard](https://github.com/ossf/scorecard); [scorecard.dev](https://scorecard.dev/); [check docs](https://github.com/ossf/scorecard/blob/main/docs/checks.md)) | Strong **public repo health signal** (evidence input). Not org-scoped approvals or local validation records. |
| **SLSA** | Supply-chain Levels for Software Artifacts — integrity/provenance framework for producers and consumers ([slsa.dev](https://slsa.dev/); [OpenSSF SLSA](https://openssf.org/projects/slsa/)) | Shared **vocabulary and levels** for trustworthiness of builds/artifacts. Complements Securist evidence; does not replace **tenant decisions** or **re-review workflow**. |
| **Hardened images / provenance distribution (e.g. Chainguard)** | First-party positioning: images with SBOMs, signatures, SLSA-oriented provenance ([Chainguard provenance/directory messaging](https://www.chainguard.dev/unchained/new-year-new-image-introducing-the-chainguard-images-directory); [supply-chain buyers guide](https://www.chainguard.dev/supply-chain-security-101/buyers-guide-software-supply-chain-security-tools)) | Solves **consume trustworthy base artifacts**. Different job from **org decision that a third-party tool/model is allowed under policy + local proof**. |
| **Malware / behavior-focused supply chain (e.g. Socket)** | Positions as blocking malicious packages and zero-day supply-chain attacks via package behavior analysis ([socket.dev](https://socket.dev/)) | Strong on **malicious package detection**. Different job from “approved under policy + local proof + re-review.” |

**Honest read:** SCA/Scorecard/SLSA/Socket/hardened images are **detection, scoring, integrity, and distribution** layers. Securist’s paid job is **governed adoption state over time**.

### 2.3 AI / model governance tools and documentation norms

| Capability | What it is (primary source) | Fit to Securist JTBD |
|------------|-----------------------------|----------------------|
| **Model cards (research origin)** | Short documents with intended use, evaluation, and limitations for trained models ([Mitchell et al., arXiv:1810.03993](https://arxiv.org/abs/1810.03993)) | **Documentation pattern**, not an org decision + re-review system. |
| **Hugging Face Model Cards** | Hub-native Markdown/metadata cards for models ([HF Hub — Model Cards](https://huggingface.co/docs/hub/en/model-cards); [Guidebook](https://huggingface.co/docs/hub/en/model-card-guidebook)) | Upstream **publisher documentation**. Securist can treat card/license/digest drift as **evidence/change events**, not replace HF. |
| **NIST AI RMF** | Voluntary framework to incorporate trustworthiness into AI design, development, use, and evaluation ([NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework); [AI RMF 1.0](https://doi.org/10.6028/NIST.AI.100-1); [Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1)) | **Governance vocabulary** (Map/Measure/Manage/Govern). Org still needs a system of record for **artifact-level decisions** and evidence. |

**Honest read:** Model governance today is often **docs + framework language + platform hosting**. The gap is **version-bound decisions** that survive model/package updates without silent trust inheritance—the same invariant Securist enforces for code artifacts ([`DECISION-LIFECYCLE.md`](./DECISION-LIFECYCLE.md)).

### 2.4 Program maturity frameworks (context, not competitors)

| Framework | What it is | Relation |
|-----------|------------|----------|
| **OWASP SAMM** | Open maturity model for software security practices across Governance, Design, Implementation, Verification, Operations ([OWASP SAMM](https://owasp.org/www-project-samm/); [model](https://owaspsamm.org/model/)) | Helps orgs **plan security programs**. Securist can be one **operational system** inside Verification/Operations-style practices—not a SAMM replacement. |

### 2.5 Internal spreadsheets, tickets, and wikis

No single primary “product” source. Observable practice: architecture decision records (ADRs), Jira/Linear tickets, Notion/Confluence “approved tools” lists, and spreadsheet inventories.

| Strength | Weakness vs JTBD |
|----------|------------------|
| Flexible, free, already in the workflow | Rarely **version-bound**; approvals **silently age**; weak link from **local validation** to **public change detection**; poor multi-artifact re-review when digests/licenses/cards drift |

**Honest read:** This is the true incumbent for the **decision** job. SCA/GitHub are incumbents for the **alert** job.

### 2.6 Competitive map (jobs, not logos)

```text
                    Discovery / alerts          Integrity / provenance
                   (Dependabot, SCA,            (SLSA, Scorecard,
                    Socket, GH advisories)       signed images)
                              \                    /
                               \                  /
                                v                v
                         Evidence inputs ──► [Securist Decision Graph]
                              JTBD: adopt / bound / validate / re-review
                                              ▲
                                              │
                                    Incumbent: tickets + wikis
```

Securist **integrates** left/top as evidence; it **displaces** only the fragile middle (stale allowlists), not the scanners.

---

## 3. The wedge

### 3.1 Where Securist is distinct (by design)

From Securist system model and contracts (not marketing):

1. **Decision Graph is source of truth**; Activity is a **projection** ([`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md)).  
2. **Approvals bind to one artifact version + policy version + scope + evidence set**; later versions do not inherit silently ([`DECISIONS.md`](./DECISIONS.md) D-007; [`CANONICAL-CONTRACTS.md`](./CANONICAL-CONTRACTS.md)).  
3. **Material change forces re-review** (`review_required`) rather than quiet “still approved.”  
4. **Local / operator evidence is minimized and share-safe**; private paths/secrets rejected at boundary.  
5. **AI/Eve proposes only**—never authoritative durable decisions ([`DECISIONS.md`](./DECISIONS.md) D-004).  
6. **Same graph shape for code and models** (artifact kinds include package/repo and model), so dual-forge (GitHub + Hugging Face) is one decision system, not two tools.

### 3.2 Where Securist is *not* distinct (do not claim otherwise)

| Area | Who already owns it |
|------|---------------------|
| CVE/advisory scanning at scale | Dependabot, SCA vendors, advisory DBs |
| Malware/behavior package analysis | Socket-class tools |
| Public repo security hygiene scores | OpenSSF Scorecard |
| Build integrity levels | SLSA |
| Hardened base images / signed distribution | Chainguard-class image vendors |
| Upstream model documentation | HF model cards; Mitchell-style cards |
| Enterprise vulnerability backlog UX | Mature AppSec platforms |
| Org security maturity roadmaps | OWASP SAMM-class programs |

Claiming “better Dependabot” or “replace Snyk” is a **wedge mistake**. The wedge is **governed adoption and re-review**, with scanners as **evidence inputs**.

### 3.3 First artifact class to dominate

**Primary:** **Security-relevant open-source packages and repositories** that a team might adopt as *tools or dependencies* (scanners, SDKs, CLIs, policy engines)—tracked as Decision Graph artifacts with public GitHub provenance.

**Why first:**

- V1 and flywheel already centered on packages + public GitHub scout paths ([`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md)).  
- Change detection (version/digest/license) maps cleanly to existing lifecycle triggers.  
- Buyers already feel pain from “Dependabot said fix; security said wait; platform said approved last year.”  

**Seed examples (catalog, not endorsements):** scout-style CLIs, GeoIP bridges, security NLP model *references*—as **profiled artifacts**, not as Securist claiming compliance.

**Adjacent same-graph (not first paid concentration):** security-domain **models** on Hugging Face (model card + license + digest drift), using the same decision lifecycle so dual-forge stays coherent without a second product.

**Explicit non-first classes:** general application codebases, cloud posture (CSPM), identity/IAM platforms, full MLOps experiment tracking, container base-image marketplaces.

### 3.4 Wedge sharpness test

The wedge is sharp if a design partner agrees with **all three**:

1. Alerts exist and are **insufficient** for “still allowed.”  
2. Approvals today are **not** bound to version + policy + scope.  
3. They will **pay** for fewer stale approvals / faster re-review—not for more alerts.

If any fails, revise ICP or pause paid packaging.

---

## 4. ICP recommendation

### Choose one first segment

**ICP-1 (pursue):**  
**Small-to-mid product engineering orgs (≈ security + platform eng ownership) that already pull open-source security tooling and/or security-domain models**, need a **shared, version-bound allowlist**, and will pay to reduce **stale approvals** and **review thrash**—not to buy another CVE dashboard.

Typical signals (qualitative, for interviews—not market counts):

- Maintain an “approved tools” list that is **out of date**.  
- Mix of GitHub Dependabot/SCA **alerts** and human **exceptions**.  
- Evaluating or already using HF models for security/CTI language tasks with unclear license/boundary.  
- Willing to run **local validation** and attach a **minimized summary**.  
- Can pilot with **10–50 governed artifacts**, not “all of npm.”

### Reject two tempting broader segments (for now)

| Reject | Why tempting | Why reject now |
|--------|--------------|----------------|
| **ICP-R1: Large enterprise GRC / audit-first buyers** | Budget, “AI governance” RFPs, NIST/ISO language | Will demand compliance theater, multi-year SSO/legal, and controls Securist must not fake; dilutes engineering JTBD; slow design-partner loops |
| **ICP-R2: Horizontal “all open source + all AI models for everyone” platforms** | Huge surface, dual-forge story | Competes with SCA + HF + GitHub on their terms; no sharp artifact class; pricing and success metrics dissolve into “feed” |

### Design-partner profile (concrete)

Prefer 3–8 partners with:

- Security or platform eng owner who can **meet weekly for 30–45 minutes**  
- Existing GitHub org + at least one SCA or Dependabot habit  
- At least five real “we use this tool/model” decisions in the last year  
- No requirement that Securist must be SOC2 Type II **before** a pilot (that can be later)

---

## 5. Pricing hypothesis

**Charge for:**

1. **Active governed artifacts** — artifacts with a non-terminal decision in an org scope (watching / conditional / approved / review_required / paused), not every seed catalog row.  
2. **Review workflows** — seats or capacity for humans who close re-reviews, attach validation evidence, and authorize external writes—not for anonymous feed viewers.

**Do not charge primarily for:**

| Anti-meter | Why |
|------------|-----|
| Feed / Activity views | Activity is a **projection**; metering it trains the wrong product |
| Raw API / scout calls | Encourages crawl theater; public scout should stay cheap or free for flywheel |
| Generic “platform seats” for all engineers | Dilutes buyer = owner of adoption decisions |

**Packaging sketch (hypothesis only):** Free public profiles + seed; paid **org workspace** with durable decisions (post RM-003), watchlists, re-review queue, and operator evidence. Exact numbers **withheld** until design-partner willingness-to-pay conversations—**no invented ARPU**.

**Value metric language for interviews:** “Per artifact you actively govern + reviewers who close re-reviews”—ask them to react; do not quote a dollar amount first.

---

## 6. Design-partner interview questions and disconfirming signals

Full facilitator kit: [`DESIGN-PARTNER-INTERVIEW-KIT.md`](./DESIGN-PARTNER-INTERVIEW-KIT.md).

### Five core questions

1. **Show me the last three security-related packages or models you allowed into a real environment.** Where is that decision recorded today (ticket, wiki, chat, memory)?  
2. **When a new version or digest appears, who notices, and what happens to the old “approval”?**  
3. **What local validation do you already run (or wish you ran) before production use—and what evidence is shareable with a hub?**  
4. **Which tools already fire alerts (Dependabot, SCA, Scorecard, HF card changes)?** Where do those alerts **fail** to answer “are we still allowed to use this under policy X?”  
5. **If a product charged per *actively governed artifact* plus reviewer seats, what would make that obviously worth it vs free docs + Jira?**

### Disconfirming signals (invalidate or heavily revise the wedge)

| Signal | Interpretation |
|--------|----------------|
| Decisions are **fully** automated from SCA score with **no** human re-review culture | Paid review workflow has no owner |
| Teams insist the system of record must be **Jira only** and will not open a profile | Distribution problem; wedge may be “export to ticket” only—not a graph product |
| Pain is **only** CVE backlog volume, not stale allowlists | Compete with SCA; wrong wedge |
| No one will attach **any** local validation summary (even minimized) | Operator evidence path dies; product becomes docs UI |
| Buyer is **only** compliance; engineering refuses to own adoption | ICP-R1; walk away for V1 paid |
| Success metric they want is **pageviews / feed engagement** | Violates Decision Graph-as-asset thesis |
| They need **all of open source** governed on day one | ICP-R2; refuse scope |

### Confirming signals (strengthen the wedge)

| Signal | Interpretation |
|--------|----------------|
| They can name **stale approvals** that would fail an audit or incident review | Clear outcome metric |
| Multiple tools produce alerts; **nobody owns re-approval** | Workflow gap |
| They already run **local** smoke tests and struggle to **record** them share-safely | Operator evidence path |
| Dual-forge pain (package + model) in the **same** review conversation | Same-graph value |

---

## 7. One-page recommendation

| Decision | Recommendation |
|----------|----------------|
| **First customer** | Security or platform engineering lead at a product company that already maintains (or is drowning in) an informal allowlist of **security tools/deps**, and uses GitHub-native + SCA alerts without a version-bound decision ledger. |
| **First artifact class** | **Security-relevant open-source packages/repos** (GitHub). Keep models on the same graph as dual-forge **adjacency**, not the first paid concentration. |
| **First paid workflow** | **Adopt → scoped approve/conditional → watch material change → re-review**, with optional **local validation summary** attachment—durable on Postgres after RM-003. |
| **First measurable outcome** | **Time-to-re-review after material change** and **count of stale approvals avoided** (approvals that would have silently applied to a new version). Secondary: review cycle time for first adoption. *Not* alert volume or DAU on Activity. |
| **What not to build for 12 months** | (1) Whole-internet crawl / non-allowlisted discovery as core product; (2) “Better Dependabot/SCA” vulnerability DB competition; (3) Autonomous external PRs or Eve-as-approver; (4) Generic enterprise GRC suite / audit checkbox packs; (5) Seat-based social feed or content marketplace; (6) Horizontal MLOps (training, experiment tracking, GPU ops); (7) Billing meters on feed views or raw scout API calls; (8) Hardened base-image marketplace. |

### Sequencing (two tracks, both real)

| Track | Owner | Note |
|-------|--------|------|
| **RM-003** | Human | TARX Postgres + migration + three env vars + redeploy — **production durability**, not GTM proof. Checklist: [`RM-003-PROVISION-CHECKLIST.md`](./RM-003-PROVISION-CHECKLIST.md) |
| **WO-003 → design partners** | Grok (research) → human interviews | **Wedge validation** via kit before large surface expansion |
| **Later roadmap** | Shared | Allowlisted change detection, signed operator evidence, Eve proposals — only after ICP confirms JTBD |

---

## Sources (primary / first-party)

| Topic | Source |
|-------|--------|
| JTBD theory | https://www.christenseninstitute.org/theory/jobs-to-be-done/ · https://hbr.org/2016/09/know-your-customers-jobs-to-be-done |
| Dependabot alerts | https://docs.github.com/code-security/dependabot/dependabot-alerts/about-dependabot-alerts |
| Dependabot security updates | https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates |
| Dependency review | https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review · https://github.com/actions/dependency-review-action |
| GitHub Advisory Database | https://github.com/advisories |
| Snyk Open Source | https://docs.snyk.io/scan-fix-and-prevent/scan-with-snyk/snyk-open-source |
| OpenSSF Scorecard | https://github.com/ossf/scorecard · https://scorecard.dev/ |
| SLSA | https://slsa.dev/ · https://openssf.org/projects/slsa/ |
| Socket (positioning) | https://socket.dev/ |
| Chainguard provenance messaging | https://www.chainguard.dev/unchained/new-year-new-image-introducing-the-chainguard-images-directory |
| Model cards (research) | https://arxiv.org/abs/1810.03993 |
| HF Model Cards | https://huggingface.co/docs/hub/en/model-cards |
| NIST AI RMF | https://www.nist.gov/itl/ai-risk-management-framework |
| OWASP SAMM | https://owasp.org/www-project-samm/ · https://owaspsamm.org/model/ |
| Securist system model | [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md), [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md), [`DECISIONS.md`](./DECISIONS.md) |

---

## Document control

- **Does not** replace [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md) launch history.  
- **Does not** authorize product scope expansion, Eve enablement, or autonomous external writes.  
- Founder-level company thesis (category, moat, 90-day plan): [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md).  
- Next proof: design-partner interviews ([`DESIGN-PARTNER-INTERVIEW-KIT.md`](./DESIGN-PARTNER-INTERVIEW-KIT.md)); update this file or append [`DECISIONS.md`](./DECISIONS.md) only when a human accepts or rejects the ICP/wedge.
