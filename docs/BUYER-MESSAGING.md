# Buyer messaging — CISO / CIO / CAIO (and the real buying group)

**Status:** Canonical outbound and website language  
**Date:** 2026-08-07  
**Depends on:** [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) · D-011 / D-012 in [`DECISIONS.md`](./DECISIONS.md) · [`STRATEGY.md`](./STRATEGY.md)

This document locks **who we speak to** and **what we say** so site copy, sales, and research do not drift into “AI security scanner” theater.

---

## Product sentence (locked)

> **Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.**

**Category:** permission system for AI-accelerated software adoption.  
**Not:** AI security product category, MCP-as-product, repo scanner, news feed.

---

## Reality of the buying group

AI governance is **cross-functional**, not a single new title. Privacy, legal, IT, data governance, security, and engineering leadership share the same four questions:

1. What entered our environment?  
2. Was it permitted for this use?  
3. What evidence supported that permission?  
4. What changed that means we must reconsider it?

**Primary research anchor:** IAPP’s [2025 AI Governance Profession Report](https://iapp.org/resources/article/ai-governance-profession-report) — ownership of AI governance is distributed across privacy, legal, IT/security, and data functions rather than a single standardized buyer seat.

| Role | Care about | Securist message |
|------|------------|------------------|
| **CISO** | Risk, policy, audit, material change | Version-bound permission + forced re-review under drift |
| **CIO** | Portfolio, tooling sprawl, agents pulling code | One decision system for what may enter production |
| **CAIO / Head of AI** | Speed of adoption vs governance theater | Permission under change—not block-all chatbots |
| **Privacy / Legal** | Use boundary, data classification, evidence | Scope-bound decisions; share-safe public vs local-only private |
| **Platform / Eng leadership** | Developer friction, CI, ownership | Free local assess; paid shared memory when the team needs it |

Outbound and website copy should address the **coalition**, not invent a single “AI GRC buyer.”

---

## Packaging (commercial — D-012)

| Tier | Promise | Do not claim |
|------|---------|--------------|
| **Free Operator** | Assess locally; private local state; local MCP; no source upload; no credits | Public `npx` install until signed distribution ships |
| **Team Graph (paid)** | Shared decisions, reviewers, policy, drift/re-review, CI enforcement | Available before R1 durable graph is human-signed |
| **Enterprise** | SSO, private/air-gapped deploy, fleet, audit export, custom policy | Free for air-gapped (still paid team control plane) |

**Ethical line:** *Keep your code local for free. Pay when Securist becomes your team’s shared memory and control plane.*

**Pricing unit:** active governed artifacts + team/reviewer capacity—**never** AI tokens or scan meters. Dollars: design-partner validation.

---

## Public status (honest distribution)

| Claim | Status |
|-------|--------|
| Free Local Operator in monorepo | **Yes** — WO-012 on `main` (`npm run operator:build` · `npm run securist`) |
| Signed RC path (offline tarball) | **Yes, when you hold a human-signed RC** — Gate 1 proven; site documents unpack → doctor → assess · **no public download store** |
| Public install (`npx @securist/operator`) | **No** — forthcoming after deliberate publish gate |
| Runtime “verified” without release signature | **No** — doctor reports `runtime_unavailable`; assess blocked |
| Paid Team Graph / multi-user durability | **No** until R1 (WO-008) human-signed |

**Website / deck default copy:**

> Free Local Operator: monorepo today; signed RC when you have a human-produced tarball.  
> Public install: forthcoming after signed distribution.

Do **not** put `npx @securist/operator` on the public site until a human-signed release exists and the package is deliberately published.

---

## Sovereignty and privacy guardrails

| Surface | Rule |
|---------|------|
| Public `/assess` | Public GitHub only; no privileged token; ephemeral `PublicDecisionBriefV1` |
| Free Operator | Local manifests; `LocalDecisionBriefV1`; local_only; never automatically shareable; no hub sync |
| TARX | Behind the curtain — local privacy-preserving execution + signed model supply chain; not customer infrastructure branding |
| Paid graph | Customer-private decisions only after R1 durable tenant path |

---

## Funnel

```text
Public Decision Brief (format proof)
  → “Assess your local code — free” (monorepo Operator today)
  → Local Brief: Keep local  |  Turn into a team decision (paid, post-R1)
  → Team Decision: policy + owner + evidence + re-review trigger
```

**North-star metric:** time from material change to an accountable re-review—not chat volume, scans, or feed traffic.

**Pivotal moment (not chat):**

```text
You assessed this repository for production use.
3 evidence gaps remain.
A dependency manifest changed since review.
This permission is no longer current.
```

---

## Website / outbound copy blocks

### Hero

- **Headline:** Permission for code and models.  
- **Subhead:** Know what engineers and agents may use, what evidence supported it, and what must be reconsidered when artifacts change.  
- **Primary CTA:** Assess a public repository.  
- **Secondary CTA:** Free local Operator (monorepo today · public install forthcoming).

### Do not say

- “AI security platform” as the category  
- “We red-team / pentest your repo”  
- “npx install” before signed distribution  
- “Verified runtime” without release signature  
- “Enterprise ready multi-tenant” before R1 evidence  

### Do say

- Permission under drift for code and models  
- Free private individual assess; pay for shared memory  
- Cross-functional governance (security + privacy + legal + IT + data)  
- TARX as privacy-preserving local execution, not the product name  

---

## Research sources

| Source | Use |
|--------|-----|
| [IAPP 2025 AI Governance Profession Report](https://iapp.org/resources/article/ai-governance-profession-report) | Cross-functional ownership of AI governance |
| Internal | D-011 product sentence · D-012 commercial architecture · FOUNDER-THESIS |

---

## Related

- [`STRATEGY.md`](./STRATEGY.md)  
- [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md)  
- [`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md) — human-owned signed distribution  
- [`ROADMAP.md`](./ROADMAP.md)  
