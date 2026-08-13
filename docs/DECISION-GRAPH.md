# Decision Graph

> **Foundation gate:** Read `docs/SYSTEM-MODEL.md`, `CANONICAL-CONTRACTS.md`, `SURFACE-CONTRACTS.md`, `DECISION-LIFECYCLE.md`, and `OPERATIONS.md` first. The graph is canonical; every surface is a view.

Securist’s durable product is the **Decision Graph**:

```
artifact → evidence → policy → local validation → approval → upstream/downstream outcome
```

GitHub remains system of record for code/PRs. Securist is system of record for **why** an organization trusted an artifact and whether that decision is still valid.

Team Graph paid loop (owner + policy + evidence + re-review on one artifact) is **contract-frozen** in [`TEAM-GRAPH-CONTRACTS.md`](./TEAM-GRAPH-CONTRACTS.md) (WO-032) and **not live** until human-signed R1 (WO-008).

## Entities

See `migrations/001_decision_graph.sql` and `src/lib/decision-graph/types.ts`:

- artifacts, artifact_versions, artifact_sources
- evidence_records (append-only)
- policies, policy_evaluations
- decisions, validation_runs, contribution_records
- change_events, activity_events
- operator_agents, operator_ingest_nonces

## LIVE / HYBRID / SEED

| Mode | Meaning |
|------|---------|
| SEED | Explicit seed/demo data (`isSeed`, verification `seed`) |
| HYBRID | Mix of seed + observed public signals |
| LIVE | Observed/public or operator-authenticated signals only |

Seed rows **must never** render as LIVE org telemetry.

## Persistence

| Env | Adapter |
|-----|---------|
| Local (now) | Process memory + seed snapshot (`store.ts`) |
| Production target | Postgres-compatible via `migrations/` |

## Policy

`evaluatePolicy` in `policy.ts` is deterministic: license, provenance, model governance, security, crypto-agility, data boundary. LLM text is never a verified evidence source by itself.
