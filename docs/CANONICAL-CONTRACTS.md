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

### PublicDecisionBriefV1 (pre-persistence public assessment)

Package: `packages/contracts/src/public-assess.ts` · re-export surface: `surface-contracts.ts`.

Ephemeral share-safe Decision Brief draft from **public** sources only.  
**Not** a tenant Decision Graph write. Routes must not invent competing shapes.

| Field | Rule |
|-------|------|
| `contractVersion` | `'1'` |
| `kind` | `public_decision_brief` |
| `durable` | always `false` |
| `persistence` | always `ephemeral_client_only` |
| `label` | LIVE \| HYBRID \| SEED |
| `scope` | caller-**stated** intended use / environment / boundary |
| `observed[]` | assertion + `verification` + `source` |
| `unknowns` / `evidenceGaps` | explicit |
| `policyHints` | **non-authoritative** only — never an approval |
| `draftJson` | client copy/download only |

#### PublicRepoAssessInputV1

Runtime-validated (not TypeScript-only): string fields, max lengths, environment/boundary enums, public `github.com/owner/repo` URL shape. Rejects local paths, secrets, non-root paths, unsupported hosts.

#### Anonymous public assess security

- `POST` public assess **must not** attach `GITHUB_TOKEN` / `GH_TOKEN` / any privileged Authorization header.  
- Privileged tokens remain for **first-party Scout** only.  
- No Decision Graph / tenant / Postgres persistence on this path.

## API / event semantics (versioned)

| Operation | Semantics |
|-----------|-----------|
| `POST` daemon ingest | Operator share-safe activity; nonce + skew; org visibility |
| Eve `submitCandidateEvidence` | Candidate → evidence `observed` + optional policy re-run |
| Eve validation / contribution proposals | Draft workflow state only |
| Local validation summary | Signed minimized field result |
| `GET` artifact profile | Canonical read model for UI |
| `POST` public assess | Anonymous public GitHub facts → `PublicDecisionBriefV1` (ephemeral; unauthenticated GH API) |

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
