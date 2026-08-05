# Eve runtime placement (Securist)

## Rule

**Eve agents may propose. Securist contracts decide. Humans approve external writes.**

Eve orchestrates **cloud-side research and approval workflows**. Eve is **not**:

- the Decision Graph
- the policy engine
- the local operator / TARX runtime

Eve is beta — keep responsibilities behind `@securist/contracts` and hub gateways. Do not build the product around Eve-specific state.

## Topology

```
Securist Hub (tarx/securist-hub)
  ├─ Artifact Profiles, Activity, approvals UI
  ├─ Decision Graph + policy engine + durable DB
  └─ Typed internal API / outbox
                ↑
                │ candidate evidence, proposals, review tasks
                │
Eve Agent Runtime (separate internal Vercel deploy — TARX team)
  ├─ scheduled Scout runs
  ├─ source change analysis
  ├─ evidence normalization
  ├─ local-validation recipe proposals
  └─ draft PR / contribution planning (sandbox)
                ↑
                │ signed, minimized field evidence
                │
TARX / local operator
  ├─ local model execution
  ├─ private-data validation
  ├─ approved package/model pulls
  └─ no raw private data leaves the machine
```

## Five specialists

| Agent | May write to Securist | Must not |
|-------|----------------------|----------|
| **scout** | Candidate evidence (public allowlists) | Mutate approvals; private access |
| **change_analyst** | Drift explanations | Auto-stale without policy re-run |
| **policy_explainer** | Plain-English failure summaries | Override verdicts |
| **validation_planner** | Local test plan + boundary | Execute on private data |
| **contribution_planner** | Draft proposals (`requiresHumanApproval: true`) | Create upstream PR alone |

Isolated subagent contexts are **not** a security boundary. Write tools still need approval + authorization. Prefer short-lived brokered GitHub credentials for writes.

## Contracts

Package: `packages/contracts` → `@securist/contracts` (v0.1)

- `CandidateEvidenceV1`
- `ReviewTaskV1`, `ValidationPlanV1`, `ContributionProposalV1`
- `SignedValidationSummaryV1` (local/TARX → hub)

Hub gateway: `src/lib/eve-gateway/gateway.ts`

- elevates Eve evidence only to **`observed`**
- re-runs **deterministic** `evaluatePolicy`
- may open **review tasks** and set artifact status to watching / conditional / paused
- **never** sets `policy_approved` or final human approval

## Vertical slice

```
Watched artifact changes
→ Eve Scout records candidate evidence
→ deterministic policy detects re-review trigger
→ Eve drafts plain-English explanation + local test plan
→ Artifact Profile shows Review required / Watching
→ human approves local validation
→ TARX/local worker returns signed summary
→ human approves upstream PR or downstream adapter
```

Demo (no live Eve process): server fn `runEveVerticalSliceDemo`.

## Deployment

| Surface | Vercel |
|---------|--------|
| Public hub + API | **tarx/securist-hub** (existing) |
| Eve agent runtime | Separate internal project under **TARX** team (to add) |
| Share | `@securist/contracts` only |

Scope lock: always `--scope tarx`. Never Hobby (`tarx-75a403e7`).

## Moat

Versioned Decision Graph + evidence history — not “we have agents.”
