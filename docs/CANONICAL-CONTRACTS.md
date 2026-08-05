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

## API / event semantics (versioned)

| Operation | Semantics |
|-----------|-----------|
| `POST` daemon ingest | Operator share-safe activity; nonce + skew; org visibility |
| Eve `submitCandidateEvidence` | Candidate → evidence `observed` + optional policy re-run |
| Eve validation / contribution proposals | Draft workflow state only |
| Local validation summary | Signed minimized field result |
| `GET` artifact profile | Canonical read model for UI |

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
| `not_found` | Unknown artifact |
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
