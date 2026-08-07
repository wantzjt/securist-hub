# Canonical contracts

Versioned types shared by hub, Eve runtime, and local operators.  
Package: `packages/contracts` (`@securist/contracts`).  
Hub domain: `src/lib/decision-graph/types.ts`.

## Core types

### ArtifactRef
- stable ID  
- kind: `repo | model | dataset | dependency | release | crypto_component | package`  
- canonical provider + URL  
- public/private visibility  

### ArtifactVersion
- immutable version / commit / tag / digest / revision  
- observed timestamp  
- **Approvals bind to a version; never inherit silently**

### EvidenceRecord
- source, assertion type/domain, source URL, observed time, content hash  
- verification: `observed | verified | human_reviewed | policy_approved | seed`  
- **never overwrite; supersede with a new record**

### Policy
- policy ID, version, scope, deterministic rules  

### PolicyEvaluation
- policy version, result, explanation, evidence references, evaluated time  

### Decision
- status: `not_reviewed | watching | conditional | approved | review_required | paused | retired`  
- scope (`DecisionScope`), owner, review date, approval basis (evaluation + evidence set)  

### DecisionScope
- organization/workspace  
- environment: research | development | staging | production  
- intended use  
- data classification: public | internal | restricted  
- deployment boundary: local_only | controlled_cloud | external_service  

### ValidationRun
- recipe/version, artifact version, runtime/model/tool versions  
- boundary + data classification  
- **result summary only** — never raw sensitive data by default  

### ContributionRecord
- upstream issue/PR/commit reference  
- intent, compatibility, human approval  

### ChangeEvent
- exact before/after fingerprint  
- materiality category and re-review trigger  

### ActivityEvent
- **projection** of graph changes for UI — never the source of truth  

### DecisionBriefHonestyV1 (shared envelope)

Package: `packages/contracts/src/decision-brief.ts`.

Common honesty fields for **every** Decision Brief draft (public or local):

| Field | Rule |
|-------|------|
| `contractVersion` | `'1'` |
| `durable` | `false` for pre-R1 drafts (not a tenant Decision Graph write) |
| `label` | LIVE \| HYBRID \| SEED |
| `decisionStatus` | Drafts start `not_reviewed` |
| `observed[]` | assertion + `verification` + `source` (provenance required) |
| `unknowns` / `evidenceGaps` / `reReviewTriggers` | explicit |
| `policyHints` | **non-authoritative** only — never an approval |
| `disclaimers` | honesty about scope |

Surfaces must not invent competing honesty shapes. Visibility and shareability are **not** honesty fields—they differ by brief kind.

### PublicDecisionBriefV1 (public assessment only)

Package: `packages/contracts/src/public-assess.ts` · re-export: `surface-contracts.ts`.

Ephemeral **share-safe** Decision Brief from **public** sources only (web `/assess`).  
**Do not reuse for local repository evidence** (WO-012 → `LocalDecisionBriefV1`).

| Field | Rule |
|-------|------|
| `kind` | `public_decision_brief` |
| `persistence` | always `ephemeral_client_only` |
| `repository` | Public GitHub facts only |
| `scope` | caller-**stated** intended use / environment / boundary |
| `draftJson` | client copy/download only |

#### PublicRepoAssessInputV1

Runtime-validated (not TypeScript-only): string fields, max lengths, environment/boundary enums, public `github.com/owner/repo` URL shape. Rejects local paths, secrets (including `intendedUse`), non-root paths, unsupported hosts.

#### Anonymous public assess security

- `POST` public assess **must not** attach `GITHUB_TOKEN` / `GH_TOKEN` / any privileged Authorization header.  
- Privileged tokens remain for **first-party Scout** only.  
- No Decision Graph / tenant / Postgres persistence on this path.

### LocalDecisionBriefV1 (local Operator assessment)

Package: `packages/contracts/src/local-assess.ts` · re-export: `surface-contracts.ts`.

Private local evidence from manifests/config via `securist assess .` (WO-012).  
**Not** public/share-safe. Reusing `PublicDecisionBriefV1` would create a false privacy promise.

| Field | Rule |
|-------|------|
| `kind` | `local_decision_brief` |
| `persistence` | always `local_only` |
| `shareability` | `never_automatic` |
| `visibility` | `local_only` |
| Hub persist | **Never** in WO-012 |
| Default body | No raw source, secrets, or **absolute** local paths |
| `repository` | Minimized identity (`rootLabel: '.'`, fingerprints, package meta) |
| `provenance` | `LocalRunProvenanceV1` — **content digests**, not product labels |
| `synthesis` | `deterministic_only` or `tarx_model_pack` after `securist doctor` — never silent cloud/unsigned fallback |

#### Provenance rules (six-item lock)

Mutable labels such as `gpt-oss-20b` or `tarx-runtime-v1` are **not** content digests and do **not** prove a model or pack was used.

| # | Rule |
|---|------|
| 1 | **Label ≠ digest.** Each component has `label` (display only) and optional `contentDigest` (`sha256` hex of bytes). |
| 2 | **`used=true` requires proof.** `verification: content_verified` and non-null `contentDigest`. |
| 3 | **`deterministic_only` forbids model-use claims.** `baseModel` and `adapter` must be `used: false`, `contentDigest: null`, `verification: not_used`. |
| 4 | **`tarx_model_pack` requires verified model bytes.** `baseModel` and `adapter` must be used + `content_verified`. |
| 5 | **MCP `modelUsed`** is true only under rule 4; always false for `deterministic_only`. |
| 6 | **MCP `get_run_metadata`** returns `LocalMcpRunMetadataV1` (synthesis + provenance + `modelUsed`) — never a map of label strings pretending to be digests. |

Helpers: `assertLocalProvenanceHonesty`, `toLocalMcpRunMetadata`, `componentNotUsed`, `componentContentVerified`.  
Default **labels** only: `LOCAL_DEFAULT_COMPONENT_LABELS_V1` (deprecated alias `LOCAL_DEFAULT_DIGESTS_V1` — do not treat as digests).

#### Local Operator + MCP rules

| Rule | Requirement |
|------|-------------|
| TARX Runtime | Mandatory embed; adapters (Ollama / llama.cpp / vLLM) only |
| Baseline | Deterministic manifest collection without LLM |
| Synthesis | Signed TARX Model Pack only after doctor; explicit failure if insufficient |
| MCP allowlist | `get_brief`, `list_gaps`, `get_run_metadata` only |
| MCP `get_run_metadata` | `LocalMcpRunMetadataV1` with honest provenance (rules 1–6) |
| MCP forbidden | raw source/paths, approve, exploit, execute, install, build, shell, external writes |
| Hostile input | No installs/builds/shell; no symlink traversal outside target root |
| Sharing | Explicit future export/redaction only — not WO-012 |

Constants: `LOCAL_MCP_TOOLS_V1`, `LOCAL_MCP_FORBIDDEN_V1`, `LOCAL_DEFAULT_COMPONENT_LABELS_V1`.

## API / event semantics (versioned)

| Operation | Semantics |
|-----------|-----------|
| `POST` daemon ingest | Operator share-safe activity; nonce + skew; org visibility |
| Eve `submitCandidateEvidence` | Candidate → evidence `observed` + optional policy re-run |
| Eve validation / contribution proposals | Draft workflow state only |
| Local validation summary | Signed minimized field result |
| `GET` artifact profile | Canonical read model for UI |
| `POST` public assess | Anonymous public GitHub facts → `PublicDecisionBriefV1` (ephemeral; unauthenticated GH API) |
| Local `securist assess .` | Local manifests → `LocalDecisionBriefV1` (`local_only`; no hub persist; no absolute paths in default output) |
| Local MCP | Read-only `get_brief` / `list_gaps` / `get_run_metadata` on minimized local brief |

### Requirements at every write boundary

- schema validation  
- idempotency key (nonce / content hash)  
- event ID, timestamp, actor type, tenant scope  
- signed operator requests where applicable  
- explicit error codes  
- backwards-compatible contract versions  
- **no** browser access to provider/DB secrets  

## Error codes (examples)

| Code | Meaning |
|------|---------|
| `contract` | Invalid contract version/kind |
| `schema` | Malformed public assess (or similar) input |
| `invalid_url` | Public assess URL rejected |
| `not_found` | Unknown artifact / non-public repository |
| `private_repo` | Private repository rejected for anonymous assess |
| `rate_limited` | Upstream API rate limit |
| `nonce_replay` | Duplicate ingest |
| `redaction` | Private material detected |
| `transition_denied` | Illegal decision state transition |
| `auth_failed` | Secret/signature rejected |

## LIVE / SEED

| Term | Meaning |
|------|---------|
| LIVE | A current live source returned data this fetch |
| HYBRID | Mix of live + seed/curated |
| SEED | Curated fallback / demo — must be labeled |

## AI / Eve

Structured proposals and extracted **candidate** facts only.  
Never an authoritative decision write.
