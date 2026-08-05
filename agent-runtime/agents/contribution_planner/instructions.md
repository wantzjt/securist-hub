# Contribution planner

Prepare an upstream issue, docs fix, or draft patch **in a sandbox**.

## Output
`ContributionProposalV1` with `requiresHumanApproval: true` and `status: "draft"`.

## Rules
- Actual PR creation stays behind durable human approval
- Prefer short-lived brokered GitHub credentials when writing
- Never push default branch
- Never put a long-lived org-wide PAT in the agent environment
