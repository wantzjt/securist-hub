---
id: WO-030
title: "Public Decision Brief GitHub Action (read-only)"
status: in_review
owner: grok
branch: feat/wo-030-public-brief-action
depends_on:
  - WO-029
contracts: []
acceptance:
  - GitHub Action using GITHUB_TOKEN only
  - Posts or updates ONE Brief comment on the PR (idempotent)
  - Honest labels: ephemeral, not production approval, Team Graph not live
  - Dogfood workflow on wantzjt/securist-hub
  - Rate-limit/failure documented
  - No private-code cloud assess; no scanner theater
non_goals:
  - Marketplace launch marketing
  - package registry publish
  - Team Graph live
  - Announce
  - Write access to repo contents or merging from the Action
verification:
  - workflow present under .github/workflows
  - rg for comment create or update (not spam) pattern
  - node scripts/public-decision-brief-lib.mjs
  - verify:coordination and lint
---

# WO-030

Public Decision Brief GitHub Action (read-only).

## Context

Public PRs need a lightweight, read-only Decision Brief posted or updated as a single PR comment. That dogfoods the Brief on the hub itself without write access to the repo tree or secrets beyond GITHUB_TOKEN for comments.

## Plan

- Composite action plus hub workflow (pull_request and workflow_dispatch)
- One marker comment, updated in place
- Honest ephemeral / not production approval / Team Graph not live copy
- Document rate-limit and failure (no invented briefs)

## Progress

- 2026-08-12 — Implementation on branch feat/wo-030-public-brief-action; PR open.

## Blockers

None.
