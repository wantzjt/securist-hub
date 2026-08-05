# Operator daemon

Local, safe, valuable — not an autonomous global bot.

## Contract

Server function: `postDaemonIngest` (`src/lib/activity-api.ts` → `decision-graph/ingest.ts`).

Payload:

- `operatorId`, `tenantId`, `nonce`, `timestamp`
- optional `secret` when `SECURIST_DAEMON_SECRET` is set (dev)
- event: `whatHappened`, `whyItMatters`, `securistAction`, optional `artifactId`

## Security

- Timestamp skew window (~10m)
- Nonce replay rejection per operator
- Redaction reject on secrets / private paths
- Default activity visibility: **organization** (not public stream)
- Hub validates before Decision Graph mutation

## Fail-open

If hub ingest is unavailable, local operator work continues. The hub does not block local metal.

## Allowed / forbidden

**May:** public allowlisted repos, approved local workspaces, local model pulls, sandboxed recipes, draft PR only when policy allows.

**Must not:** private repos without scope, push default branch, auto upstream PR without approval, claim local test proves global security, vendor TARX.

## TARX

Optional local execution substrate via provider interface (planned). Never public product identity. Never vendored into this hub.
