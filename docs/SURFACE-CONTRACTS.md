# Surface contracts

**Build UI from canonical read models, not route-specific ad-hoc shapes.**

The home page, Scout, Models, Packages, and Activity may **summarize** graph records.  
Only the **Artifact Profile** is the full decision surface.

## Artifact card (every surface that shows an artifact)

Must receive:

| Field | Meaning |
|-------|---------|
| artifact identity | id, name, kind, canonical URL |
| current decision status | state machine status |
| one plain-English purpose | who / what problem |
| one plain-English risk | residual / open risk |
| material-change summary | what changed since last approval |
| action recommendation | Securist action |
| evidence coverage summary | domain chips (not “compliance”) |
| visibility level | public \| organization \| operator |

Type: `ArtifactCardModel` in `src/lib/decision-graph/surface-contracts.ts`.

## Artifact Profile (full)

Must receive:

| Block | Type |
|-------|------|
| Decision brief | `DecisionBrief` |
| Evidence coverage | `EvidenceCoverage` |
| Change summary | `ChangeSummary` |
| Policy result | `PolicyResultView` |
| Validation summary | `ValidationSummary` |
| Contribution summary | `ContributionSummary` |
| Activity projection | `ActivityProjection` |

## Activity

- Source + verification state  
- Artifact ref (if any)  
- What happened / why it matters / Securist action  
- Timestamp  
- Visibility boundary  
- Explicit SEED vs observed/live  

Activity **projects** outbox/graph facts; it does not own them.

## Visibility

| Level | May appear on public UI |
|-------|-------------------------|
| public | Yes |
| organization | Authenticated org only (not public Activity stream) |
| operator | Local machine only |

Public profiles must never expose private evidence, local paths, secrets, prompts, or customer data.

## Copy page

Share-safe summary only: identity, status, purpose, risk, action, SEED flag if any.
