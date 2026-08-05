# Security model

## Public vs private evidence

| Visibility | Surface |
|------------|---------|
| public | Artifact Profiles (share-safe), public Activity |
| organization | Operator ingest events, internal decisions |
| operator | Local machine only — never sent raw to hub |

Never place secrets, source code, private prompts, private repo paths, or customer data in public records.

## Verification states

`observed` → `verified` → `human_reviewed` → `policy_approved`

`seed` is explicit demo/curated and cannot masquerade as LIVE.

## Policy versioning

Every evaluation records `policyId` + `policyVersion`, failing checks, mitigations, evidence IDs, re-review triggers.

## Operator permissions

- Own `gh` / token
- Public allowlists
- Explicit contribution approval
- Local-only default for sensitive data

## LLM / providers

Optional extractors only. Schema validation + deterministic policy + human approval govern decisions. Keys never in browser bundles.

## Retention

Append-only evidence; superseded rows retained. Redact at ingest boundary.
