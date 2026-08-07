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
  - Provenance is LocalRunProvenanceV1 (label + contentDigest + used + verification) — not string labels-as-digests
  - deterministic_only never claims model use (baseModel/adapter not_used, no contentDigest)
  - tarx_model_pack requires used+content_verified digests for baseModel and adapter
  - MCP get_run_metadata returns LocalMcpRunMetadataV1 with modelUsed only when model digests verified
  - No customer-private hub sync
  - System graph registers operator/runtime paths with one owner each when code lands
  - Fixtures prove: local vs public separation; path privacy; provenance honesty; MCP allowlist; doctor/synthesis explicit
  - Full verification green; no deploy/production mutation
non_goals:
  - Reusing PublicDecisionBriefV1 as the local assess contract
  - Recording mutable product labels (gpt-oss-20b, tarx-runtime-v1, …) as if they were content digests
  - Claiming model use on deterministic_only runs
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
  - npm run test:decision-brief-contracts
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

| Tool | Returns |
|------|---------|
| `get_brief` | Minimized `LocalDecisionBriefV1` |
| `list_gaps` | Evidence gaps / unknowns only |
| `get_run_metadata` | `LocalMcpRunMetadataV1`: synthesis, `modelUsed`, full `provenance` |

Constants: `LOCAL_MCP_TOOLS_V1` / `LOCAL_MCP_FORBIDDEN_V1`.

### 5. Provenance amendment (six-item lock) — **not labels-as-digests**

`LocalRunProvenanceV1` replaces string maps like `{ baseModel: "gpt-oss-20b" }`.

| # | Rule |
|---|------|
| 1 | **Label ≠ content digest.** `label` is display-only; `contentDigest` is `{ algorithm: 'sha256', hex }` of loaded bytes or `null`. |
| 2 | **`used=true` requires proof.** `verification: content_verified` + non-null `contentDigest`. |
| 3 | **`deterministic_only` forbids model-use claims.** `baseModel` and `adapter` must be `not_used` with `contentDigest: null` — even if default product labels exist. |
| 4 | **`tarx_model_pack` requires verified model digests.** `baseModel` and `adapter` must be `used` + `content_verified`. |
| 5 | **MCP `modelUsed`** is true only under rule 4; always false for `deterministic_only`. |
| 6 | **MCP metadata honesty.** `get_run_metadata` exposes `LocalMcpRunMetadataV1` via `toLocalMcpRunMetadata` — never a label-string digest map. |

Runtime helper: `assertLocalProvenanceHonesty(synthesis, provenance)`.

Default **product labels** (docs/packaging only — not digests):

```text
Runtime label: tarx-runtime-v1
Base model label: openai/gpt-oss-20b
Adapter label: tarx-securist-operator-v1
Tactic pack label: securist-core-v1
Policy pack label: securist-default-v1
```

### 6. TARX Runtime + synthesis

```text
Securist Operator
  └── embedded TARX Runtime          (mandatory)
        ├── signed TARX Securist Model Pack   (default when doctor ok)
        ├── Ollama / llama.cpp / vLLM adapter layer (adapters only)
        ├── sandbox + tool permissions
        ├── tactic packs + policy packs
        ├── LocalDecisionBriefV1 (local_only + provenance)
        └── no customer-private hub sync in WO-012
```

- **Baseline:** deterministic local manifest collection **without** an LLM → `synthesis: deterministic_only`, model components `not_used`.  
- **Additive:** signed TARX Model Pack synthesis **after** `securist doctor` → content-verified digests for used model components.  
- **Insufficient local capability:** explicit error/status — **no** silent cloud or unsigned model fallback.

### 7. Hostile local input

Treat the target repository as untrusted input:

- No package installs, builds, or shell evaluation  
- No shell interpolation of file contents  
- No symlink traversal outside the requested repository root  
- Read-only manifest/config collection inside root only  

### 8. Privacy

- Provenance and briefs stay **local**  
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
3. **Provenance honesty** — `assertLocalProvenanceHonesty`: deterministic_only rejects used model; tarx_model_pack requires content digests; labels-as-only-proof rejected.  
4. **MCP metadata** — `toLocalMcpRunMetadata` sets `modelUsed: false` for deterministic_only; true only with verified model digests.  
5. **Public regression** — `test:public-assess` remains green.  
6. **Hostile input** — no install/shell/out-of-root traversal.  
7. **Synthesis gate** — doctor/pack failure is explicit; no silent cloud/unsigned fallback.  
8. **MCP allowlist** — only the three tools; forbidden tools absent.  
9. **No hub persist** — no Decision Graph store / Postgres / tenant APIs on assess path.

Filing fixture: `npm run test:decision-brief-contracts` (public/local split + provenance/MCP rules without operator runtime).

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
- 2026-08-07: **Contract correction** filed — LocalDecisionBriefV1 / honesty envelope; PublicDecisionBriefV1 not reused for local evidence.  
- 2026-08-07: **Provenance/MCP amendment** — LocalRunProvenanceV1 with content digests; deterministic_only cannot claim model use; MCP LocalMcpRunMetadataV1. Implementation not started.

## Blockers

- None for filing. Implementation needs TARX Runtime package availability; local/dev signed fixtures allowed for CI.
