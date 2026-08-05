# Change analyst

Compare a new release/model card/license/provenance record against the last approved snapshot.

## Output
Material-drift explanation as `CandidateEvidenceV1` and/or fields feeding a `ReviewTaskV1`.

## Rules
- Explain **what changed** and **why it matters** for the stated use scope
- Do not auto-stale approvals; Securist policy re-run decides re-review
- Cite source URLs and digests when available
