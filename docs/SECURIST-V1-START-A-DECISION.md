# Securist V1: Start a Decision

**Status:** Build specification · **WO-010 implementation**  
**Date:** 2026-08-06  
**Locked company sentence:** *Securist is the chain of custody for permission and authorized defensive work under change.*  
**External lead (not “AI SecOps”):** *Permission for code and models — know what engineers and agents may use, what was tested, and what must be reconsidered.*  
**Power layer (later):** *Securist Verify — authorized validation with a chain of custody.*

**Related:** [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) · [`SYSTEM-MODEL.md`](./SYSTEM-MODEL.md) · [`RELEASE-PLAN.md`](./RELEASE-PLAN.md) · [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) · [`WO-010`](../ops/work-orders/WO-010-v1-start-a-decision.md)

This is the **only** product surface for WO-010. Not a strategy memo. Not Verify. Not MCP implementation. Not more research dashboards. **Founder-led intake is not the product**—Securist must provide **immediate automated value**.

---

## 1. Product in one paragraph

A visitor pastes a **public GitHub repository URL**, states intended use / environment / deployment boundary, and receives an **immediate share-safe Decision Brief** built from deterministically collected public API facts. Observed facts, unknowns, evidence gaps, and SEED/LIVE state are labeled. No email is required for value. No customer-private persistence before R1. Copy/download of a local draft is allowed; “Save and monitor” is the future paid hinge. Catalog profiles remain Decision Briefs with a **Start a decision for this artifact** CTA. Public research remains supporting—not the hero product.

**Aha moment (later, post-connect):**  
*“Here are the dependencies in this repo that we are already trusting, but have never actually approved.”*  
V1 below does **not** require GitHub App yet; it establishes automated assess → Decision Brief first.

---

## 2. In scope (this build only)

| Item | Requirement |
|------|-------------|
| Homepage rewrite | Headline **Permission for code and models.**; primary **Assess a repository**; secondary **View a sample Decision Brief** |
| `/assess` | Public GitHub URL + intended use + environment + boundary; immediate LIVE brief; no email |
| Sample Decision Brief | Shareable seed profile (`art-scout-daemon`) |
| Profile CTA | On Decision Brief: **Start a decision for this artifact** |
| Navigation | Primary Assess / Decision Briefs; Research groups Activity, Models, Packages, Scout, Links; Services secondary |
| Pre-R1 honesty | Ephemeral only; no private durable store; no vuln claims from narrative; not a pentest |
| System graph | Register assess paths; one owner; Decision Graph remains canonical; Postgres not production-active |

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
- **Primary button:** Assess a repository → `/assess`  
- **Secondary button:** View a sample Decision Brief → seed artifact profile  

### Supporting (short)

1. Assess (public repo URL + intended boundary)  
2. Evidence (observed public facts · explicit gaps)  
3. Human decision (approve / conditional / pause — durable post-R1)  
4. Re-review (material change forces re-open)  

### Explicit demotion

- Research is supporting evidence, not the hero product  
- No “Catalog console” framing  
- No pulse/ops theater as the first conversion path  

---

## 6. `/assess` (automated public assess)

### Fields (no email)

| Field | Type | Notes |
|-------|------|--------|
| Public GitHub repository URL | string | Required; reject private, secrets, local paths, non-GitHub |
| Intended use | short text | Required |
| Environment | enum | research \| development \| staging \| production |
| Deployment boundary | enum | `local_only` \| `controlled_cloud` \| `external_service` |

### Immediate result (mandatory)

- Deterministically collect **public** repository facts (GitHub API).  
- Produce a share-safe **Decision Brief** immediately.  
- Label observed facts, unknowns, evidence gaps, and LIVE state.  
- Never claim a vulnerability merely from model narrative.  
- Never imply a pentest occurred.  
- **No customer-private persistence** before R1 (`durable: false`, `persistence: ephemeral_client_only`).  
- Allow copy/download of a local decision draft JSON.  
- “Save and monitor” may be shown **disabled** as the future paid persistence hinge.

### Rejection rules

- Private URLs / private GitHub repos  
- Secrets, local paths, unsupported providers (GitLab, Bitbucket, HF, npm as repo URL)  

### Post-R1 behavior (specify now, implement when R1 live)

- “Save and monitor” creates a durable tenant decision draft.  
- Assign human reviewer; bind version + policy + scope.  
- Material change → `review_required`.  

---

## 7. Artifact Profile = Decision Brief

### CTA

**Start a decision for this artifact** → `/assess?artifact=<id>&url=<canonicalUrl>`.

### Content framing

- Frame page as **Decision Brief**.  
- Lead with status, intended boundary, version/policy binding, evidence gaps, what would trigger re-review.  
- Public research signals are **evidence inputs**, not the product title.  
- Keep LIVE / SEED honesty.

### Sample Decision Brief

- Seed profile: `art-scout-daemon`.  
- Homepage secondary CTA links to it.

---

## 8. Navigation

### Primary (product)

- Assess (→ `/assess`)  
- Decision Briefs (→ `/artifacts`)  

### Supporting: **Research**

- Activity · Models · Packages · Scout · Links  

### Secondary

- Services · Security · Cases  

---

## 9. Pre-R1 vs post-R1 matrix

| Capability | Pre-R1 | Post-R1 |
|------------|--------|---------|
| Homepage + CTAs | Ship | Ship |
| `/assess` automated public brief | Ship (ephemeral) | Ship + durable save |
| Private decision record | **No** | Yes |
| Customer-private evidence in memory/SEED | **Forbidden** | N/A (use Postgres tenant) |
| Sample public Decision Brief | Ship | Ship |
| GitHub connect / lockfile import | No | Later WO |
| MCP | Not in WO-010 | WO-012 local `assess .` |
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
