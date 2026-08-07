# Operator public trust root

`trust-root.pem` is the **public** key used to verify release-signed
`runtime-identity.json`.

The matching **private** release key is human-controlled and must **never**
appear in git, npm packages, or CI artifacts.

## Release signing (humans only)

One-command release candidate (preferred — WO-018):

```bash
SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem \
  npm run operator:rc
```

Sign only (after `npm run operator:build`):

```bash
SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem \
  node scripts/sign-operator-identity.mjs
```

Non-secret preflight (no key): `npm run operator:rc:preflight`

## What is signed

Digest covers the **packaged executable set** (same for build/sign/verify):

- `dist/cli.js` (what `bin/securist.mjs` executes)
- `bin/securist.mjs`
- `package.json`
- `keys/trust-root.pem`

`runtime-identity.json` is **excluded** from its own digest but ships in a release.

Order: `npm run operator:build` → sign → verify.

Until a valid `runtime-identity.json` signed by this trust root matches those
artifacts, `securist doctor` reports `runtime_unavailable` and `securist assess`
is blocked. That is intentional — we do not fake “runtime verified.”

## Tests

Fixtures generate an **ephemeral** keypair and identity under a temp directory
via env overrides. They do not use a committed private key.
