---
id: WO-012
title: "Local Securist Operator: assess . on embedded TARX Runtime"
status: ready
owner: unassigned
branch: ""
depends_on:
  - WO-010
contracts:
  - packages/contracts/src/public-assess.ts
  - docs/CANONICAL-CONTRACTS.md
  - docs/SYSTEM-MODEL.md
  - ops/system-graph.json
acceptance:
  - CLI path: securist assess . (or npx @securist/operator assess .) runs locally
  - Embedded TARX Runtime is mandatory; TARX Securist Model Pack is the default
  - Local inference backends (Ollama / llama.cpp / vLLM) are adapters only—not competing products
  - Only approved, signed TARX model pack runs by default; digests recorded on every run
  - Reads repository manifests locally; produces the same PublicDecisionBriefV1 (or local-equivalent) shared contract
  - Read-only MCP exposes the brief and tools; no approve/exploit; no external writes (issues/PRs)
  - No customer-private hub persistence; no privileged GitHub token for public web assess path
  - System graph registers new authority-sensitive operator/runtime paths with one owner each
  - Full local verification green; no deploy/production mutation in this WO
non_goals:
  - GitHub App / remote workspace signup
  - Securist Verify / exploitation runtime
  - Eve agent productization
  - Accounts / multi-tenant private cloud workspaces
  - Automated external issues or PRs
  - Fine-tune release as the product (pack digests + adapters only unless explicitly scoped)
  - Untuned base models marketed as “the TARX model”
  - Production deploy or hub private durability claims
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:public-assess
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
  - Operator-local: securist assess . produces ephemeral Decision Brief contract without external writes
---

# WO-012 — Local Operator `assess .` (TARX Runtime)

## Context

**WO-010** shipped the V1 public launch: anonymous `/assess` → immediate ephemeral Decision Brief (PR #14 · `main`).

Next product step is the **private edge**: a Securist Operator that runs continuously inside the user boundary, assesses the **local** repository, and produces the **same shared Decision Brief contract**—then exposes it through **read-only MCP**.

Architecture lock (non-negotiable):

```text
Securist Operator
  └── embedded TARX Runtime          (mandatory)
        ├── signed TARX Securist Model Pack   (default)
        ├── Ollama / llama.cpp / vLLM adapter layer
        ├── sandbox + tool permissions
        ├── tactic packs + policy packs
        ├── local Decision Graph / draft brief
        └── optional Securist sync (not required for WO-012 MVP)
```

| Layer | Role |
|-------|------|
| **Securist** | Product, security authority, Decision Graph / Decision Brief contract |
| **TARX Runtime** | Embedded agent runtime + model supply chain (mandatory) |
| **TARX Supercomputer** | Train/eval/sign adapters and tactic packs; public Scout fleet (not this WO) |
| **Securist Operator** | Private edge agent inside the user boundary |

### Default ship digests (record every run)

```text
Base: openai/gpt-oss-20b
Adapter: tarx-securist-operator-v1
Tactic pack: securist-core-v1
Policy pack: securist-default-v1
Runtime: tarx-runtime-v1
```

Do **not** call an untuned base model “the TARX model.” Local backends are adapters; only signed packs run by default. Tactics stay in signed, versioned packs; the model selects an allowed tactic; TARX enforces tools and scope.

## Product surface (this WO only)

```text
npx @securist/operator init
securist assess .
```

1. Init/embed TARX Runtime; install/verify TARX Securist Model Pack signatures.  
2. Assess **current working directory** (local manifests, public-safe facts only).  
3. Emit the shared Decision Brief contract (`PublicDecisionBriefV1` or explicit local draft subtype that retains the same honesty fields: `durable`/`persistence`/source/verification/unknowns/gaps/non-authoritative policy hints).  
4. Expose via **read-only MCP** (get brief / list gaps — never approve, never exploit, never open external issues/PRs).

## Plan (when claimed)

1. Claim: `in_progress`, owner, one branch.  
2. Package/CLI scaffold under operator path (or monorepo package) with TARX Runtime embed contract.  
3. Local assess pipeline → same contract as hub public assess.  
4. Read-only MCP server surface.  
5. Record pack digests on every run (Decision Graph dogfood).  
6. System graph + fixtures + full verification.  
7. One PR: Work-Order WO-012.

## Progress

- 2026-08-07: Opened as `ready` after WO-010 merge (PR #14). Implementation not started.

## Blockers

- None for filing. Implementation may need TARX Runtime package availability and signing keys under human control for production packs; local/dev signed fixtures allowed for green CI.
