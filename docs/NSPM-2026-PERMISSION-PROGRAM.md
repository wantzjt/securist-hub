# August 2026 NSPM — permission program, not hack-back

**Status:** Internal strategy + public-safe framing. **Not legal advice.**  
**Date:** 2026-08-15 · Day 3 of the 60-day procedures clock  
**Owner:** Grok Build (strategy / UX / funnel) ↔ Grok Bot Securist COS (drafts, distribution)  
**Human gates:** any public post · any site page · any claim we get a company into the Program  

**Official sources (cite these, not recaps):**

- Memorandum: [Expanding Capabilities to Combat Transnational Cyber-Enabled Crime](https://www.whitehouse.gov/presidential-actions/2026/08/expanding-capabilities-to-combat-transnational-cyber-enabled-crime/) (August 12, 2026)
- Fact sheet: [President expands capabilities to combat transnational cyber-enabled crime](https://www.whitehouse.gov/fact-sheets/2026/08/fact-sheet-president-donald-j-trump-expands-capabilities-to-combat-transnational-cyber-enabled-crime/)
- Prior EO: [EO 14390](https://www.whitehouse.gov/presidential-actions/2026/03/combating-cybercrime-fraud-and-predatory-schemes-against-american-citizens/) (March 6, 2026)

**Leave-behind:** [`meeting/NSPM-READINESS-BRIEF.md`](./meeting/NSPM-READINESS-BRIEF.md)  
**Non-claims:** [`meeting/NON-PROMISES.md`](./meeting/NON-PROMISES.md)  
**Bot drafts:** `/Users/master/ftw-lab/securist-agent-dogfood/pulse/nspm-growth-drafts.md`

---

## The sentence we own

**The White House did not legalize private hack-back. It created a government-directed permission program.**

Vetted U.S. *Participating Companies* may propose, and only after written Executive Director approval may support, Cyber Surveillance Operations and Cyber Effects Operations against foreign Cyber-Enabled Transnational Criminal Organizations (CE-TCOs) — **exclusively on behalf of, and under the supervision of, the United States Government.**

That is a **permission, evidence, scope, and re-review problem**.

That is Securist’s job.

> Securist tells teams what their humans and coding agents may bring into production — and reopens that permission when reality changes.

For this memo, “production” includes any environment, tool, model, agent, or commercial agreement that could touch a Program package.

**Securist is not an offensive cyber product.** We do not write exploits, run operations, or get anyone into the Program. We are the decision object for companies that must prove *what was allowed, for which use, on whose written authority, and what change reopens it.*

---

## What the memorandum actually does

Read the memo. Do not outsource the facts to law-firm headlines.

| Fact | Source in the memo |
|------|--------------------|
| Signed August 12, 2026 | Header |
| NCC (Homeland Security Task Force) creates and runs the Program | §2(a) |
| Co-Executive Directors: one DOJ (AG), one DHS (Secretary) | §2(a)(i) |
| Operations only after coordination between those directors | §2(a)(i) |
| Action is exclusively on behalf of and under USG supervision | §2(a)(i) |
| Participating Companies contract with DOJ or DHS; rigorous vetting | §2(a)(ii) |
| They may take threat info from other private entities’ *normal business* and from FSLTT agencies — to **propose** operations to the NCC | §2(a)(iii) |
| All Program activity under Constitution, applicable law, **including 18 U.S.C. § 1030 (CFAA)** | §2(b) |
| Operating procedures due **within 60 days** (~October 11, 2026) | §3(a) |
| Bond or escrow **not less than $1 million**, forfeitable on contractual non-compliance | §3(a)(iv) |
| Every operations package needs **written approval and direction** before action | §3(a)(xiv) |
| Exceeding approved parameters (U.S. person, U.S. system, U.S.-controlled system) → **cease, minimize, notify NCC → DOJ** | §3(a)(x) |
| Imminent CI attack or reasonable belief of Critical Outcomes → immediate notify | §3(a)(xi) |
| Critical Outcomes (death / serious injury / use of force or armed attack) **may not be approved** | §2(a)(i), §4(b) |
| Targets: foreign CE-TCOs only — **not** institutional parts of a foreign government | §4(c) |
| Companies may still do *other lawful defensive* operations; Program activity is USG-controlled | §3(a)(xii) |
| Annual continued-participation review | §3(a)(xiii) |
| Disclose all contractual relationships under §2(a)(iii) | §3(a)(iii) |
| First status report in 180 days (~February 8, 2027) | §3(c) |
| No new right or benefit; subject to appropriations | §5 |

Fact-sheet context (for tone, not product claims): 2025 reported consumer losses **$20.8 billion**; ransomware, phishing, fraud, sextortion, impersonation called out as TCO campaigns.

**Open implementation questions (do not pretend we have answers):**

- Procedures are not published yet (clock running).
- Whether companies *execute* operations or only develop / propose / support them is still contested in public legal analysis.
- Liability, indemnification, state-secrets protection, FISA / Fourth Amendment attribution — government contracts work, not Securist work.
- This is **not** a letter of marque and **not** a private right to hack back. Wiley and Mayer Brown both say that in public. We say it louder and operationally.

---

## Why this is our wedge (and not theirs)

The next 60 days will fill with three voices:

| Voice | What they sell | Gap |
|-------|----------------|-----|
| Big Law | Contract risk, indemnification, bonding | No operational permission object |
| Defense / offensive primes | “We can do the effects” | They become the *operator*, not the *authority record* |
| Grifters | “Hack-back is legal now” | False. Dangerous. We exist to kill this sentence. |

Nobody serious is publishing the **decision loop** a GC, CISO, and program lead must run:

```text
1. What entered this environment?          (tool, model, agent, feed, fork)
2. Was it permitted for THIS use?          (this written package, this target class)
3. What evidence supported that?           (vetting, contract, approval, scope)
4. What changed so we must cease / reopen? (digest drift, scope exceed, US person, CI)
```

That is already the Securist product sentence. We do not invent a new category for this memo. We apply the category we already own.

### Two ICPs (do not collapse them)

| ICP | Who | What they need from us | What we never sell them |
|-----|-----|------------------------|-------------------------|
| **A. Tooling / intel / IR firms** (primary, safer, larger) | US companies whose collectors, models, agents, or threat feeds may be *sold or teamed* into a Participating Company | Version-bound permission on the stack; share-safe vs local-only evidence; disclose-ready commercial agreements | Access to the Program |
| **B. Would-be Participating Companies** (secondary, high-touch) | US cyber firms evaluating DOJ/DHS contracts | Readiness brief + four-question operating picture for GC/CISO/program | Offensive capability, “we’ll get you selected,” exploit work |

ICP A is the acquisition beachhead. They have budget *now*, they already match intel-firm meetings, and they do not require us to touch operations.

ICP B is a briefing + design-partner motion until Team Graph is live. We help them **see** the permission problem. We do not become their operational agent.

**Refuse:** anyone asking for unauthorized access, hack-back playbooks, exploit code, or targeting help. Point at the memo: Program activity is USG-directed or it is a crime.

---

## Positioning (locked language)

### Say

- “This is a permission program under USG control.”
- “Written approval is the gate. Scope exceed is a cease-and-notify event.”
- “Stale permission after change is how a $1M bond gets forfeited.”
- “Securist is the decision object: allowed, for this use, on this evidence, reopened on drift.”
- “Public Decision Briefs are ephemeral and share-safe. They are not production permission.”
- “Keep private code local. Pay when the team needs shared memory.”

### Never say

- “We help companies attack foreign systems.”
- “Hack-back is legal now.”
- “Securist is an offensive / red-team / effects platform.”
- “We get you into the White House program.”
- “Team Graph is live.”
- “npx @securist/operator.”
- “This Decision Brief is your written Executive Director approval.”
- Any target, exploit, payload, or operational how-to.

### Category discipline

We stay the **permission system for AI-accelerated software adoption**.  
The memo increases the *cost of being wrong* about permission. It does not change our product.

TARX stays behind the curtain.

---

## Funnel and UX (acquisition)

```text
Attention
  “The August 12 NSPM is not hack-back. It is a permission program.”
        ↓
Brief
  8-minute readiness brief (meeting/NSPM-READINESS-BRIEF.md)
  Official links. Four questions. 60-day clock.
        ↓
Proof of format
  https://secur.ist/assess  → Public Decision Brief on a *public* repo
  Honesty: ephemeral, not production approval, not Program permission
        ↓
Private utility
  https://secur.ist/operator → local-only brief, no source upload
        ↓
Conversation
  Intel / cyber GC + CISO + program lead
  One-pager + NSPM brief + NON-PROMISES
        ↓
Design partner (after Team Graph)
  Shared decisions · owners · policy · re-review
  Paid unit: active governed artifacts + reviewer capacity
```

**North-star for this motion:** time from a material change (new digest, new model card, new teaming agreement, scope-exceed signal) to an accountable re-review — not “ops proposed.”

**Pivotal UX (do not turn this into chat):**

```text
This package was permitted under written approval A-17 for CE-TCO class X.
A dependency digest changed.
A commercial teaming agreement was not disclosed.
This permission is no longer current.
Cease. Minimize. Notify. Re-review.
```

That last block is **illustrative product language**, not a live Team Graph screen. Do not demo it as shipped.

### Site / UX rules

- **Do not** ship `/hack-back`, `/nspm-ops`, or anything that looks like we run effects.
- Optional later WO: a narrow `/briefing/nspm-2026` page that is the readiness brief + official links + `/assess` CTA. Human-approved. Not an announcement.
- Hero of that page if it ships: *Permission under a government-directed program.*
- Default CTAs stay `/assess` and `/operator`.

---

## 60-day content machine (Bot executes, human posts)

Clock start: **2026-08-12**. Procedures due: **~2026-10-11**. Today: **2026-08-15**.

| Window | Bot job (draft only) | Founder job |
|--------|----------------------|-------------|
| Days 1–7 (now) | Own the sentence. Publish-ready explainer + 3 socials + checklist | Approve first 1–2 posts |
| Days 8–21 | “What written approval actually means” · bond/escrow as permission risk · disclose-all-contracts | 2 posts / week |
| Days 22–45 | Weekly clock post · GC/CISO coalition piece · intel-firm leave-behind | Meeting outreach |
| Days 46–60 | “Procedures week” live-blog stance: we will read the procedures the day they drop and map them to the four questions | Hold calendar |
| After procedures | Diff the procedures against this brief. Update. Do not guess ahead. | Re-approve copy |

**Distribution order (approval-gated):**

1. X + LinkedIn short (Drafts A–C in `nspm-growth-drafts.md`)
2. Founder-forwarded Substack / email of the readiness brief
3. Direct to intel-meeting list (existing WO-024 motion)
4. Only then consider a narrow site page (new WO)

**SEO / resource play:** become the page a GC pastes into Slack. That means: official links first, short, operational, anti-grift, dated, updated when procedures drop.

---

## Build ↔ Bot split

| Actor | Does | Does not |
|-------|------|----------|
| **Grok Build** | Strategy, briefs, meeting kit, optional later `/briefing` WO, product honesty | Auto-post, legal opinions, exploit work, Program brokerage |
| **Grok Bot · COS** | Daily clock, draft queue, outreach list hygiene, scoreboard | Post without founder, claim Team Graph live, claim we authorize ops |
| **Human** | Posts, meetings, any “we are talking to agencies” sentence | Micromanage drafts |

Chat is not canonical. This file + the readiness brief + `SESSION-RESUME.md` are.

---

## Falsifiers (kill or revise the motion)

- Procedures make private permission objects irrelevant (unlikely; written approval + cease-and-notify cut the other way).
- ICP A does not feel paid pain vs SCA + tickets (same falsifier as founder thesis).
- We slip into offense-as-product and become legally/reputationally radioactive.
- We ship a site page that reads as announcement or as Program access.

If any of those fire: revert to the locked product sentence and the intel one-pager. Do not double down on war-language.

---

## Proposed later WO (do not start)

**WO-XXX — Public NSPM briefing page.** Narrow, dated, official-links-first, CTA `/assess` + `/operator`. No announce. No Team Graph live. No “we run operations.” Requires founder copy approval before merge.

Until that WO exists, the readiness brief in `docs/meeting/` is the canonical public-safe artifact.
