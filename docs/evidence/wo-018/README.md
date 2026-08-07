# WO-018 evidence — Local Operator release-candidate proof

Generated machine reports are written under **gitignored** `.operator-rc/evidence/`
so CI `verify:clean-worktree` stays green. This directory documents the procedure.

## Reproduce locally

```bash
npm run operator:rc:preflight
# → .operator-rc/evidence/preflight-report.json

npm run operator:rc:dogfood
# → .operator-rc/evidence/clean-verify-report.json
# → .operator-rc/securist-operator-*-rc-dogfood/
```

Human signed RC:

```bash
SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem npm run operator:rc
npm run operator:rc:verify-clean -- --rc-dir .operator-rc/securist-operator-0.1.0-rc
```

## Non-claims

- No public `npx @securist/operator`
- No npm publish
- No private keys in the repository
