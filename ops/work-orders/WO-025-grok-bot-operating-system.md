---
id: WO-025
title: "Grok Bot operating system + standup prompt"
status: in_progress
owner: grok
branch: docs/wo-025-grok-bot-os
depends_on:
  - WO-024
contracts: []
acceptance:
  - docs/GROK-BOT-OPERATING-SYSTEM.md defines Bot vs Build, MCP decision, daily loop
  - docs/GROK-BOT-STANDUP-PROMPT.md is paste-ready for Securist COS
  - SESSION-RESUME links both docs
  - No credentials, no announce, no R1, no npm
non_goals:
  - Building Securist MCP server in this WO
  - Standing up live Grok Bot accounts (founder)
  - External posts or marketing publishes
verification:
  - test -f docs/GROK-BOT-OPERATING-SYSTEM.md
  - test -f docs/GROK-BOT-STANDUP-PROMPT.md
  - npm run verify:coordination
  - npm run lint
---

# WO-025 — Grok Bot OS

## Progress

- 2026-08-12 — Claimed and drafted OS + standup prompt.

## Blockers

Founder installs Grok Bot and pastes standup prompt (human).
