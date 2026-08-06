# Securist V1: Start a Decision

**Status:** Build specification (implementation not started)  
**Date:** 2026-08-06  
**Locked company sentence:** *Securist is the chain of custody for permission and authorized defensive work under change.*  
**External lead (not “AI SecOps”):** *Permission for code and models — know what engineers and agents may use, what was tested, and what must be reconsidered.*  
**Power layer (later):** *Securist Verify — authorized validation with a chain of custody.*

**Related:** [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) · [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`RELEASE-PLAN.md`](./RELEASE-PLAN.md) · [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md)

This is the **only** product surface worth building next. Not a strategy memo. Not Verify. Not MCP implementation. Not more research dashboards.

---

## 1. Product in one paragraph

A security or platform lead can **start an adoption decision** for a GitHub (or later HF) artifact under a named intended use and deployment boundary, see a **Decision Brief** (evidence + policy + validation plan), record a **human** decision bound to a version and scope, and understand that material change will force **re-review**. Public research remains supporting acquisition and evidence—not the product.

**Aha moment (later, post-connect):**  
*“Here are the dependencies in this repo that we are already trusting, but have never actually approved.”*  
V1 below does **not** require GitHub App yet; it establishes the conversion path and Decision Brief framing first.

---

## 2. In scope (this build only)

| Item | Requirement |
|------|-------------|
| Homepage rewrite | Decision-product story; primary CTA **Start a decision**; secondary **View a sample Decision Brief** |
| `/assess` | Structured intake form |
| Sample Decision Brief | One shareable path that demonstrates the product (existing artifact profile or dedicated sample) |
| Profile CTA | On Artifact Profile: **Start a decision for this artifact** |
| Navigation | Collapse Activity / Models / Packages / Links / Scout under **Research** (supporting) |
| Pre-R1 / post-R1 behavior | Explicit honesty; no fake private workspace pre-R1 |
| Future MCP contract | Spec only (read / draft / request validation — never approve or exploit) |

---

## 3. Out of scope (do not build in this V1)

- GitHub App / lockfile import / workspace signup  
- Securist Verify / agent execution / “AI red team”  
- MCP server implementation  
- New feeds, taxonomies, Eve UI, autonomous PRs  
- Services nav productization (still gated: R1 + WO-004 + two paid engagements)  
- Customer-private data into memory/SEED  
- Quantum / hardware / multi-cloud as separate products  

---

## 4. Routes and page intent

| Route | Intent |
|-------|--------|
| `/` | Product landing: job, primary + secondary CTAs, one-line how it works, link into Research |
| `/assess` | Intake: artifact URL, intended use, deployment boundary, contact/workspace identity |
| `/artifacts/:id` | **Decision Brief** (shareable profile): purpose, boundary, evidence coverage, policy, decision status, what changed, CTA to start decision |
| Existing research routes | Remain; not primary conversion. Group under Research in chrome |
| `/services` | Keep as optional concierge “get help completing a decision” if already present—do not expand into MSSP menu |

---

## 5. Homepage rewrite (content contract)

### Hero

- **Headline:** Permission for code and models.  
- **Subhead:** Know what your engineers and agents may use, what was tested, and what must be reconsidered when artifacts change.  
- **Primary button:** Start a decision → `/assess`  
- **Secondary button:** View a sample Decision Brief → chosen sample artifact URL  

### Supporting (short)

1. Define artifact + boundary  
2. Capture evidence and policy  
3. Human decides (approve / conditional / pause)  
4. Drift forces re-review  

### Explicit demotion

- No “Catalog console” framing  
- No pulse/ops theater as the first thing buyers see  
- Research link: “Explore public research” (not the primary path)

---

## 6. `/assess` intake

### Fields

| Field | Type | Notes |
|-------|------|--------|
| Artifact URL | string | GitHub repo preferred; HF model URL accepted and labeled “same graph later” if needed |
| Intended use | short text | Required |
| Deployment boundary | enum | `local_only` \| `controlled_cloud` \| `external_service` (match Decision Graph) |
| Environment | enum | research \| development \| staging \| production |
| Contact email | string | For pre-R1 founder-led path |
| Optional notes | text | |

### Pre-R1 behavior (mandatory honesty)

- Submit **does not** create a private durable tenant decision.  
- UI copy: *“Pre-R1: this is a founder-led intake. We will not store customer-private decisions in demo memory. You will be contacted at the email you provide.”*  
- Server action: validate input, reject secrets/paths (same redaction posture as ingest), email or ledger contact to `ops@secur.ist` / existing ops path—**no** pretend workspace.  
- Optional: if URL maps to a **public** catalog artifact, deep-link “View public Decision Brief” without implying org approval.

### Post-R1 behavior (specify now, implement when R1 live)

- Same form creates `decision draft` in tenant workspace.  
- Assign human reviewer.  
- Attach evidence / validation later.  
- Decision binds to version + policy + scope.  
- Material change → `review_required`.

---

## 7. Artifact Profile = Decision Brief

### CTA

**Start a decision for this artifact** → `/assess?artifact=<id>` (pre-fill URL from canonical URL).

### Content framing (copy only where needed)

- Lead with decision status, boundary, policy, evidence gaps, what changed.  
- Public research signals are **evidence inputs**, not the product title.  
- Keep LIVE / SEED honesty.

### Sample Decision Brief

- Pick one well-known **public** security-relevant package already in seed/catalog.  
- Homepage secondary CTA links to it.  
- Must read as a **decision** document, not a package directory card.

---

## 8. Navigation

### Primary (product)

- Start a decision (→ `/assess` or home CTA)  
- Decision Briefs / Profiles (→ `/artifacts`)  

### Supporting: single group **Research**

- Activity / Sources  
- Scout / Operator  
- Models  
- Packages  
- Links  
- Cases / Security as needed  

### Not primary

- Services (secondary: help completing a decision)  
- Ops board / pulse as conversion UI  

Exact IA implementation: one Research dropdown or secondary nav row—minimize Discover/Build/Field theater for buyers.

---

## 9. Pre-R1 vs post-R1 matrix

| Capability | Pre-R1 | Post-R1 |
|------------|--------|---------|
| Homepage + CTAs | Ship | Ship |
| `/assess` form | Ship (founder-led) | Ship (durable draft) |
| Private decision record | **No** | Yes |
| Customer-private evidence in memory/SEED | **Forbidden** | N/A (use Postgres tenant) |
| Sample public Decision Brief | Ship | Ship |
| GitHub connect / lockfile import | No | Later WO |
| MCP | Contract only | Later WO |
| Verify / agent runs | No | Later WO |

---

## 10. Future MCP contract (spec only — do not implement in this V1)

Safe tools (server-enforced identity, tenant, audit):

| Tool | Behavior |
|------|----------|
| `get_decision_brief` | Read current decision, version binding, boundary, evidence gaps |
| `list_review_required` | List drifted decisions needing humans |
| `create_decision_draft` | Draft only; explicit user invocation |
| `request_validation_run` | Creates scoped request; never self-authorizes |
| `submit_validation_summary` | Minimized signed evidence from local execution |

**Never expose as generic remote tools:** scan arbitrary target, exploit, exfiltrate, open PR, approve artifact.

---

## 11. Company layers (for copy consistency)

| Layer | User value | When |
|-------|------------|------|
| Research | Find/understand code & models | Public, now |
| Decision Graph | What is permitted, where, why | Product V1 |
| MCP | Permission check in IDE/agents | After Decision Briefs work |
| Securist Verify | Bounded local defensive validation | After adoption loop trusted |
| Adoption Assurance | Bootstrap first decisions (high-touch) | Interview/PoV; nav gated |

---

## 12. Acceptance criteria (implementation WO)

- [ ] `/` no longer frames as catalog console; CTAs match §5  
- [ ] `/assess` exists with fields in §6 and pre-R1 honesty copy  
- [ ] Artifact Profile has **Start a decision for this artifact**  
- [ ] Sample Decision Brief linked from home  
- [ ] Research navigation group demotes secondary surfaces  
- [ ] No new durable private customer data path pre-R1  
- [ ] Typecheck, lint, lifecycle, build green  
- [ ] No Eve/Verify/MCP implementation in this WO  

---

## 13. Implementation gate

**Do not start implementation until a human reopens product scope** (D-009), preferably with:

- WO-008 R1 progress **or** explicit accept of pre-R1 founder-led-only assess, and  
- WO-004 progress (or explicit founder override)

When unblocked: one work order, one PR, Codex adversarial review (scope, contracts, tenant safety, tests, release impact).

---

## 14. Non-goals reminder

Stop producing strategy memos. This document is the handoff. Next code change is this V1—or nothing.
