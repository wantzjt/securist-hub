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
| `provenance` | `LocalRunProvenanceV1` — see provenance lock below |
| `capability` | `runtime_verified` \| `synthesis_verified` \| `synthesis_unavailable` \| `signature_invalid` |
| `synthesis` | `deterministic_only` or `tarx_model_pack` |

#### Availability vs verification vs use

| Term | Meaning |
|------|---------|
| **available** | Pack/runtime is installed (`useStatus: available_not_used` or `used`) |
| **verified** | Signature checked (`signatureStatus: verified`) and `contentDigest` recorded |
| **used** | This exact component participated in this run (`useStatus: used`) |

Identifiers such as `tarx-runtime` / `gpt-oss-20b` are **component IDs** (see `LOCAL_EXPECTED_COMPONENT_IDS_V1`) — **never** cryptographic digests.

#### Component provenance shape

| Field | Rule |
|-------|------|
| `componentId` | Product identity (not a hash) |
| `version` | Version string (not a hash) |
| `contentDigest` | `{ algorithm: 'sha256', hex }` when verified/used; else null |
| `signerKeyId` | Required when used |
| `signatureStatus` | `verified` \| `unavailable` \| `invalid` \| `not_applicable` |
| `useStatus` | `used` \| `available_not_used` \| `unavailable` |

#### Provenance + synthesis rules (P1 lock)

| # | Rule |
|---|------|
| 1 | **IDs ≠ digests.** Do not call `tarx-runtime-v1` / `gpt-oss-20b` “digests.” |
| 2 | **`deterministic_only`:** `baseModel` and `adapter` must be **`null`** — not default IDs, not placeholders. |
| 3 | **`tarx_model_pack`:** non-null model/adapter with `useStatus: used`, `signatureStatus: verified`, real `contentDigest`. |
| 4 | **Version/IDs alone are insufficient** provenance for a used component. |
| 5 | **Capability:** `runtime_verified` → assess may run; `synthesis_verified` → pack may synthesize; `synthesis_unavailable` → deterministic still succeeds; `signature_invalid` → synthesis blocked, **never** fallback. |
| 6 | **MCP** is a data-egress boundary: **stdio/local only** in WO-012; every response includes `visibility: local_only`, `shareability: never_automatic`, `transport: stdio_local`; document that a user-selected client may transmit summaries externally. |

#### Local input redaction

Any `intendedUse` / config text included in `LocalDecisionBriefV1` or MCP output must pass `validateLocalBriefTextInput` (reject secrets/paths) before draft emission.

#### Local Operator + MCP rules

| Rule | Requirement |
|------|-------------|
| TARX Runtime | Mandatory embed; adapters (Ollama / llama.cpp / vLLM) only |
| Baseline | Deterministic manifest collection without LLM |
| MCP transport | `stdio_local` only — no HTTP/remote default |
| MCP envelope | `LocalMcpEnvelopeV1` on every tool response |
| MCP allowlist | `get_brief`, `list_gaps`, `get_run_metadata` |
| MCP forbidden | raw source/paths, approve, exploit, execute, install, build, shell, external writes |
| Hostile input | No installs/builds/shell; no symlink traversal outside target root |

Helpers: `assertLocalProvenanceHonesty`, `toLocalMcpRunMetadata`, `toLocalMcpBriefResponse`, `wrapLocalMcpResponse`, `componentUsedVerified`, `validateLocalBriefTextInput`.


### TeamGraph*V1 (paid shared memory — PRE-R1 freeze)

Package: `packages/contracts/src/team-graph.ts`. Pack: [`TEAM-GRAPH-CONTRACTS.md`](./TEAM-GRAPH-CONTRACTS.md) (WO-032).

Frozen one-artifact loop: **Decision · owner · policy · evidence · re-review request**.
`live: false`, `durable: false`, `persistence: stub_not_live`. **Not live until R1.**
R1/Postgres is **John-only (WO-008)**. Stub API never writes and never reads connection-string env.

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
| Team Graph stub GET/POST | Always `team_graph_not_live` / `coming_next` illustration — **not** a durable Decision Graph write (WO-032) |

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
| `rate_limited` | Upstream API rate limit (anonymous public assess: unauthenticated GitHub) |
| `timeout` | Upstream did not respond within configured abort timeout |
| `upstream_unavailable` | Network failure or upstream 5xx |
| `github_error` | Other non-success GitHub response on public assess |
| `nonce_replay` | Duplicate ingest |
| `redaction` | Private material detected |
| `transition_denied` | Illegal decision state transition |
| `auth_failed` | Secret/signature rejected |

Public assess resilience bounds (timeout, fact-cache TTL/size) live in
`PUBLIC_ASSESS_RESILIENCE_V1` — not an SLA. Human checklist:
`docs/PUBLIC-ASSESS-RATE-CONTROL.md`.

## LIVE / SEED

| Term | Meaning |
|------|---------|
| LIVE | A current live source returned data this fetch |
| HYBRID | Mix of live + seed/curated |
| SEED | Curated fallback / demo — must be labeled |

## AI / Eve

Structured proposals and extracted **candidate** facts only.  
Never an authoritative decision write.


### North-star re-review loop (WO-033)

Package: `packages/contracts/src/re-review-loop.ts`.

Material change reopens permission (`review_required`) against a **postgres** Decision Graph only. Fail-closed (`graph_store_not_postgres`) on memory/seed. Audit trail: what changed, policy id/version, named human who must re-approve. Team Graph product surface remains **not live**.
