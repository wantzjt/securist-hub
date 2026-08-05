# Securist V1 launch roadmap

## Launch thesis

V1 is the **Public Decision Graph**: a share-safe Artifact Profile tells an operator or non-technical leader what an artifact is, why it matters, what evidence exists, which policy concerns remain, and what action comes next.

V1 does not claim durable organization approvals, persistent field telemetry, or autonomous external contributions until their production gates are complete.

## Today: Public Decision Graph V1

- Artifact Profile index with decision, artifact-type, and security-domain filters.
- Share-safe artifact profiles for packages, models, and crypto-agility work.
- Explicit `SEED`, `HYBRID`, and `LIVE` semantics.
- Plain-language purpose, risk, boundary, policy explanation, evidence coverage, and change context.
- Version-bound Decision Graph contracts, state-machine fixture, outbox contract, and Eve propose-only gateway.
- Canonical Securist chrome: contract black, IBM Plex, INFOSEC label, dispatch tape, and GitHub/Hugging Face footer links.

### V1 launch gate

1. Typecheck, build, and lifecycle fixture pass.
2. `/`, `/artifacts`, one Artifact Profile, `/activity`, `/models`, `/daemon`, and `/links` render on production.
3. No seed row appears as live organization activity.
4. TARX Vercel scope guard passes before deployment.

## Next 14 days: real evidence, not theatrics

### 1. Durable production store

- Provision a Postgres-compatible database for the TARX Vercel project.
- Run `migrations/001_decision_graph.sql`.
- Implement the production store adapter and retain the in-memory store for local fixtures only.
- Add tenant-scoped query tests and outbox replay tests.

### 2. Watched artifact change detection

- Start from explicit watchlists and package/catalog rows, never the whole internet.
- Capture immutable source snapshots for public GitHub and Hugging Face artifacts.
- Diff version, digest, license, model-card, provenance, and crypto-agility facts.
- Send only material changes to the re-review queue.

### 3. Operator evidence alpha

- Publish the sibling `scout-daemon` runbook and canonical source location.
- Require per-operator credentials or signatures, nonce replay protection, and minimized payloads.
- Keep the daemon fail-open: field work continues if ingest is unavailable.
- Do not expose raw local paths, code, prompts, data, or secrets.

## Days 15–45: paid operator layer

- Organization workspaces, scoped policies, owners, review dates, and approval history.
- Local validation recipes for approved runtimes, including optional TARX integration.
- Policy-driven review queue and evidence export for authorized stakeholders.
- Draft-only upstream contribution workflow; no automatic default-branch writes.
- Measured outcomes: review time, stale-decision detection, validation completion, and accepted upstream contributions.

## Launch gates for automation

| Capability         | Required before enablement                                                          |
| ------------------ | ----------------------------------------------------------------------------------- |
| Durable decisions  | Postgres adapter, migration, tenant isolation tests                                 |
| Operator ingest    | Per-operator auth, nonce persistence, redaction tests, retention policy             |
| Eve research agent | Scoped read tools, source citations, schema validation, activity provenance         |
| Remote LLM helper  | Explicit data boundary, provider opt-in, server-side key, no direct decision writes |
| Draft PR creation  | Allowlisted repository, policy permission, durable human approval                   |

## North-star test

An operator should be able to open one Artifact Profile and answer, in under five minutes: **Should we use this; under what boundary; what changed; what did we validate; and what is the safest next contribution?**
