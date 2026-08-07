---
id: WO-018
title: "Local Operator release-candidate proof"
status: in_review
owner: grok
branch: ops/wo-018-operator-rc-proof
depends_on:
  - WO-012
contracts: []
acceptance:
  - Human with offline signing key runs one documented command → verifiable RC
  - Clean-machine verifier runs local golden path successfully
  - Unsigned/tampered runtime still blocks assess
  - No public npx @securist/operator claim until human publish gate
  - Full regression suite, system-graph, clean-worktree
non_goals:
  - npm publish or public npx enablement
  - Committing private signing keys
  - Vercel mutation, cloud fallback, accounts, Graph writes, Team Graph
  - Website/marketing surface work
  - R1 Postgres provision (human WO-008)
verification:
  - npm run operator:rc:preflight
  - npm run operator:rc:dogfood
  - npm run test:operator-rc
  - npm run test:operator
  - npm run lint
  - npm run typecheck
  - npm run test:lifecycle
  - npm run test:graph
  - npm run test:public-assess
  - npm run test:decision-brief-contracts
  - npm run test:product-surface
  - npm run operator:build
  - npm run build
  - npm run verify:coordination
  - npm run verify:release-readiness
  - npm run verify:system-graph
  - npm run verify:clean-worktree
---

# WO-018 — Local Operator release-candidate proof

## Golden path (product loop)

```text
Public repository → honest Decision Brief              LIVE
  → private Local Operator                             THIS WO (RC proof; not npm-shipped)
  → shared decision + owner + policy                   NOT LIVE (R1 / WO-008)
  → material change reopens review                     NOT LIVE
```

## What shipped

| Command | Role |
|---------|------|
| `npm run operator:rc:preflight` | Non-secret automated checks (build, digest, unsigned fail-closed, test:operator) |
| `SECURIST_OPERATOR_SIGNING_KEY=… npm run operator:rc` | **Human one-shot** signed RC under `.operator-rc/` |
| `npm run operator:rc:dogfood` | Ephemeral-key RC + clean verify (CI / agent evidence) |
| `npm run operator:rc:verify-clean` | Clean-machine golden path against a packed RC |

## After this WO

**Stop for human authority:**

1. Sign + clean-machine verify Operator with offline key  
2. Provision R1 Postgres (WO-008)  
3. Narrow Team Graph workflow: owner + policy + evidence + re-review for one artifact  

No announcement until that loop is brilliant.
