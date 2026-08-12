# Securist — one-pager for intel / CTI firms

**Use:** Leave-behind or cold open (≤2 min read).  
**Live product:** [secur.ist](https://secur.ist) · open build: [wantzjt/securist-hub](https://github.com/wantzjt/securist-hub)  
**Date:** 2026-08-12 · **Classification:** UNCLASSIFIED // PUBLIC SOURCE

---

## The problem (in one breath)

Engineers and coding agents can pull a package, model, Action, or OSINT tool into an environment in minutes. Organizations still cannot answer, with evidence:

1. What entered?  
2. Was it permitted for *this* use?  
3. What evidence supported that?  
4. What changed so we must reconsider?

SCA and Dependabot fire on *vulnerabilities*. Wikis and tickets record *approvals that silently age*. Securist owns **permission under drift**.

---

## Product sentence (locked)

> **Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.**

**Category:** permission system for AI-accelerated software adoption.  
**Not:** AI security chat, pentest-as-a-service, MCP-as-product, or scanner theater.

---

## What you can touch today

| Layer | What it does | Status |
|-------|----------------|--------|
| **Public Decision Brief** | Paste a **public** GitHub URL → immediate, share-safe brief: observed facts, scope, unknowns, evidence gaps | **Live** — [secur.ist/assess](https://secur.ist/assess) |
| **Local Operator** | Assess private code on the machine; no source upload; local-only brief | **Monorepo today** · **signed RC** (not public npm) |
| **Team Graph** | Shared decisions, owners, policy, forced re-review when reality changes | **Not live** — R1 / design partners |

**Ethical line:** *Keep your code local for free. Pay when Securist becomes your team’s shared memory and control plane.*

**Pricing unit (intent):** active governed artifacts + reviewer capacity — never tokens or scan meters.

---

## Why this maps to intel / CTI tooling

| Firm pain | Securist angle |
|-----------|----------------|
| Tooling sprawl (collectors, enrichers, models, internal forks) | Version-bound permission objects, not a wiki row |
| “We approved v1.2 last year” after digest/manifest drift | Re-review trigger is the product, not a backlog item |
| Agents and automations that pull public GitHub/HF assets | Same decision language for humans and agents |
| Share-safe vs local-only evidence | Public Brief is ephemeral and share-safe; Operator stays `local_only` |
| Cross-functional buyers (security + legal + eng) | One decision record, not a single “AI GRC seat” fantasy |

**North-star metric:** time from material change → accountable re-review.

---

## Architecture honesty (30 seconds)

```text
Public web     → PublicDecisionBriefV1 (ephemeral, share-safe)
Free Operator  → LocalDecisionBriefV1 (local_only, private individual)
Paid Team Graph→ durable shared decisions (R1+, not live)
TARX           → behind the curtain (local runtime + signed model pack)
```

TARX is **not** the customer brand. Securist is the security authority and Decision Graph product.

---

## Design-partner ask (what we want from the conversation)

1. Confirm or kill: is **stale permission after change** a real paid pain vs SCA + tickets?  
2. Name 10–50 artifacts you would pilot if shared Team Graph existed.  
3. Who can say no to a new tool/model in production today?  
4. If pricing is per actively governed artifact + seats, what makes that obviously worth it?

Full interview kit: [`../DESIGN-PARTNER-INTERVIEW-KIT.md`](../DESIGN-PARTNER-INTERVIEW-KIT.md)

---

## Hard boundaries (say out loud)

See [`NON-PROMISES.md`](./NON-PROMISES.md). Short form:

- Not a pentest, red team, or CVE factory  
- Not public `npx @securist/operator` yet  
- Not multi-user durable Team Graph yet  
- Not claiming Hugging Face org or empty forge mirrors as depth  

---

## Contact / next step

- Try: [secur.ist/assess](https://secur.ist/assess)  
- Private path: [secur.ist/operator](https://secur.ist/operator)  
- Repo: [wantzjt/securist-hub](https://github.com/wantzjt/securist-hub)  
- Ops: ops@secur.ist · Security: security@secur.ist  

**Suggested close:** *Design-partner pilot when Team Graph exits R1 — until then, public Brief + local Operator prove the decision object.*
