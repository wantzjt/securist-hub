# Operator public trust root

`trust-root.pem` is the **public** key used to verify release-signed
`runtime-identity.json`.

The matching **private** release key is human-controlled and must **never**
appear in git, npm packages, or CI artifacts.

## Release signing (humans only)

```bash
SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem \
  node scripts/sign-operator-identity.mjs
```

Until a valid `runtime-identity.json` signed by this trust root is present and
matches current operator bytes, `securist doctor` reports `runtime_unavailable`
and `securist assess` is blocked. That is intentional — we do not fake
“runtime verified.”

## Tests

Fixtures generate an **ephemeral** keypair and identity under a temp directory
via env overrides. They do not use a committed private key.
