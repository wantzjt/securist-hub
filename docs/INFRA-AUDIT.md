# Infrastructure audit — Public Decision Graph V1

**Audited:** 2026-08-05
**Repository:** `wantzjt/securist-hub`
**Production project:** `tarx/securist-hub`
**Production domain:** `https://secur.ist`

## Confirmed

| Area                      | State                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Repository base           | Foundation gate contracts are on `main`.                                                                                     |
| Vercel ownership          | Project is under the TARX team; the guarded deploy script rejects a non-TARX link.                                           |
| Production                | `secur.ist` returns 200 and the current TARX deployment is Ready.                                                            |
| Public environment        | Hostname, GitHub org, and Hugging Face org variables exist in production.                                                    |
| Transport/browser headers | HSTS, CSP, frame denial, content-type protection, referrer policy, and permissions policy are configured in `vercel.json`.   |
| Decision contracts        | State machine, append-only evidence model, lifecycle fixture, outbox contract, and Artifact Profile read models are present. |

## Intentional V1 limits

| Area                 | Current behavior                                                          | Production gate                                                    |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Decision persistence | Process memory plus explicitly marked seed fixtures                       | Postgres store adapter and migrations                              |
| Operator plane       | Contract/server function only; no external public ingest route            | Signed per-operator auth, nonce persistence, retention policy      |
| Eve                  | Propose-only gateway and agent instructions; no deployed autonomous agent | Scoped tools, durable workflow deployment, approval checks         |
| Models/providers     | Public Hugging Face search and curated profiles                           | Provider opt-in and explicit data-boundary policy                  |
| Observability        | Vercel deployment/runtime logs available                                  | Structured production events plus selected monitoring/drain policy |

## Operating rules

1. Deploy only through `./scripts/vercel-deploy-tarx.sh` or explicit `--scope tarx` commands.
2. Keep `.vercel/project.json` local and verify it resolves to `tarx/securist-hub` before a deploy.
3. Do not enable daemon, Eve, or remote-provider write paths merely because their contracts exist.
4. Treat source-fetch failure as distinct from no change; treat seed as distinct from live evidence.
5. Keep public profiles share-safe by default.

## Pre-production checklist

- `npm run typecheck`
- `npm run build`
- Decision lifecycle fixture succeeds
- HTTP smoke for the public route set
- Vercel scope guard passes
- Production error-log scan after deploy
