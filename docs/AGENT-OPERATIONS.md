# Agent operations — coordination control plane

How Grok, Codex, and humans share this repository without management theater.

Canonical state lives in **git**: work orders, roadmap, decision log, PR bodies.  
**Chat is never canonical.**

---

## Freeze cadence (post PR #9)

**Operational-process work is frozen.** Do not invent new release frameworks, verifiers, or meta-process unless a human explicitly reopens process work.

### Roles (operating loop)

| Actor | Owns | Returns / does not |
|-------|------|---------------------|
| **Grok** | **One** active work order · **one** narrow PR · full local verification (`lint`, `typecheck`, `test:lifecycle`, `test:graph` if present, `build`, `verify:coordination`, `verify:release-readiness`) | Concurrent WOs; credentials; deploy; silent scope expansion |
| **Codex** | Adversarial review of scope, contracts, tenant safety, tests, release impact | **approve** · **P0–P1 blocker** · **go-no-go** — not product brainstorms |
| **Human** | Credentials, migration, production evidence, customer interviews, final release signature | Expecting agents to ship past gates |

### Only two active tracks

| Track | WO | Owner |
|-------|-----|--------|
| **R1 durable Postgres** | [WO-008](../ops/work-orders/WO-008-r1-postgres-activation-prep.md) | human (blocked until provision authority) |
| **Wedge validation** | [WO-004](../ops/work-orders/WO-004-design-partner-interviews.md) | human (interviews + PoV) |

**Forbidden until one track produces real evidence:** new UI, agents, feeds, model integrations, or major Decision Graph surface expansion.

Evidence means: R1 human-signed exit and/or founder bar (≥5 interviews, ≥3 confirm, ≥2 stale-approval PoVs) — see [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) §7 and [`RELEASE-PLAN.md`](./RELEASE-PLAN.md).

---

## Work unit

1. **One work order** → **one active branch** → **one PR**.  
2. **No concurrent agents** on the same work order.  
3. Claim by setting WO `status: in_progress`, `owner`, and `branch`.  
4. Statuses: `proposed` → `ready` → `in_progress` → `in_review` → `complete` (or `blocked`).  

Format: [`ops/work-orders/README.md`](../ops/work-orders/README.md).

---

## Required behavior

### Always

- Read `docs/SYSTEM-MODEL.md`, `docs/CANONICAL-CONTRACTS.md`, and the active work order before coding.  
- Reference **Work-Order: WO-XXX** in the PR body.  
- Update the work order when status or blockers change.  
- Prefer Decision Graph contracts over route-local models.  
- Keep non-goals visible.

### Never

- Merge or deploy past human gates on credentials, migrations, or external writes.  
- Provision infrastructure or touch Vercel without explicit human authority (WO-008).  
- Claim R1 active, tenant isolation in production, or security properties without human evidence.  
- Open product WOs for UI/agents/feeds/models while freeze is in effect.  
- Invent process docs competing with [`ROADMAP.md`](./ROADMAP.md) / [`RELEASE-PLAN.md`](./RELEASE-PLAN.md).

---

## Handoff pattern

```text
Active track (WO-004 or WO-008 only under freeze)
    → Grok: narrow PR + full local verify (if code/docs change)
        → Codex: approve | P0–P1 blocker | go-no-go
            → Human: credentials · migration · prod evidence · interviews · release signature
```

If blocked: set WO `status: blocked` — do not invent a contract-violating workaround.

---

## Verification (local)

```bash
npm run lint
npm run typecheck
npm run test:lifecycle
npm run test:graph
npm run build
npm run verify:coordination
npm run verify:release-readiness
```

CI: `.github/workflows/ci.yml` (includes offline release-readiness — **not** live prod proof).

---

## Related docs

| Doc | Role |
|-----|------|
| [`ROADMAP.md`](./ROADMAP.md) | Active tracks under freeze |
| [`RELEASE-PLAN.md`](./RELEASE-PLAN.md) | R0–R3 trains |
| [`FOUNDER-THESIS.md`](./FOUNDER-THESIS.md) | Company bar before surface expansion |
| [`DECISIONS.md`](./DECISIONS.md) | Append-only decisions |
| [`OPERATIONS.md`](./OPERATIONS.md) | Runtime ops |
