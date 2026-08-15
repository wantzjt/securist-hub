# Non-promises card — say this in the room

Print or keep open during intel firm meetings.  
**Source of truth:** [`BUYER-MESSAGING.md`](../BUYER-MESSAGING.md) · [`STRATEGY.md`](../STRATEGY.md) · product ladder on [secur.ist](https://secur.ist)

---

## Never claim

| Claim | Truth |
|-------|--------|
| “AI security platform / AI red team / we pentest your repo” | Permission + Decision Briefs — not offense or CVE factory |
| “npx @securist/operator” or “install from npm” | **Not published.** Monorepo or signed RC tarball only |
| “Runtime verified” on unsigned monorepo build | Unsigned → `runtime_unavailable`; assess blocked until release signature |
| “Team Graph is live / multi-tenant / enterprise ready” | **R1 not live.** No production Postgres Decision Graph |
| “We store your private code in the cloud for free assess” | Public assess = public GitHub only; Operator = local_only |
| “We replace Dependabot / Snyk / Scorecard” | Different job: *still allowed under policy X after change* |
| “Autonomous agents approve production” | Eve/agents propose only; humans own external writes |
| “Hugging Face org securist is live” | HF org **not** provisioned (404 as of 2026-08-12) |
| “github.com/securist is the product forge” | Empty user (0 repos). Product repo is **wantzjt/securist-hub** |
| “Beachhead packages are production CTI systems” | Scaffolds under Securist-InfoSec — not demo depth |
| “Unlimited public assess / never rate limited” | Anonymous GitHub API; honest `rate_limited` / `timeout` |
| “SOC2 / SSO / air-gap ready this week” | Enterprise path after shared graph; not pilot day-one |
| “Seed profiles are LIVE org decisions” | Seed/demo labeled — never customer telemetry |
| “Hack-back is legal now / we help you attack foreign systems” | NSPM is a **USG-directed permission program**, not private hack-back. See [`NSPM-READINESS-BRIEF.md`](./NSPM-READINESS-BRIEF.md) |
| “Securist gets you into the White House / NCC Program” | We do not apply, broker, or operate. We own the decision object |
| “This Decision Brief is written Executive Director approval” | Only Program Executive Directors approve packages. Briefs are not authority |
| “We write exploits / operations packages / targeting” | Forbidden. AUP + this card. Refer them to counsel and the memo |

---

## Always claim (if true in the moment)

| Claim | When |
|-------|------|
| Public Decision Brief is live | secur.ist/assess returns a brief |
| Local Operator exists in monorepo | clone + `npm run securist` |
| Signed RC verifies offline | doctor shows Runtime verified on signed pack |
| Team Graph is the paid shared step | Coming next / design partners |
| Open build + honest limits | README + contracts public |

---

## Safe one-liners under pressure

- *“That’s after Team Graph — we won’t fake durability.”*  
- *“Private code stays local; that’s the free ethical line.”*  
- *“We’re not a scanner; we own permission under drift.”*  
- *“Public install ships after deliberate signed distribution — not today.”*  
- *“I’ll take that as a design-partner requirement, not a commit.”*  
- *“The August 12 memo is not hack-back. It’s a permission program under USG control.”*  
- *“We will not help anyone operate outside written government approval.”*

---

## If you hear yourself saying…

| Slip | Correct |
|------|---------|
| “We’re production multi-tenant” | “Public R0 is live; paid shared graph is next.” |
| “Just npm install securist” | “Clone the hub or use a signed RC tarball.” |
| “We’ll auto-block in CI tomorrow” | “CI enforcement after the re-review loop is trusted.” |
| “TARX is the product” | “TARX is local substrate; Securist is the authority.” |
| “We can help you hit foreign CE-TCOs” | “We help you prove what is still allowed. Operations are USG or they are unlawful.” |
