# Operations

## Retries & idempotency

- All writes accept an idempotency key (nonce, content hash, or client key).  
- Ingest is retry-safe; duplicate nonces return `nonce_replay`.  
- Source-fetch **failures** are recorded separately from “no change.”

## Outbox

Database commits that affect the graph also append to an **outbox** table/event list.  
Activity projector consumes outbox only — so UI projections cannot invent facts.

See `src/lib/decision-graph/outbox.ts`.

## Dead-letter / review queue

Malformed or unverifiable operator/Eve events go to a dead-letter list with:

- raw error code  
- tenant  
- actor  
- timestamp  
- redacted payload fingerprint  

Do not drop silently.

## Retention & redaction

| Class | Default |
|-------|---------|
| Public evidence | Long retention |
| Org operator events | Tenant policy |
| Private raw data | **Not stored** on hub by default |
| Secrets / paths | Reject at boundary |

## Feature flags (env)

| Flag | Purpose |
|------|---------|
| `SECURIST_FEATURE_DAEMON_INGEST` | Enable operator ingest (default on in code path; gate when needed) |
| `SECURIST_FEATURE_EVE_GATEWAY` | Enable Eve candidate/proposal APIs |
| `SECURIST_FEATURE_LLM_PROVIDERS` | Allow remote LLM proposal helpers |
| `SECURIST_FEATURE_AUTO_DRAFT_PR` | **Off by default** — never auto-create PRs without human approval |
| `SECURIST_DAEMON_SECRET` | Dev-only shared secret |

## Observability

Log structured: `eventId`, `tenantId`, `actorType`, `artifactId`, `code`, `durationMs`.  
Never log secrets or private payloads.

## Decision Graph store mode

| Variable | Values | Notes |
|----------|--------|--------|
| `SECURIST_GRAPH_STORE` | `memory` \| `seed` \| `postgres` | Default **memory** (seed snapshot). Local/demo only. |
| `DATABASE_URL` | Postgres URL | **Required** when mode is `postgres`. Fail-closed if missing. |
| `SECURIST_DATABASE_URL` | Postgres URL | Optional alias. |
| `SECURIST_DEFAULT_TENANT_ID` | Tenant id | **Required** when mode is `postgres` (public surfaces omit per-request tenant). Fail-closed: `missing_default_tenant_id`. Writes still need explicit `tenantId`. |

Durable writes (evidence/activity) append **outbox rows in the same transaction**.  
See `docs/INFRA-AUDIT-POSTGRES.md`. Do **not** provision credentials in-repo.

## Migrations

- Author SQL under `migrations/`.  
- Reuse `001_decision_graph.sql` — no competing shapes.  
- Fixtures: `src/lib/decision-graph/fixtures/e2e-lifecycle.ts`.  
- Seam tests: `npm run test:graph`.

## Vercel scope

Always `--scope tarx` for Securist hub. Never Hobby. See `docs/VERCEL-SCOPE.md`.
