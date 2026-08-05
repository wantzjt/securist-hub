# Decision lifecycle

## Goal

Prevent silent inheritance of trust across versions and prevent “approved” from surviving material drift.

## Statuses

| Status | Meaning |
|--------|---------|
| `not_reviewed` | In catalog; no decision yet |
| `watching` | Under observation; not approved for production-style use |
| `conditional` | Allowed with open mitigations |
| `approved` | Bound to **one** version + policy version + scope + evidence set |
| `review_required` | Must re-open trust; previous approval is stale |
| `paused` | Hold use until risk resolved |
| `retired` | End of life for this decision scope |

## Transitions (enforced)

```text
not_reviewed → watching → conditional → approved
approved → review_required → conditional | approved | paused
watching | conditional | approved | review_required → retired
not_reviewed | watching → paused
* → review_required   (when material trigger fires — never stay approved quietly)
```

Illegal transitions throw / return `transition_denied`.

## What forces `review_required`

- Material source change (version/digest/license/model-card drift)  
- Policy version change affecting this scope  
- Validation failure  
- Expired review date  
- Revoked or superseded critical evidence  

## Approval basis (required fields)

A durable approval records:

1. Artifact ID  
2. **ArtifactVersion** ID  
3. Policy ID + **version**  
4. **DecisionScope**  
5. Evidence set (IDs / content hashes)  
6. Owner + review/expiry date  

A new ArtifactVersion starts without that approval.

## Human steps

1. Review Artifact Profile brief  
2. Approve local validation plan (if needed)  
3. Accept signed local validation summary  
4. Explicitly authorize external write (PR/adapter)  

Eve and LLMs may draft text for (1)–(4); they may not complete (4) alone.
