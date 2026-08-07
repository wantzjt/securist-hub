---
id: WO-012
title: "Local Securist Operator: assess . on embedded TARX Runtime"
status: ready
owner: unassigned
branch: ""
depends_on:
  - WO-010
contracts:
  - packages/contracts/src/decision-brief.ts
  - packages/contracts/src/local-assess.ts
  - packages/contracts/src/public-assess.ts
  - docs/CANONICAL-CONTRACTS.md
  - docs/SYSTEM-MODEL.md
  - ops/system-graph.json
acceptance:
  - CLI: securist assess . (or npx @securist/operator assess .) runs locally
  - Emits LocalDecisionBriefV1 — never PublicDecisionBriefV1 for local repo evidence
  - LocalDecisionBriefV1 is local_only, shareability never_automatic, not hub-persisted in WO-012
  - Default brief output contains no raw source, secret values, or absolute local paths
  - DecisionBriefHonestyV1 envelope shared (source, verification, unknowns, gaps, non-authoritative policyHints, durable, persistence)
  - Embedded TARX Runtime mandatory; deterministic manifest collection works without LLM
  - Signed TARX Model Pack synthesis only after securist doctor passes; never silent cloud/unsigned fallback
  - Local inference backends (Ollama/llama.cpp/vLLM) are adapters only
  - MCP tools limited to get_brief, list_gaps, get_run_metadata — no source/path/approve/execute/external-write
  - Local input untrusted: no installs, builds, shell evaluation, or symlink traversal outside target root
  - Runtime/model/tactic/policy digests recorded locally per run; no customer-private hub sync
  - System graph registers operator/runtime paths with one owner each when code lands
  - Fixtures prove: local vs public kind separation; zero absolute paths in default local draft; MCP allowlist; doctor/synthesis failure is explicit; hostile input does not execute
  - Full verification green; no deploy/production mutation
non_goals:
  - Reusing PublicDecisionBriefV1 as the local assess contract
  - Automatic shareable/public export of local evidence
  - Hub persistence of customer-private local briefs
  - GitHub App / remote workspace signup
  - Securist Verify / exploitation runtime
  - Eve agent productization
  - Accounts / multi-tenant private cloud workspaces
  - Automated external issues or PRs
  - Silent cloud inference or unsigned model fallback
  - MCP tools that return raw source, absolute paths, or approval/execution
  - Production deploy or hub private durability claims
verification:
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:public-assess
  - npm run test:local-assess-contracts (or equivalent fixture when implemented)
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
  - Operator-local: securist assess . → LocalDecisionBriefV1; no external writes; no hub sync
---

# WO-012 — Local Operator `assess .` (TARX Runtime)

## Context

**WO-010** shipped the V1 public launch: anonymous `/assess` → `PublicDecisionBriefV1` (PR #14 · `main`).

**Critical contract correction:** `PublicDecisionBriefV1` is deliberately **public and share-safe**. A local repository assessment can contain private paths, dependency names, internal intent, and evidence. Reusing that exact type would create a **false privacy promise**.

Securist Operator is a **secure evidence compiler**—not an “AI that hacks your repo.”

| Surface | Job |
|---------|-----|
| Public `/assess` | Acquire users with public-repo Decision Briefs (`PublicDecisionBriefV1`) |
| Local Operator | Produce private, local evidence from manifests and config (`LocalDecisionBriefV1`) |
| MCP | Let an IDE/agent read the **minimized** local brief only |
| Decision Graph | Retain approved decisions and force re-review under drift (post–WO-012 / R1) |

## Contract decision (locked before implementation)

### 1. `DecisionBriefHonestyV1` (common envelope)

Package: `packages/contracts/src/decision-brief.ts`

Shared fields: `contractVersion`, `durable`, `label`, `decisionStatus`, `observed[]` (assertion + verification + source), `unknowns`, `evidenceGaps`, `reReviewTriggers`, **non-authoritative** `policyHints`, `disclaimers`.

### 2. `PublicDecisionBriefV1` (unchanged product role)

- Public + `persistence: ephemeral_client_only`
- Share-safe web output only
- Must **not** be used for local repo evidence

### 3. `LocalDecisionBriefV1` (WO-012 product output)

Package: `packages/contracts/src/local-assess.ts`

| Rule | Value |
|------|--------|
| `kind` | `local_decision_brief` |
| `persistence` | `local_only` |
| `shareability` | `never_automatic` |
| `visibility` | `local_only` |
| Hub persist | **Never** in WO-012 |
| Default body | No raw source, secrets, or **absolute** local paths |
| Identity | Relative/`rootLabel: '.'`, fingerprints, package metadata — not `/Users/...` |
| Sharing | Explicit future export/redaction action only (out of scope here) |

### 4. MCP (read-only interface, not the product)

**Allowed:** `get_brief`, `list_gaps`, `get_run_metadata`  
**Forbidden:** raw content/path retrieval, approve, exploit, execute, install, build, shell, external issue/PR writes

Constants: `LOCAL_MCP_TOOLS_V1` / `LOCAL_MCP_FORBIDDEN_V1`.

### 5. TARX Runtime + synthesis

```text
Securist Operator
  └── embedded TARX Runtime          (mandatory)
        ├── signed TARX Securist Model Pack   (default when doctor ok)
        ├── Ollama / llama.cpp / vLLM adapter layer (adapters only)
        ├── sandbox + tool permissions
        ├── tactic packs + policy packs
        ├── LocalDecisionBriefV1 (local_only)
        └── no customer-private hub sync in WO-012
```

- **Baseline:** deterministic local manifest collection **without** an LLM.  
- **Additive:** signed TARX Model Pack synthesis **after** `securist doctor` passes.  
- **Insufficient local capability:** explicit error/status — **no** silent cloud or unsigned model fallback.

Default digests (record every local run):

```text
Base: openai/gpt-oss-20b
Adapter: tarx-securist-operator-v1
Tactic pack: securist-core-v1
Policy pack: securist-default-v1
Runtime: tarx-runtime-v1
```

### 6. Hostile local input

Treat the target repository as untrusted input:

- No package installs, builds, or shell evaluation  
- No shell interpolation of file contents  
- No symlink traversal outside the requested repository root  
- Read-only manifest/config collection inside root only  

### 7. Digests & privacy

- Record runtime/model/tactic/policy digests **locally** per run  
- No customer-private hub sync in this WO  

## Product surface (implementation phase)

```text
npx @securist/operator init
securist doctor
securist assess .
```

## System graph implications (when code lands)

| Node (planned) | Role | Depends on |
|----------------|------|------------|
| `contracts` | Own `decision-brief.ts`, `local-assess.ts`, `public-assess.ts` | — |
| `local-operator` | CLI assess + doctor + path sandbox | contracts, decision-graph (shape only) |
| `tarx-runtime-embed` | Runtime + pack verify + adapters | contracts |
| `local-mcp` | Read-only MCP allowlist | local-operator, contracts |

- Decision Graph remains **canonical product authority** for durable approvals.  
- Local brief is **not** a Decision Graph write.  
- Postgres / private hub persistence stay **not production-active**.  
- One owner per sensitive path; coverage roots for operator package when added.  
- Do not mark local evidence as public-research or public-assess.

## Tests required (implementation PR)

1. **Contract separation** — `LocalDecisionBriefV1.kind` ≠ public; persistence `local_only`; sample default draft has no absolute paths / secrets.  
2. **Honesty envelope** — observed facts require source + verification; policyHints marked non-authoritative in fixtures.  
3. **Public regression** — existing `test:public-assess` remains green; public path still never uses privileged GH token.  
4. **Hostile input** — fixture repo with symlink-out-of-root / malicious scripts is not executed; assess does not install or shell.  
5. **Synthesis gate** — without doctor/signed pack → `synthesis: deterministic_only` or explicit failure; never unsigned/cloud fallback.  
6. **MCP allowlist** — only get_brief / list_gaps / get_run_metadata registered; forbidden tools absent.  
7. **No hub persist** — assess path does not call Decision Graph store / Postgres / tenant APIs.

Contract-shape fixture for this filing: `npm run test:decision-brief-contracts` (honesty + local/public separation without operator runtime).

## Plan (when claimed — not this filing)

1. Claim: `in_progress`, owner, one branch.  
2. Operator package + CLI + path sandbox.  
3. Deterministic local assess → `LocalDecisionBriefV1`.  
4. TARX Runtime embed + doctor + optional signed synthesis.  
5. Read-only MCP.  
6. System graph nodes + fixtures above.  
7. One implementation PR: Work-Order WO-012.

## Progress

- 2026-08-07: Opened as `ready` after WO-010 merge (PR #14).  
- 2026-08-07: **Contract correction** filed — LocalDecisionBriefV1 / honesty envelope; PublicDecisionBriefV1 not reused for local evidence. Implementation not started.

## Blockers

- None for filing. Implementation needs TARX Runtime package availability; local/dev signed fixtures allowed for CI.
