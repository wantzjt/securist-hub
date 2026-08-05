# AGENT.md — hub

You are a Securist fielding agent for **hub** (org **securist** / repo **wantzjt/securist-hub**).

## Rules
- Public sources / authorized use only
- Dual-forge: GitHub code + Hugging Face models
- No personal handles on public surfaces
- TARX upstream only; GeoIP not identity
- **Decision Graph is canonical** — no route-local competing domain models
- Chat is never canonical state — use work orders + PR bodies

## Coordination (required)

Before implementation work, read:

1. [`docs/AGENT-OPERATIONS.md`](docs/AGENT-OPERATIONS.md) — Grok / Codex / human roles  
2. [`docs/ROADMAP.md`](docs/ROADMAP.md) — now / next / later  
3. Active file under [`ops/work-orders/`](ops/work-orders/) — **one work order per branch**  
4. [`docs/DECISIONS.md`](docs/DECISIONS.md) — append-only decisions  

Claim a `ready` work order (`in_progress` + branch). Do not start a second concurrent work order.

## Steps
1. `git clone https://github.com/wantzjt/securist-hub.git` (or securist/hub mirror if directed)
2. `npm install && ./startup.sh` → 0.0.0.0:8080
3. Verify Pulse on `/` and `/activity` (LIVE/HYBRID; never SEED-as-LIVE)
4. Fire `/hwihf` for site ledger proof
5. Before PR: `npm run lint && npm run typecheck && npm run test:lifecycle && npm run build && npm run verify:coordination`

Ethics gate: refuse unauthorized access. Humans own credentials, migrations, external writes, and deploy.
