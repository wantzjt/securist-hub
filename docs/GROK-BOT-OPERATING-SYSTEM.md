# Grok Bot operating system — Securist growth & ops

**Date:** 2026-08-12  
**Purpose:** How always-on Grok Bots own daily Securist growth while Grok Build owns product engineering — without dual sources of truth or over-claims.  
**Standup prompt (paste into Bot):** [`GROK-BOT-STANDUP-PROMPT.md`](./GROK-BOT-STANDUP-PROMPT.md)

---

## What Grok Bot is (research summary)

Grok Bot (xAI / SpaceXAI, early beta Aug 2026) is an **always-on teammate with its own cloud computer**. It:

- Signs into your real tools and apps (browser, GitHub, Gmail, X, LinkedIn, etc.)
- Runs multi-step jobs end-to-end and only pings you for approval
- Supports **multiple parallel Bots**, group threads, and “teach a task → routine”
- Keeps working when your laptop is closed  
- Available to SuperGrok Heavy / Cursor Ultra / Cursor Premium Teams subscribers

**Official:** [x.ai/bot](https://x.ai/bot) · [Introducing Grok Bot](https://x.ai/news/introducing-grok-bot)

### Grok Bot vs Grok Build (this machine)

| | **Grok Bot** | **Grok Build** (this CLI / local agent) |
|--|--------------|----------------------------------------|
| Runtime | Own cloud computer, 24/7 | Local session on founder Mac / worktrees |
| Strength | Growth, marketing, email, social, CRM-like ops, multi-app UI work | Code, PRs, tests, contracts, Operator RC, repo control plane |
| Cadence | Daily / scheduled routines | Work-order → PR → CI |
| Source of truth for product | **Reads** git docs; may propose WOs | **Writes** code + work orders under process law |
| Must not | Fake Team Graph live, npm/npx claims, private key custody, R1 provision | Concurrent WOs, credentials, silent scope expansion |

**Rule:** Bot grows the company. Build ships the product. **Git remains canonical.** Chat is never canonical ([`AGENT-OPERATIONS.md`](./AGENT-OPERATIONS.md)).

---

## Do you need a Securist MCP?

### Day 0 recommendation: **No custom Securist MCP yet**

Start with:

1. **Git as the bus** — `docs/ROADMAP.md`, `ops/work-orders/`, `docs/SESSION-RESUME.md`, `docs/meeting/`  
2. **GitHub** — issues/discussions for build-in-public; PR links as evidence  
3. **Existing MCPs in Grok Build** — GitHub, Gmail, Calendar, etc. (when Build is online)  
4. **Grok Bot logins** — GitHub (`wantzjt`), X, Gmail (`ops@secur.ist` / founder), Vercel (read-only if possible)

Why wait on a custom MCP:

- Bot already operates UIs without APIs  
- Securist already has a strict work-order control plane — duplicating it in MCP before routines exist creates two half-sources of truth  
- Growth work is mostly *outside* the monorepo (social, email, research, calendar)

### Build a Securist MCP when (and only when)

Any two of these are true:

- Bot and Build fight over “what’s live” more than once a week  
- You want **machine-checkable** non-promises (block copy that claims npx / Team Graph live)  
- Daily scoreboard needs one API both can call without scraping markdown  
- Multiple Bots need shared structured state beyond a GitHub issue

### If/when you build it — thin surface only

| Tool | Purpose |
|------|---------|
| `get_product_truth` | LIVE / NOT LIVE ladder (assess, operator, team graph, npx) |
| `get_non_promises` | Hard claim blocklist |
| `list_work_orders` | Status filter from `ops/work-orders/` |
| `propose_work_order` | Draft WO file or GitHub issue (human/Build claims) |
| `get_roadmap_now` | NOW/NEXT slice from ROADMAP |
| `daily_scoreboard` | Metrics stubs + checklist results |
| `get_meeting_kit` | Paths + one-pager excerpt for intel demos |

**Never put in MCP:** private signing key, `DATABASE_URL`, customer Local Briefs, announce authority.

Implementation home (later WO): `packages/securist-mcp` or `ftw-lab/securist-mcp` · stdio for Build · optional HTTP for Bot if Bot supports custom MCP.

---

## Recommended Bot team (start lean)

| Bot | Role | Owns |
|-----|------|------|
| **Securist COS** (first) | Chief of Staff | Daily scoreboard, prioritization, human escalations, multi-bot coordination |
| **Securist Proof** | GitHub / open build | Issues, weekly build notes, repo About hygiene, Dependabot triage flags, release honesty |
| **Securist Signal** | Marketing / social | X/LinkedIn drafts, funnel CTA checks, content calendar, **approval-gated** posts |
| **Securist Pipeline** | Design partners | Interview scheduling, kit scoring notes (private), CRM-lite follow-ups — **no fake interviews** |
| **Securist Build-Liaison** | Engineering handoff | Translate growth needs → proposed WOs for Grok Build; never merges past process |

**Week 1:** stand up **Securist COS only**. Spawn specialists after routines stick.

---

## Daily growth loop (COS owns)

```text
08:00  Scoreboard (site, GitHub, release, roadmap blockers)
09:00  One public proof action (build note, issue, README honesty, discussion)
10:00  One growth action (draft post / outreach list / SEO note) — APPROVAL if external publish
11:00  Roadmap hygiene (propose WO or update SESSION-RESUME if process allows)
17:00  End-of-day report to founder (what shipped, what needs human, what is blocked)
```

**North-star metric (product):** time from material change → accountable re-review.  
**Growth metrics (ops):** public assess funnels, GitHub stars/forks/traffic, design-partner conversations booked, honest build-in-public cadence — **not** vanity “AI security” impressions.

---

## Hard stops (all Bots)

| Forbidden without founder | Why |
|---------------------------|-----|
| Paste/commit Operator private key | Trust root |
| `npm publish` / claim public `npx` | Distribution gate |
| Provision Postgres / R1 env | WO-008 human authority |
| Broad product launch announcement | Roadmap HOLD |
| Claim Team Graph multi-tenant live | Not live |
| Claim HF `securist` org live | 404 as of 2026-08-12 |
| Impersonate design-partner interviews | WO-004 human |
| Over-claim beachhead packages as CTI platforms | Scaffolds only |
| Store customer Local Briefs in cloud | local_only law |

Full card: [`meeting/NON-PROMISES.md`](./meeting/NON-PROMISES.md)

---

## Handoff to Grok Build

When COS needs product engineering:

1. Open or draft `ops/work-orders/WO-NNN-….md` (or GitHub issue labeled `needs-build`)  
2. Body must include acceptance, non-goals, verification  
3. Message founder or Grok Build:  
   `Resume Securist from docs/SESSION-RESUME.md — implement WO-NNN`  
4. Build claims WO → one branch → one PR → CI → human gates as required  

Bot does **not** race Build on the same WO.

---

## Founder setup checklist (once)

- [ ] Install Grok Bot ([download](https://x.ai/bot#download)) on plan that includes Bot  
- [ ] Create Bot **Securist COS**  
- [ ] Paste full [`GROK-BOT-STANDUP-PROMPT.md`](./GROK-BOT-STANDUP-PROMPT.md) as first message  
- [ ] Log Bot into: GitHub (`wantzjt`), Gmail, X (founder or brand), calendar  
- [ ] Optional: Vercel read-only for `tarx/securist-hub` deploy status  
- [ ] Teach routine: “Daily Securist scoreboard” (run once with Bot watching)  
- [ ] Confirm approval rule: **no external post/email without founder OK** for first 14 days  
- [ ] ★ Backup Operator private key (still human)  

---

## Related

- [`SESSION-RESUME.md`](./SESSION-RESUME.md)  
- [`ROADMAP.md`](./ROADMAP.md)  
- [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md)  
- [`BUILDING-IN-PUBLIC.md`](./BUILDING-IN-PUBLIC.md)  
- [`AGENT-OPERATIONS.md`](./AGENT-OPERATIONS.md)  
- [`meeting/`](./meeting/)  
