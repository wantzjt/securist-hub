# Internal system graph

`ops/system-graph.json` is the machine-checkable map of Securist's repository architecture.

It connects:

```text
authority → code path → invariant → automated check or human gate → value loop
```

It is deliberately **not** a second product data model. Customer and artifact truth remains in the canonical Decision Graph. This graph describes how this repository preserves that authority.

## Why it exists

- A surface cannot quietly become a second ledger.
- A projection or AI proposal must trace back to the Decision Graph.
- Every canonical invariant has a stable ID (`INV-001`–`INV-009`) and an enforcement path.
- "Implemented," "SEED," "blocked," and "production active" cannot be casually conflated.
- The product value loop exposes the missing links instead of hiding them behind a busy UI.

## What CI proves

`npm run verify:system-graph` proves that graph references, repository paths, invariant IDs, verification commands, and authority dependencies are internally consistent.

`npm run verify:clean-worktree` proves that a verification run did not leave tracked or non-ignored untracked changes behind. CI runs it immediately after checkout and again after build and verification.

Neither command proves live infrastructure, customer isolation, or a human approval. Those remain explicit human checks in the graph.

## Change rule

Any PR that changes a canonical contract, state transition, store boundary, public projection, AI authority, or external-write boundary must update the system graph when its dependency or enforcement map changes. CI rejects dangling paths, unknown checks, duplicate authority, projection/proposal nodes that do not depend on the canonical Decision Graph, and authority-sensitive source files without exactly one graph owner. Contract, migration, and state-machine changes require regression tests; prose alone is not proof.

## Agent preflight

Before claiming work:

```bash
git fetch origin --prune
npm run verify:clean-worktree
git switch main
git pull --ff-only
npm run verify:clean-worktree
git switch -c <work-order-branch>
```

After implementation, commit intentionally and run the complete verification suite from a clean branch tip. Do not carry uncommitted files from one work order into another.
