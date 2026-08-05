# System model — Decision Graph is canonical

**Every surface is a view of the Decision Graph.**  
`/models`, `/tools`, Scout, Activity, the daemon, Eve, and APIs must not invent parallel shapes.

## Authority sentence

| Role | Authority |
|------|-----------|
| **Decision Graph + policy engine** | Source of truth for trust, evidence, decisions |
| **Activity** | Read projection of durable facts — never an independent mutable ledger |
| **Eve** | Proposes candidate evidence and workflows only |
| **Local operator / TARX** | Signed minimized field evidence only |
| **Humans** | Approvals, overrides, external-write authorization |

## Canonical graph (relational, versioned edges first)

```text
Artifact
  └── ArtifactVersion
        ├── EvidenceRecord
        ├── ChangeEvent
        ├── PolicyEvaluation
        ├── ValidationRun
        ├── ContributionRecord
        └── Decision
               └── DecisionScope
```

No graph database until scale/query needs prove it necessary. See `migrations/001_decision_graph.sql` and `src/lib/decision-graph/`.

## Non-negotiable invariants

1. An approval always points to **one** artifact version, policy version, scope, and evidence set.
2. A later version **never** silently inherits an earlier approval.
3. Every automated claim has provenance and a verification state.
4. Every sensitive event is **tenant-scoped** before persistence.
5. Activity is a **read projection** of durable facts.
6. **LIVE** = current live source returned data; **SEED** = curated fallback; never conflate.
7. AI output is a **proposal or extracted candidate fact**, never an authoritative decision.
8. External writes require explicit policy permission **and** human approval.
9. Public profiles never expose private evidence, local paths, secrets, prompts, or customer data.

## Decision state machine (central)

```text
not_reviewed → watching → conditional → approved
approved → review_required → conditional | approved | paused
watching | conditional | approved | review_required → retired
not_reviewed | watching → paused
```

**Forced transition:** material source change, policy change, validation failure, expired review, or revoked evidence **must** create `review_required` (or equivalent re-open). It must **not** quietly leave the artifact `approved`.

Enforced in `src/lib/decision-graph/state-machine.ts`.

## Authority map (who may write what)

| Component | May write |
|-----------|-----------|
| Public Scout / Eve Scout | Observed public-source evidence and change **candidates** |
| Hugging Face Scout | Observed model metadata and change **candidates** |
| Local operator | Signed local validation evidence and **proposed** contributions |
| Policy engine | Deterministic **evaluations** only |
| Human reviewer | Decisions, approvals, overrides, external-write authorization |
| Activity projector | **No** source facts; read-only projection / outbox consumer |
| LLM / Eve planners | Structured **proposals** only; no direct durable decision writes |
| Eve gateway | Candidate evidence (`observed`), review tasks, draft proposals |

## Persistence

| Env | Store |
|-----|--------|
| Dev / demo (default) | Memory + seed fixtures (`SECURIST_GRAPH_STORE=memory\|seed`) |
| Prod (after RM-003) | Postgres (`SECURIST_GRAPH_STORE=postgres` + `DATABASE_URL`) via `migrations/001_decision_graph.sql` |

Factory: `src/lib/decision-graph/store.ts`.  
Postgres seam: `postgres-store.ts` (tenant-scoped R/W; transactional outbox).  
Outbox ensures durable writes and Activity projections cannot drift.

See `docs/INFRA-AUDIT-POSTGRES.md`.
