# Contributing to Securist

Thanks for helping build a **permission system for AI-accelerated software adoption**.

Product sentence: *Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.*

## Before you start

1. Read [`README.md`](README.md) — what is **live** vs **not**.  
2. Read [`docs/BUILDING-IN-PUBLIC.md`](docs/BUILDING-IN-PUBLIC.md) — disclosure boundaries.  
3. Prefer a claimed **work order** ([`ops/work-orders/`](ops/work-orders/)) over drive-by scope.  

## Rules

- **Public sources / authorized use only**  
- Tag discoveries with **legal_risk** when relevant  
- **Agent drafts, human merges**  
- No secrets, `.env` keys, private customer data, or Local Operator brief dumps in PRs  
- No personal handles on public product surfaces  
- No fake vendor/government affiliation  
- GeoIP is **not** identity  
- HF weights: operator-controlled cache; no illegal rehost  
- Do not claim public `npx` Operator install, Team Graph, or autonomous remediation  

## Operating law

- **One work order · one branch · one PR**  
- Full verification suite + **clean worktree**  
- Human holds credentials, deploy, production mutation, and release signing keys  

## PR checklist

- [ ] Scope matches a WO or an explicit founder ask  
- [ ] No secrets; no private paths/customer material  
- [ ] `npm run lint` · `typecheck` · relevant tests · `verify:clean-worktree`  
- [ ] PR body includes `Work-Order: WO-NNN`  
- [ ] Honesty: new capabilities match contracts and docs  

## Dual-forge (supporting)

- **GitHub** — code and this hub  
- **Hugging Face** ([securist](https://huggingface.co/securist)) — public model research surfaces  
- Hub: https://secur.ist  

## Conduct & support

- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)  
- [`SUPPORT.md`](SUPPORT.md)  
- Security: [`SECURITY.md`](SECURITY.md) · ops@secur.ist  
