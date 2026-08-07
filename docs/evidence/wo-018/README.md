# WO-018 evidence — Local Operator release-candidate proof

## What is automated (no secrets)

| Artifact | Producer |
|----------|----------|
| `preflight-report.json` | `npm run operator:rc:preflight` |
| `clean-verify-report.json` | `npm run operator:rc:verify-clean` (via dogfood) |

## Human-only (not in git)

| Artifact | Producer |
|----------|----------|
| `.operator-rc/securist-operator-*-rc.tgz` | `SECURIST_OPERATOR_SIGNING_KEY=… npm run operator:rc` |
| Production `runtime-identity.json` | human sign (gitignored) |

## Dogfood

`npm run operator:rc:dogfood` builds an **ephemeral-key** RC under `.operator-rc/` (gitignored) and runs the clean-machine golden path. That proves the pipeline; it is **not** a production release signature.

## Non-claims

- No public `npx @securist/operator`
- No npm publish
- No private keys in the repository
