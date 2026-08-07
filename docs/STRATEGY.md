# Securist strategy

**Canonical company strategy.** Buyer language: [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md).  
Thesis detail: [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md). Decisions: D-011 · D-012 in [`DECISIONS.md`](./DECISIONS.md).

---

## Thesis

**Securist is the permission system for AI-accelerated software adoption.**

> Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.

Not a social timeline, news site, bulk-forking machine, AI chat product, MCP product, or repo scanner.

---

## The job

| Question | Owner |
|----------|--------|
| What entered our environment? | Inventory / evidence inputs |
| Was it permitted for this use? | **Securist decision** |
| What evidence supported that? | **Securist Decision Brief / Graph** |
| What changed → reconsider? | **Securist re-review under drift** |

GitHub answers code change. SCA answers “a vuln may exist.” Agents may propose fixes. **Securist owns “is this still allowed, and why?”**

AI governance buyers are **cross-functional** (privacy, legal, IT, data, security)—not a single new title ([IAPP 2025 AI Governance Profession Report](https://iapp.org/resources/article/ai-governance-profession-report)).

---

## Architecture (locked)

```text
Public web          → PublicDecisionBriefV1 (ephemeral, share-safe)
Free Local Operator → LocalDecisionBriefV1 (local_only, private individual)
Paid Team Graph     → durable shared decisions (R1+)
TARX                → behind the curtain (local runtime + signed model pack)
```

| Layer | Role |
|-------|------|
| **Securist** | Product, security authority, Decision Graph / Decision Briefs |
| **TARX Runtime** | Embedded agent runtime and model supply chain (not customer brand) |
| **TARX Supercomputer** | Train/eval/sign packs; public research fleet |
| **Local Operator** | Free private edge assess inside the user boundary |

---

## Commercial boundary (D-012)

| | Free | Paid |
|--|------|------|
| **Nature** | Private and individual | Shared, durable, accountable |
| **Operator** | Local state · local MCP · no source upload · no credits | — |
| **Team Graph** | — | Policy · owners · drift · re-review · CI |
| **Enterprise** | — | SSO · air-gapped deploy · fleet · audit |

Cloud is the normal paid delivery path—not the definition of paid. Air-gapped team control is still paid.

**Ethical line:** *Keep your code local for free. Pay when Securist becomes your team’s shared memory and control plane.*

**Pricing unit:** active governed artifacts + reviewer capacity—not tokens or scans.

---

## Distribution honesty (Operator)

| | |
|--|--|
| **Internally shipped** | WO-012 on `main` — monorepo `npm run operator:build` · `npm run securist` |
| **Distribution-shipped** | Not yet — no public `npx @securist/operator` until human-signed release + deliberate publish |

See [`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md).

**Public status copy:**

> Free Local Operator: available from the Securist monorepo today.  
> Public install: forthcoming after signed distribution.

---

## Dual-forge

| Lane | System |
|------|--------|
| Code | GitHub |
| Weights / public models | Hugging Face |
| Decision why/trust | **Securist Decision Graph** |
| Cloud research workflows | **Eve** (propose only — [`EVE-RUNTIME.md`](./EVE-RUNTIME.md)) |
| Local private assessment | **Securist Operator** (+ embedded TARX, not vendored as product) |

**Eve proposes → Securist contracts decide → humans approve external writes.**

---

## Sequence

1. Free private Operator (WO-012 — **internally shipped**)  
2. **R1** durable Team Graph (paid value) — human WO-008 — **run in parallel**  
3. Human Operator **distribution** lane (signed install) — human release  
4. Change detection before autonomous action  
5. CI/GitHub enforcement after trust in re-review  
6. AI propose-only remediation last  

**North-star metric:** time from material change to an accountable re-review.

---

## Activity and filters

Operations pulse across public research, operator evidence, and decision changes. Always show source, verification, LIVE/SEED honesty.

Filters that change decisions: domain · artifact type · decision status · scope (public / org / operator).

Post-quantum remains first-class inventory implication—not fear marketing.
