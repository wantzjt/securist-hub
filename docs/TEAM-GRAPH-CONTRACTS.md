# Team Graph contracts — PRE-R1 freeze (WO-032)

**Status:** Frozen · **not live**  
**Date:** 2026-08-12  
**Owner (contracts):** Grok Build  
**Durability / R1 / Postgres:** **John-only (WO-008)** — Grok Build does not stand up production durability in this WO.

Team Graph product remains **not live**. R1 Postgres store may be provisioned (infra); that is not paid Team Graph GA. Human WO-008 exit remains open. This pack freezes types, API stubs, and honesty labels so Build and COS stop drifting. It does **not** activate R1.

```text
Public Assess (/assess)                 LIVE
Local Operator                          LIVE (monorepo + signed RC Path B)
Team Graph / R1                         NOT LIVE (human Postgres only)
```

---

## Frozen shapes (one artifact)

Match existing roadmap language: _owner + policy + evidence + re-review for one artifact_.

| Contract                     | Kind                           | Notes                                                             |
| ---------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `TeamGraphDecisionV1`        | `team_graph_decision`          | Statuses from Decision lifecycle. `live: false`, `durable: false` |
| `TeamGraphOwnerV1`           | `team_graph_owner`             | Named accountable human; agents may draft, never sign             |
| `TeamGraphPolicyBindingV1`   | `team_graph_policy_binding`    | Policy id + version — not an approval                             |
| `TeamGraphEvidenceRefV1`     | `team_graph_evidence_ref`      | Append-only evidence set; never overwrite                         |
| `TeamGraphReReviewRequestV1` | `team_graph_re_review_request` | Material change reopens trust                                     |

Package: `packages/contracts/src/team-graph.ts`.  
Honesty envelope: `TEAM_GRAPH_HONESTY_V1` (`coming_next` / `stub_not_live` / `r1Gate: human_wo_008`).

Re-review triggers (frozen): `material_version` · `license` · `boundary` · `policy_version` · `evidence_superseded` · `review_expired`.

---

## Stub API (not live)

Server functions in `src/lib/activity-api.ts` delegate to `src/lib/team-graph-stub.ts`.

| Op               | Function                | Behavior                                        |
| ---------------- | ----------------------- | ----------------------------------------------- |
| GET status       | `getTeamGraphStatus`    | Returns `coming_next` illustration. Never LIVE. |
| GET one artifact | `getTeamGraphArtifact`  | Always `team_graph_not_live`                    |
| POST re-review   | `postTeamGraphReReview` | Always `team_graph_not_live`. **No write.**     |

Stubs **must not** read `DATABASE_URL` / `SECURIST_DATABASE_URL` / `SECURIST_GRAPH_STORE` and **must not** call the Decision Graph store.

UI: `/team` stays **Coming next / not live**. Zero LIVE Team Graph claims.

---

## Migration notes for WO-008 (handoff — do not apply here)

Existing schema `migrations/001_decision_graph.sql` already maps the freeze:

| Frozen contract  | 001 table / column                                                           |
| ---------------- | ---------------------------------------------------------------------------- |
| Owner            | `artifacts.review_owner` · `decisions.decided_by`                            |
| Policy           | `policies` · `policy_evaluations` · `decisions.policy_id` / `policy_version` |
| Evidence         | `evidence_records` (append-only) · `decisions.evidence_ids`                  |
| Decision         | `decisions` (version-bound via `artifact_version_id` + scope)                |
| Re-review signal | `change_events.re_review_trigger`                                            |

**Not applied in WO-032:** no `002_*.sql`, no psql, no env mutation.

**Optional additive (John / WO-008 only, after provision authority):** a first-class `re_review_requests` table if request audit must outlive `change_events`. Not required to flip R1 on with this freeze. Default: persist Decisions / owner / policy / evidence with `001` as-is.

Rollback remains: `SECURIST_GRAPH_STORE=memory` then redeploy. See [`R1-READINESS-PACK.md`](./R1-READINESS-PACK.md).

---

## Honesty boundaries

- Team Graph is **not live until R1**.
- R1 / Postgres is **John-only (WO-008)**.
- No package registry publish. No announce. No silent live endpoints.
- Illustration Decision status is `not_reviewed` and evidence verification is `seed`.
- WO-033 north-star loop runs fail-closed against postgres (infra). Team Graph product stays **not live**. `/team` remains Coming next. Do not fake an in-memory live loop.

---

## Verification

```bash
npm run test:team-graph-contracts
npm run test:product-surface
npm run verify:coordination
npm run lint
```
