# Design-partner interview kit

**Purpose:** Validate or kill the wedge in [`STRATEGIC-WEDGE-RESEARCH.md`](./STRATEGIC-WEDGE-RESEARCH.md) with real buyers.  
**Owner:** Human (conversations). Grok/Codex may refine the kit; they do **not** impersonate design partners.  
**Related work order:** [WO-004](../ops/work-orders/WO-004-design-partner-interviews.md)

---

## Before the call

| Prep | Notes |
|------|--------|
| ICP filter | Security/platform eng owner; not pure GRC-only; can pilot 10–50 artifacts |
| Artifacts | Have 2–3 public Securist Artifact Profile URLs ready (seed is OK if labeled SEED) |
| Recording | Prefer notes over recording; never store customer secrets |
| Time | 30–45 minutes |

**Script open (2 min):**  
“We’re testing whether a version-bound decision graph for security tools and models is worth paying for—or whether Dependabot + SCA + a wiki already close the job. Looking for truth, not a demo win.”

---

## Core questions (25–30 min)

Use in order; skip if already answered.

1. **Last three adoptions**  
   Show me the last three security-related packages or models you allowed into a real environment. Where is that decision recorded today?

2. **Change after approval**  
   When a new version or digest appears, who notices, and what happens to the old approval?

3. **Local validation**  
   What do you already run (or wish you ran) before production use? What evidence is *shareable* outside the laptop?

4. **Alert stack gap**  
   Which tools already fire (Dependabot, SCA, Scorecard, HF cards)? Where do they fail to answer “still allowed under policy X?”

5. **Willingness to pay shape**  
   If pricing were *per actively governed artifact + reviewer seats* (not feed views), what would make that obviously worth it vs free docs + Jira?

### Optional probes

- Who can say no to a new tool in production?  
- Have you ever been burned by a **stale** allowlist entry?  
- Models: same process as packages, or different theater?  
- What would make you refuse a pilot next month?

---

## Scoring sheet (after call)

Score 0–2 each (0 = absent, 1 = weak, 2 = strong). Sum ≥ 8 and no hard disconfirm → candidate partner.

| Criterion | 0–2 | Notes |
|-----------|-----|--------|
| Stale allowlist / decision pain | | |
| Alerts insufficient for “still allowed” | | |
| Owner has engineering authority | | |
| Willing to share minimized validation | | |
| Open to artifact-metered pricing *shape* | | |
| Can pilot without enterprise RFP | | |

**Hard disconfirm (any one → do not force fit):**  
Only cares about CVE volume · GRC-only buyer · Jira-must-be-SoR with no profile · needs all-of-ecosystem day one · wants feed/DAU success metrics · refuses any local evidence path.

---

## After the call

1. Write a 10-line summary in the partner’s work-order note or private CRM—**no secrets in git**.  
2. Tag: `confirm` / `revise` / `kill` against the wedge.  
3. If 3+ `confirm` interviews: human appends or rejects ICP in [`DECISIONS.md`](./DECISIONS.md).  
4. Do **not** invent product scope from a single enthusiastic call.

---

## What not to promise

- SOC2 / enterprise SSO on pilot day  
- Replacement of Snyk/Dependabot  
- Autonomous Eve approvals or auto-PRs  
- Whole-internet monitoring  
- That seed/demo profiles are LIVE org decisions
