# Re-review on material change (WO-033)

**Status:** Loop implemented against postgres Decision Graph · Team Graph product **not live**  
**Date:** 2026-08-13  
**Work order:** WO-033

North-star: *material change → permission reopens → accountable re-review.*

This is **not** paid Team Graph GA. `/team` stays Coming next. Broad launch copy remains HOLD. WO-008 human exit remains open.

## Fail-closed gate

The loop runs only when `SECURIST_GRAPH_STORE=postgres`. Memory/seed returns `graph_store_not_postgres`. There is no in-memory live loop.

## One-artifact loop (owner / policy / evidence / re-review)

On a material change for one artifact:

1. Load artifact (named `reviewOwner`), latest decision (policy binding), evidence set.
2. Apply `applyMaterialTrigger` → `review_required` (permission reopens).
3. Persist `change_events` (`re_review_trigger=true`), update artifact/decision status, project activity.
4. Return an audit trail: **what changed**, **which policy**, **who must re-approve**.

Agents may draft. Named humans sign.

## Owner path

| Actor | Signs |
|-------|--------|
| **John** | WO-008 R1 exit, public launch copy, registry publish |
| **COS** | Product-truth checklist (Briefs, packs, public claims vs SESSION-RESUME) |
| **Build** | Loop implementation, fail-closed tests, no `/team` live flip |

## Product-truth checklist (COS)

1. Brief surface still matches SESSION-RESUME (no Team Graph live claim)
2. Admission packs still say Team Graph is not live
3. Public copy `/team` remains Coming next
4. R1 Postgres provisioned (infra) is not Team Graph live
