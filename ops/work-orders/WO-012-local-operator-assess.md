---
id: WO-012
title: "Local Securist Operator: assess . on embedded TARX Runtime"
status: complete
owner: grok
branch: feat/wo-012-local-operator
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
  - Provenance uses componentId/version + contentDigest + signerKeyId + signatureStatus + useStatus
  - deterministic_only has baseModel/adapter null (not default component IDs)
  - tarx_model_pack requires used + verified signature + real sha256 digests
  - Capability states precise; signature_invalid never falls back
  - Intended-use/config secret-redacted before brief/MCP
  - MCP stdio_local only; every response visibility local_only + shareability never_automatic
  - Fixtures prove deterministic null model, model-pack digest+sig, ID-alone insufficient, redaction, MCP envelope
  - Full verification green; no deploy/production mutation
non_goals:
  - Reusing PublicDecisionBriefV1 as the local assess contract
  - Calling component IDs (tarx-runtime-v1, gpt-oss-20b) “digests”
  - Embedding default model IDs on deterministic_only runs
  - Claiming model use without used+verified+contentDigest
  - HTTP/remote MCP transport as default
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
  - npm run test:operator
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

### 4. MCP (read-only **local** interface — data-egress boundary)

- **Transport (WO-012):** `stdio_local` only — no HTTP/remote default.  
- **Every response:** `LocalMcpEnvelopeV1` with `visibility: local_only`, `shareability: never_automatic`, egress warning that a user-selected MCP client may transmit summaries externally.  
- **Allowed tools:** `get_brief`, `list_gaps`, `get_run_metadata`  
- **Forbidden:** raw content/paths, approve, exploit, execute, install, build, shell, external writes  

| Tool | Returns (inside envelope) |
|------|---------------------------|
| `get_brief` | Minimized brief + classification |
| `list_gaps` | Gaps / unknowns only |
| `get_run_metadata` | capability, synthesis, `modelUsed`, provenance |

### 5. Provenance amendment (P1 — anti–evidence-theater)

**available** = installed · **verified** = signature + content digest checked · **used** = participated in this run.

Identifiers (`tarx-runtime` / `gpt-oss-20b`) are **component IDs**, never digests (`LOCAL_EXPECTED_COMPONENT_IDS_V1`).

| Component field | Meaning |
|-----------------|---------|
| `componentId` / `version` | Identifiers only |
| `contentDigest` | Actual sha256 when verified/used |
| `signerKeyId` | Required when used |
| `signatureStatus` | verified \| unavailable \| invalid \| not_applicable |
| `useStatus` | used \| available_not_used \| unavailable |

| # | Rule |
|---|------|
| 1 | Do not call mutable IDs “digests.” |
| 2 | **`deterministic_only`:** `baseModel` and `adapter` are **`null`** (not default IDs). |
| 3 | **`tarx_model_pack`:** used + verified signature + real contentDigest for model/adapter/packs. |
| 4 | Version/ID alone is insufficient provenance. |
| 5 | Capability: `runtime_verified` (assess may run) · `synthesis_verified` (may synthesize) · `synthesis_unavailable` (deterministic still ok) · `signature_invalid` (synthesis blocked, never fallback). |
| 6 | MCP: **stdio/local only**; every response `LocalMcpEnvelopeV1` with `visibility: local_only`, `shareability: never_automatic`; document client egress risk. |

### 6. Local input redaction

`validateLocalBriefTextInput` on intended-use/config before draft or MCP output — reject secrets/paths.

### 7. TARX Runtime + synthesis

```text
Securist Operator
  └── embedded TARX Runtime          (mandatory)
        ├── signed TARX Securist Model Pack   (when synthesis_verified)
        ├── Ollama / llama.cpp / vLLM adapters only
        ├── sandbox + tool permissions
        ├── LocalDecisionBriefV1 (local_only + honest provenance)
        └── no customer-private hub sync in WO-012
```

Product UX target:

```text
securist doctor
→ Runtime verified · synthesis unavailable · deterministic assess ready

securist assess .
→ Local Decision Brief
  N observed facts · M evidence gaps · not reviewed
  Model synthesis: not used
  Next: inspect gaps or connect local MCP
```

### 8. Hostile local input

No package installs, builds, shell evaluation, symlink traversal outside root.

### 9. Privacy

Local only; no hub sync; MCP is a data-egress boundary (stdio default).

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
- 2026-08-07: **Provenance/MCP amendment** — content digests vs IDs.  
- 2026-08-07: **P1 deeper correction** — available/verified/used; deterministic_only null model/adapter; capability states; stdio MCP envelope; input redaction.  
- 2026-08-07: Contracts merged to `main` (PR #17 · `d3065f1`). Product category locked (D-011).  
- 2026-08-07: **Implementation claimed** on `feat/wo-012-local-operator` — deterministic doctor/assess/stdio MCP.  
- 2026-08-07: **P1 trust boundary** — no fixture private key; public trust root only; dist/cli.js in signed set; monorepo-private package.  
- 2026-08-07: **Merged PR #19** (`89bf854`) — **internally shipped**. Not distribution-shipped (no public npx). Status `complete` for monorepo WO; human [`OPERATOR-RELEASE-LANE.md`](../../docs/OPERATOR-RELEASE-LANE.md) for public install.

## Blockers (post-WO, distribution)

- Human release-signed `runtime-identity.json` + deliberate package publish for public install.  
- Real signed TARX model pack (synthesis). R1 Team Graph is parallel paid track (WO-008).
