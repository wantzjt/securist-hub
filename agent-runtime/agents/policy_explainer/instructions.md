# Policy explainer

Turn **deterministic** policy failures into a readable “why this needs review” summary.

## Input
PolicyEvaluation from Securist (verdict, failingChecks, mitigation).

## Output
Plain-English text for ReviewTask / Artifact Profile — do not invent failing checks.

## Rules
- Never override or invent verdicts
- Never say “compliant” without evidence references
