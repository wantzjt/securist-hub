# R3 — Strong release checklist

**Train:** R3 Strong Release (design-partner-ready private Decision Graph beta)  
**Parent plan:** [`docs/RELEASE-PLAN.md`](../../docs/RELEASE-PLAN.md)  
**Scope:** Vercel team **tarx** · project **securist-hub** only ([`docs/VERCEL-SCOPE.md`](../../docs/VERCEL-SCOPE.md))

**Use:** Copy this checklist into a private ops log or PR comment for a specific release candidate (git SHA). Check boxes only with evidence.  
**Do not** store secrets, connection strings, or customer PII in git.

---

## Release identity

| Field | Value |
|-------|--------|
| Candidate git SHA | |
| Date (UTC) | |
| Go/no-go owner (human) | |
| Codex reviewer (optional) | |
| R1 active? (yes/no — must be yes for full R3) | |
| R2 exit or waiver? | |

---

## Severity legend

| Sev | Meaning | Stop |
|-----|---------|------|
| **P0** | Safety, trust, data, scope, silent inherit, secrets | **Stop** — no go |
| **P1** | Critical path broken or evidence incomplete | **Stop R3** until fixed/accepted |
| **P2** | Non-blocking polish | Track; do not block R0 |

---

## 1. Contract checks

| ID | Sev | Check | Who | Pass? | Evidence |
|----|-----|-------|-----|-------|----------|
| C1 | P0 | Decision Graph remains SoR; no new route-local domain models in candidate | Auto+Human | | CI + diff review |
| C2 | P0 | Approvals still version-bound; lifecycle fixture green | **Auto** | | `npm run test:lifecycle` |
| C3 | P0 | Graph seam tests green if present | **Auto** | | `npm run test:graph` |
| C4 | P1 | Canonical contracts docs present and linked | **Auto** | | `verify:release-readiness` |
| C5 | P1 | WORK order protocol / coordination verifier green | **Auto** | | `npm run verify:coordination` |
| C6 | P0 | AI/Eve not elevated to decision authority in this release | **Human** | | Feature flags off; code review |

---

## 2. Migration / rollback

| ID | Sev | Check | Who | Pass? | Evidence |
|----|-----|-------|-----|-------|----------|
| M1 | P0 | Schema is only `migrations/001_decision_graph.sql` (no competing shapes) | **Human** | | Migration log (private) |
| M2 | P0 | Migration applied successfully on production DB (if R1 claimed) | **Human** | | Private ops log UTC |
| M3 | P0 | Rollback path known: `SECURIST_GRAPH_STORE=memory` + redeploy | **Human** | | Checklist note |
| M4 | P1 | Rollback tested or explicitly accepted as risk by go/no-go owner | **Human** | | Signature |

If R1 is **not** active, mark M2 N/A and **do not claim R3 full private beta** without waiver.

---

## 3. Environment confirmation

| ID | Sev | Check | Who | Pass? | Evidence |
|----|-----|-------|-----|-------|----------|
| E1 | P0 | Vercel team is **tarx**, project **securist-hub** (not Hobby) | **Human** | | Dashboard screenshot private / CLI `vercel whoami` note |
| E2 | P0 | If postgres mode: `SECURIST_GRAPH_STORE=postgres` | **Human** | | Env name present (value redacted) |
| E3 | P0 | If postgres mode: `DATABASE_URL` present | **Human** | | Name only in evidence |
| E4 | P0 | If postgres mode: `SECURIST_DEFAULT_TENANT_ID` present | **Human** | | Name only |
| E5 | P0 | No secrets committed to git in this candidate | **Auto+Human** | | git history / PR review |
| E6 | P1 | Eve/LLM/auto-PR feature flags remain off unless explicitly accepted | **Human** | | Env audit |

**Automated tools must not print secret values.**

---

## 4. Production route smoke

| ID | Sev | Route / check | Who | Pass? | Evidence |
|----|-----|---------------|-----|-------|----------|
| S1 | P0 | `/` returns 200 | **Human** | | URL + UTC |
| S2 | P0 | `/artifacts` returns 200 | **Human** | | |
| S3 | P0 | One Artifact Profile returns 200 | **Human** | | |
| S4 | P0 | `/activity` returns 200 | **Human** | | |
| S5 | P1 | `/models` and `/daemon` return 200 (public authority) | **Human** | | |
| S6 | P0 | SEED/demo not labeled as LIVE org telemetry | **Human** | | Spot check |
| S7 | P1 | No startup crash from missing graph config in intended mode | **Human** | | Logs redacted |

---

## 5. Security headers

| ID | Sev | Check | Who | Pass? | Evidence |
|----|-----|-------|-----|-------|----------|
| H1 | P1 | HTTPS live on production host | **Human** | | browser/curl |
| H2 | P1 | Security headers present per project policy (e.g. HSTS/CSP if configured) | **Human** | | `curl -sI` note |
| H3 | P0 | No accidental exposure of `DATABASE_URL` or secrets in HTML/JS | **Human** | | view-source spot check |

Offline CI **does not** prove production headers.

---

## 6. Error-log scan

| ID | Sev | Check | Who | Pass? | Evidence |
|----|-----|-------|-----|-------|----------|
| L1 | P0 | No repeated `missing_database_url` / `missing_default_tenant_id` in prod (if R1) | **Human** | | Vercel logs redacted |
| L2 | P1 | No stack traces leaking paths/secrets in public responses | **Human** | | |
| L3 | P2 | Non-fatal noise catalogued | **Human** | | |

---

## 7. Customer-proof evidence

| ID | Sev | Check | Who | Pass? | Evidence |
|----|-----|-------|-----|-------|----------|
| P1 | P1 | At least one stale-approval PoV path documented (R2) | **Human** | | Private write-up |
| P2 | P1 | Interview count vs founder bar noted (5 / 3 confirm) | **Human** | | WO-004 status |
| P3 | P2 | Design partner invite list exists (names private) | **Human** | | CRM/private |

Do **not** commit customer private data. CI never invents this evidence.

---

## 8. Automated preflight (run on candidate SHA)

```bash
npm ci
npm run lint
npm run typecheck
npm run test:lifecycle
npm run test:graph
npm run build
npm run verify:coordination
npm run verify:release-readiness
```

| ID | Sev | Check | Who | Pass? |
|----|-----|-------|-----|-------|
| A1 | P0 | All commands above exit 0 on candidate | **Auto** | |

---

## 9. Go / no-go

### Stop rules (immediate no-go)

- Any **P0** FAIL  
- R1 claimed without env+migration evidence  
- Secrets in git  
- Silent approval inherit observed  
- Wrong Vercel scope (Hobby / non-tarx)

### Disposition

| Result | Meaning |
|--------|---------|
| **GO** | All P0 pass; P1 pass or accepted in writing; owner signs |
| **NO-GO** | Any P0 fail or incomplete R1 when private beta claimed |
| **GO WITH WAIVER** | Named P1 residual risks accepted by owner (list below) |

### Signature

| Field | Value |
|-------|--------|
| Decision | GO / NO-GO / GO WITH WAIVER |
| Go/no-go owner | |
| UTC timestamp | |
| Candidate SHA | |
| Waivers (if any) | |

---

## Automation vs human summary

| Class | Examples |
|-------|----------|
| **Automated (CI/local)** | lint, typecheck, lifecycle, graph tests, build, `verify:coordination`, `verify:release-readiness` |
| **Human only** | provision, env values, migration apply, production smoke, headers, logs, customer evidence, go/no-go signature |

`verify:release-readiness` only proves **release documents and gates exist and are complete enough to execute**—not that R1–R3 have been completed live.
