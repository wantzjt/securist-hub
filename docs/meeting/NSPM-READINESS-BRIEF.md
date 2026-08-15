# Readiness brief — August 12, 2026 NSPM

**For:** GC, CISO, program lead, and intel/IR firms considering any role around the Program  
**From:** Securist — permission system for AI-accelerated software adoption  
**Date:** 2026-08-15 · **Not legal advice. Not a Program application.**  
**Classification:** UNCLASSIFIED // PUBLIC SOURCE

**Read the primary text:**

- [Presidential Memorandum (August 12, 2026)](https://www.whitehouse.gov/presidential-actions/2026/08/expanding-capabilities-to-combat-transnational-cyber-enabled-crime/)
- [White House fact sheet](https://www.whitehouse.gov/fact-sheets/2026/08/fact-sheet-president-donald-j-trump-expands-capabilities-to-combat-transnational-cyber-enabled-crime/)

---

## The one sentence

**This memorandum does not legalize private hack-back.**

It creates a federal program under the National Coordination Center. Vetted U.S. *Participating Companies* contract with DOJ or DHS. They may propose Cyber Surveillance Operations and Cyber Effects Operations against foreign Cyber-Enabled Transnational Criminal Organizations. **No action without written approval and direction from the Program Executive Directors.** Any approved action is conducted exclusively on behalf of, and under the supervision of, the United States Government. The Computer Fraud and Abuse Act still applies; the memo places Program activity under U.S. Government control.

If someone tells your board “we can attack foreign networks now,” they have not read Section 2.

---

## What is authorized vs. what is not

| Authorized (only inside the Program) | Not authorized |
|--------------------------------------|----------------|
| Vetted U.S. companies, under DOJ/DHS contract | Unilateral private hack-back |
| Propose operations from threat info gathered in *normal business* or from FSLTT partners | Targeting foreign *state* actors (CE-TCO ≠ institutional part of a foreign government) |
| Cyber Surveillance / Cyber Effects **after written approval** | Operations likely to cause death, serious injury, or a use of force / armed attack (“Critical Outcomes”) |
| Lawful defensive cyber operations you already had | Treating a blog post, Decision Brief, or vendor slide as approval |
| | Exceeding the approved package (U.S. person, U.S. system, U.S.-controlled system) — **cease, minimize, notify** |

Clock: operating procedures are due **within 60 days of August 12, 2026** (~October 11). Until those procedures exist, there is no public participation path to sell.

Bond: Participating Companies should expect a **bond or escrow of at least $1 million**, forfeitable on contractual non-compliance.

---

## The four questions the memo forces

Every serious firm — whether they apply to be a Participating Company or only sell threat information / tooling into one — must answer these continuously:

1. **What entered this environment?**  
   Tools, models, agents, forks, feeds, teaming agreements, subcontractors.

2. **Was it permitted for *this* use?**  
   This written package. This target class. This contract. Not “we were approved last year.”

3. **What evidence supported that permission?**  
   Vetting file, contract clause, written approval, scope, personnel, facility.

4. **What changed so we must reconsider — or cease?**  
   New digest. New model card. New commercial relationship (must be disclosed). Scope exceed. U.S. person. Critical infrastructure. Belief that Critical Outcomes may result.

SCA answers “a vulnerability may exist.” Tickets record an approval that silently ages. **The memo makes stale permission a forfeiture and notification event.**

---

## Two roles — do not confuse them

### Role A — You sell information or tooling (most firms)

Section 2(a)(iii) lets Participating Companies take threat information collected in other companies’ *normal business activities*, and from FSLTT agencies, **in order to propose operations to the NCC**. Those commercial relationships must be disclosed.

If that is you:

- You are not authorized to conduct Program operations.
- You *are* about to be asked what entered the environment you sold from, whether it was permitted, and whether it drifted.
- Your teaming agreement is now a governed artifact.

### Role B — You may apply to be a Participating Company

Expect: rigorous vetting, technical proficiency, proven performance, facility security, personnel vetting, $1M bond/escrow, written approval of **every** package, cease-and-notify duties, annual continued-participation review, and government control of the operation.

Do not staff this as “red team with a new logo.” Staff it as **program + legal + permission + evidence**.

Securist does not apply for you, does not write operations packages, and does not conduct or advise unauthorized access.

---

## 14-day readiness checklist (operational, not legal)

Work these before procedures drop. Counsel owns the contract column.

| # | Action | Owner |
|---|--------|-------|
| 1 | Board / GC read the *memo*, not a recap | GC |
| 2 | Write a one-page “we will not hack back” policy and circulate | GC + CISO |
| 3 | Inventory tools, models, agents, and feeds that could touch a Program-adjacent environment | CISO / platform |
| 4 | Name who can say *no* to a new artifact entering that environment today | CISO |
| 5 | Mark every current “approval” with version, scope, and evidence — or mark it stale | Program + legal |
| 6 | List commercial relationships that would need disclosure under §2(a)(iii) | GC + BD |
| 7 | Decide Role A vs Role B. Do not do both accidentally | CEO / GC |
| 8 | If Role B: start a bond/escrow, facility, and personnel-vetting conversation with counsel | GC / CFO |
| 9 | Write the cease-and-notify path *before* you need it (U.S. person, U.S. system, CI, Critical Outcomes) | Program |
| 10 | Separate lawful defensive operations from any future Program activity | CISO |
| 11 | Ban “this Slack message is authorization” | All |
| 12 | Assess public tooling you already depend on — format-proof the decision object | Eng / CISO |
| 13 | Keep private code local until you have a shared, durable decision store | Eng |
| 14 | Calendar **~October 11, 2026** as procedures day. Re-read. Diff. Do not guess. | Program |

---

## Where Securist fits (honest)

| Need | What exists today | What does not |
|------|-------------------|---------------|
| A share-safe Decision Brief on a **public** repo | Live — [secur.ist/assess](https://secur.ist/assess) | Not production permission. Not Program approval. |
| Private assessment, no source upload | Local Operator — [secur.ist/operator](https://secur.ist/operator) · monorepo or signed RC, **not** public npm | — |
| Shared decisions, owners, policy, forced re-review | Team Graph — **coming next**, not live | Do not claim it in a board deck |

**Product sentence:** *Securist tells teams what their humans and coding agents may bring into production — and reopens that permission when reality changes.*

**Category:** permission system. Not a scanner, pentest, red team, or offensive platform.

**Ethical line:** *Keep your code local for free. Pay when Securist becomes your team’s shared memory and control plane.*

---

## Next step

1. Read the official memorandum (15 minutes).  
2. Run the 14-day checklist once.  
3. Put one public dependency through [secur.ist/assess](https://secur.ist/assess) so the buying group sees the decision object.  
4. If you want a design-partner conversation when shared Team Graph exists: ops@secur.ist  

Open build: [wantzjt/securist-hub](https://github.com/wantzjt/securist-hub)

**Close:** *The firms that win the next 60 days will not be the loudest about effects. They will be the ones who can prove what was allowed, for which use, on whose written authority — and what change reopened it.*
