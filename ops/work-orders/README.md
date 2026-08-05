# Work orders

Canonical unit of agent-coordinated work in this repository.

- **One work order** maps to **one active implementation branch**.  
- **No concurrent agents** on the same work order.  
- Status and acceptance in the work-order file are source of truth — not chat.

## Statuses

| Status | Meaning |
|--------|---------|
| `proposed` | Drafted; not ready to start |
| `ready` | Dependencies clear; may be claimed |
| `in_progress` | Single owner + branch active |
| `in_review` | PR open; awaiting Codex/human |
| `blocked` | Waiting on dependency, decision, or human gate |
| `complete` | Merged / accepted; leave file for history |

## File naming

```text
ops/work-orders/WO-NNN-short-kebab-title.md
```

## Front matter (required)

```yaml
---
id: WO-001
title: Short human title
status: ready
owner: unassigned
branch: ""
depends_on: []
contracts: []
acceptance:
  - Measurable done criterion
non_goals:
  - Explicit out of scope item
verification:
  - Command or check that proves acceptance
---
```

| Field | Rules |
|-------|--------|
| `id` | `WO-` + digits (unique) |
| `title` | Non-empty string |
| `status` | One of the statuses above |
| `owner` | `unassigned` \| `grok` \| `codex` \| `human` \| named person |
| `branch` | Git branch when `in_progress` or `in_review`; else `""` |
| `depends_on` | List of WO ids (e.g. `WO-001`) |
| `contracts` | Paths or contract names touched (e.g. `docs/CANONICAL-CONTRACTS.md`) |
| `acceptance` | Non-empty list of criteria |
| `non_goals` | Non-empty list (force explicit exclusion) |
| `verification` | Non-empty list of commands/checks |

## Body

After front matter, document:

1. Context / problem  
2. Plan (bullets)  
3. Progress notes (append-only)  
4. Blockers  

## Claiming

1. Ensure `status` is `ready` and dependencies are `complete`.  
2. Set `owner`, `branch`, `status: in_progress`.  
3. Open PR from that branch; PR body must include `Work-Order: WO-NNN`.  
4. On PR open for review: `status: in_review`.  
5. On merge: `status: complete`.

## Validation

```bash
npm run verify:coordination
```

See `scripts/verify-coordination.mjs`.
