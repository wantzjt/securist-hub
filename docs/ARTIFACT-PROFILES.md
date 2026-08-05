# Artifact Profiles

Shareable, human-readable decision surfaces for each tracked artifact.

## Routes

| Path | Content |
|------|---------|
| `/artifacts` | Catalog |
| `/artifacts/$id` | Decision brief + technical evidence |
| `/artifacts/$id/activity` | Material-change timeline |
| `/artifacts/$id/evidence` | Append-only evidence list |

## Layer 1 — Decision at a glance

Status, purpose, use boundary, what changed, review owner/date, evidence coverage chips, plain-language risk and action, Copy page.

**Do not** label “compliant” just because a field exists. Use **evidence coverage**.

## Layer 2 — Technical

Canonical source, policy evaluation trail, evidence records, local validation summaries, contribution links, related packages.

## Linking from discovery

`/tools` and `/models` remain catalogs; they should deep-link into profiles as adapters mature.
