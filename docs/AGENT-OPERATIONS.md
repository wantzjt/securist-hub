# Agent operations — coordination control plane

How Grok, Codex, and humans share this repository without management theater.

Canonical state lives in **git**: work orders, roadmap, decision log, PR bodies.  
**Chat is never canonical.**

---

## Roles

| Actor | Owns | Does not own |
|-------|------|----------------|
| **Grok** | Bounded implementation on **one** work order / **one** branch; keep WO + PR body current; run local verification | Credentials, migrations in prod, policy authority, material merge/deploy, concurrent second work order |
| **Codex** | Contract review, integration judgment, release verification, TARX-scoped deploy checks | Silent scope expansion; inventing domain models; unattended production credential creation |
| **Human** | Credentials, DB provision/migrations, policy changes, external-write authorization, material merge and deploy decisions | Expecting agents to “just ship” past gates |

See also root [`AGENT.md`](../AGENT.md) (fielding rules) and [`docs/VERCEL-SCOPE.md`](./VERCEL-SCOPE.md).

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
- Reference **Work-Order: WO-XXX** in the PR body (template enforces fields).  
- Update the work order when status, acceptance checks, or blockers change.  
- Prefer extending Decision Graph contracts over new route-local models.  
- Keep non-goals visible; refuse silent scope expansion.

### Never

- Merge or deploy past human gates on credentials, migrations, or external writes.  
- Treat PR #2 as complete or production-ready without WO-002 repair + re-review.  
- Provision infrastructure or touch Vercel settings unless the work order and a human explicitly authorize it.  
- Invent parallel strategy docs that compete with [`ROADMAP.md`](./ROADMAP.md) / [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md).  
- Claim tenant isolation or security properties that tests and review have not established.

---

## Handoff pattern

```text
Human / roadmap picks item
    → Work order ready
        → Grok implements on WO branch
            → PR + verify:coordination + CI
                → Codex contract/integration review
                    → Human merge / deploy / credentials as needed
```

If blocked: set WO `status: blocked`, note dependency or decision needed in the WO body and PR — do not invent a workaround that violates contracts.

---

## Verification (local)

```bash
npm run lint
npm run typecheck
npm run test:lifecycle
npm run build
npm run verify:coordination
# If present (after Postgres seam lands):
npm run test:graph
```

CI runs the same set (see `.github/workflows/ci.yml`). `test:graph` is optional until the repaired Postgres seam lands on `main`.

---

## Related docs

| Doc | Role |
|-----|------|
| [`ROADMAP.md`](./ROADMAP.md) | Now / next / later work items |
| [`DECISIONS.md`](./DECISIONS.md) | Append-only decision log |
| [`OPERATIONS.md`](./OPERATIONS.md) | Runtime ops, flags, outbox |
| [`V1-LAUNCH-ROADMAP.md`](./V1-LAUNCH-ROADMAP.md) | Launch history (not a competing strategy) |
