# Securist

**Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.**

Permission system for AI-accelerated software adoption — not a scanner, feed, pentest, generic AI chat, or autonomous agent.

Live product: **[secur.ist](https://secur.ist)**

---

## Product ladder

```text
Public Decision Brief  →  Private Local Operator  →  Paid Team Graph  →  Drift enforcement
secur.ist/assess          monorepo today              R1 (next)           after trust
```

| Step | What it is | Status |
|------|------------|--------|
| **Public assess** | Paste a public GitHub repo → immediate, ephemeral, share-safe Decision Brief | **Live** — [secur.ist/assess](https://secur.ist/assess) |
| **Local Operator** | Assess private code on your machine; no source upload | **Built in monorepo** — not a public install yet |
| **Team Graph** | Shared decisions, owners, policy, re-review under change | **Not live** — R1 / design partners |
| **Drift enforcement** | CI/GitHub gates for governed artifacts | **Not live** |

**TARX** is embedded local execution substrate where noted in operator docs — never the lead brand.

---

## Try it (today)

### 1. Public Decision Brief (no account)

1. Open [https://secur.ist/assess](https://secur.ist/assess)  
2. Paste a **public** `github.com/owner/repo` URL  
3. State intended use, environment, and deployment boundary (optional admission pack: coding-agent, MCP, or model/weights)  
4. Get a share-safe brief: observed facts, unknowns, evidence gaps — not a pentest  

Also: [sample Decision Brief (SEED · illustrative)](https://secur.ist/artifacts/art-scout-daemon)

### Briefs we ran (dogfood)

Public /assess dogfood log (ephemeral briefs; share via re-run link after WO-027): [Briefs we ran — 2026-08-12](https://github.com/wantzjt/securist-hub/issues/57)


**Not supported on the public path:** private repos, secrets, local paths, non-GitHub hosts.

**CI dogfood (this repo):** a GitHub Action posts or updates **one** ephemeral Decision Brief comment on public PRs. Not production approval. Team Graph not live. Not a scanner. See [`docs/PUBLIC-DECISION-BRIEF-ACTION.md`](docs/PUBLIC-DECISION-BRIEF-ACTION.md).


### 2. Local Operator (monorepo — honest)

**Not a public `npx @securist/operator` release.** That comes after a human-signed distribution ([release lane](docs/OPERATOR-RELEASE-LANE.md)).

```bash
git clone https://github.com/wantzjt/securist-hub.git
cd securist-hub
npm ci
npm run operator:build
npm run securist -- doctor    # unsigned builds report runtime_unavailable
npm run securist -- assess . --intended-use "Local engineering review"
```

- Local state: `~/.securist/operator` (or `$SECURIST_HOME`) — **0700/0600**, outside the target repo  
- Assess produces `LocalDecisionBriefV1` (private, never automatically shareable)  
- Without a **human release signature**, doctor truthfully blocks “Runtime verified”  
- MCP: `npm run securist -- mcp` (stdio, read-only: brief / gaps / run metadata)

---

## Verify this repository

```bash
npm ci
npm run lint
npm run typecheck
npm run test:lifecycle
npm run test:graph
npm run test:public-assess
npm run test:decision-brief-contracts
npm run operator:build
npm run test:operator
npm run build
npm run verify:coordination
npm run verify:release-readiness
npm run verify:system-graph
npm run verify:clean-worktree
```

Protected `main`: required CI (`verify`), no force-push, secret scanning, Dependabot, CodeQL.

---

## What is next

1. **Signed Operator distribution** (human-owned) — then public install claims  
2. **R1 Team Graph** — shared durable decisions (paid control plane)  
3. Drift / re-review automation and CI enforcement after that loop is trusted  

Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md) · Strategy: [`docs/STRATEGY.md`](docs/STRATEGY.md) · Buyer language: [`docs/BUYER-MESSAGING.md`](docs/BUYER-MESSAGING.md)

---

## Contribute & security

| | |
|--|--|
| Contributing | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Building in public | [`docs/BUILDING-IN-PUBLIC.md`](docs/BUILDING-IN-PUBLIC.md) |
| Security disclosure | [`SECURITY.md`](SECURITY.md) · securist_info_sec@protonmail.com |
| Local Operator guide | [secur.ist/operator](https://secur.ist/operator) · monorepo today |
| Support boundaries | [`SUPPORT.md`](SUPPORT.md) |
| Code of conduct | [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) |
| Admission packs | [`docs/ADMISSION-PACKS.md`](docs/ADMISSION-PACKS.md) |
| Operator release lane | [`docs/OPERATOR-RELEASE-LANE.md`](docs/OPERATOR-RELEASE-LANE.md) |

**Operating law:** one work order · one branch · one PR · clean worktree · human holds credentials, deploy, and release keys.

---

## Hub develop (site)

```bash
./startup.sh
# → http://0.0.0.0:8080
```

Env: see `.env.example`. Optional `GITHUB_TOKEN` is for first-party Scout only — **never** used for anonymous public `/assess`.
