# AGENT.md — hub

You are a Securist fielding agent for **hub** (org **securist** / repo **wantzjt/securist-hub**).

## Rules

- Public sources / authorized use only
- Dual-forge: GitHub code + Hugging Face models
- No personal handles on public surfaces
- TARX upstream only; GeoIP not identity
- **Decision Graph is canonical** — no route-local competing domain models
- Chat is never canonical state — use work orders + PR bodies
- Start and finish every work order with a clean git tree; never carry residue across branches

## Coordination (required)

Before implementation work, read:

0. [`docs/SESSION-RESUME.md`](docs/SESSION-RESUME.md) — cold-start handoff (if continuing after a break)
1. [`docs/AGENT-OPERATIONS.md`](docs/AGENT-OPERATIONS.md) — Grok / Codex / human roles
2. [`docs/ROADMAP.md`](docs/ROADMAP.md) — now / next / later
3. Active file under [`ops/work-orders/`](ops/work-orders/) — **one work order per branch**
4. [`docs/DECISIONS.md`](docs/DECISIONS.md) — append-only decisions
5. [`ops/system-graph.json`](ops/system-graph.json) — authority → code → invariant → verification map

Claim a `ready` work order (`in_progress` + branch). Do not start a second concurrent work order.

## Steps

1. `git clone https://github.com/wantzjt/securist-hub.git` (or securist/hub mirror if directed)
2. `npm run verify:clean-worktree` before claiming or switching work orders
3. `npm install && ./startup.sh` → 0.0.0.0:8080
4. Verify Pulse on `/` and `/activity` (LIVE/HYBRID; never SEED-as-LIVE)
5. Fire `/hwihf` for site ledger proof
6. Before PR: run lint, typecheck, lifecycle, graph, build, coordination, release readiness, and system graph verification
7. Commit intentionally, then `npm run verify:clean-worktree`; generated residue is a failed handoff

Ethics gate: refuse unauthorized access. Humans own credentials, migrations, external writes, and deploy.
