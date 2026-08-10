# Operator release lane — human-owned signed distribution

**Status:** Process + automated RC tooling for distribution-shipping the free Local Operator  
**Date:** 2026-08-07  
**Owner:** **human** (release signature, publish, keys)  
**Implementation:** monorepo package `@securist/operator` (WO-012 · PR #19)  
**RC tooling:** WO-018  

This lane turns **internally shipped** Operator code into a **distribution-shipped** install. Until it exits, public claims stay monorepo-only.

---

## Golden path honesty

```text
Public Assess                         LIVE
Local Operator (monorepo / signed RC)  Gate 1 PASS · /operator dual path (WO-022) · not npm-public
Team Graph / shared re-review         NOT LIVE (R1)
```

**Do not** advertise `npx @securist/operator` (or equivalent) on the public site until this lane’s **publish gate** completes (after clean-machine sign-off).

Default public language ([`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md)):

> Free Local Operator: available from the Securist monorepo today.  
> Public install: forthcoming after signed distribution.

---

## Trust model (non-negotiable)

1. **Private signing key** lives only on human-controlled media—**never** git, npm, or CI logs.  
2. **Public trust root** is packaged: `packages/operator/keys/trust-root.pem`.  
3. **Signed set** (build → digest → sign → verify) includes **executed** bytes:

   - `dist/cli.js`  
   - `bin/securist.mjs`  
   - `package.json`  
   - `keys/trust-root.pem`  

   `runtime-identity.json` is excluded from its own digest but ships with the release.

4. **Tamper:** mutating `dist/cli.js` after sign → doctor/assess fail (`runtime_digest_mismatch` / signature path).  
5. **Unsigned / missing identity:** `runtime_unavailable`; assess **blocked**. No fake “Runtime verified.”  
6. **TARX model pack** synthesis stays unavailable until a separate signed pack path exists.

See `packages/operator/package-artifacts.mjs` and `packages/operator/keys/README.md`.

---

## Automated preflight (agents + humans · no secrets)

```bash
npm run operator:rc:preflight
```

Proves:

- `private: true`, no private keys under `packages/operator`  
- `operator:build`, digest covers `dist/cli.js`  
- unsigned doctor/assess fail closed  
- `test:operator` green  

Evidence: `docs/evidence/wo-018/preflight-report.json`

Dogfood (ephemeral key · CI-safe · **not** production signature):

```bash
npm run operator:rc:dogfood
# packs .operator-rc/*-rc-dogfood and runs clean verify
```

---

## Human one-command release candidate

**Prerequisite:** offline private key matching packaged `trust-root.pem`.

```bash
# From clean monorepo at intended release commit
npm ci
SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem \
SECURIST_OPERATOR_SIGNER_KEY_ID=securist-operator-release-key \
  npm run operator:rc
```

What it does:

1. `operator:rc:preflight`  
2. `operator:sign-identity` (writes `packages/operator/runtime-identity.json`, gitignored)  
3. Stages signed RC under `.operator-rc/securist-operator-<version>-rc/`  
4. Writes `MANIFEST.json`, `VERIFY.md`, tarball, `.operator-rc/latest-rc.json`  

**Does not** publish to npm. **Does not** unlock public site install claims.

### Clean-machine verify

```bash
# Against staged directory or tarball
npm run operator:rc:verify-clean -- --rc-dir .operator-rc/securist-operator-0.1.0-rc
# or
npm run operator:rc:verify-clean -- --rc-tgz .operator-rc/securist-operator-0.1.0-rc.tgz
```

Golden path checked:

1. `securist doctor` → Runtime verified · synthesis unavailable  
2. `securist assess <fixture>` → `LocalDecisionBriefV1` · local_only  
3. MCP stdio tools allowlist only  
4. Tamper `dist/cli.js` → doctor/assess fail closed  
5. Local state dir mode 0700  

Fixture: `packages/operator/fixtures/sample-target` (public dogfood only).

---

## Manual checklist (publish gate · human only)

### A. Prerequisites

- [x] Human holds offline private key matching production `trust-root.pem` (Ed25519 under `~/.securist/keys/`; **never in git**)  
- [ ] **Backup** of private key exists off the primary machine (human only)  
- [x] Production `trust-root.pem` merged to `main` (WO-020)  
- [x] Automated golden-path battery in CI (WO-021 · `npm run test:golden-path`)  
- [x] `/operator` documents monorepo + signed RC paths without public npx (WO-022)  
- [x] `npm run operator:rc:preflight` green (local)  

### B–D. Signed RC

- [x] Local `SECURIST_OPERATOR_SIGNING_KEY=… npm run operator:rc` (signerKeyId `securist-operator-release-key`)  
- [x] Local `operator:rc:verify-clean` green  
- [ ] Clean-machine `operator:rc:verify-clean` green on a **second** machine if possible  


### E. Package / install distribution

**Plan (WO-023):** first ship = **GitHub Release pre-release tarball** — not public npm.  
Full steps: [`OPERATOR-PUBLISH-GATE.md`](./OPERATOR-PUBLISH-GATE.md).

- [x] Channel decided: GitHub Release tarball first; npm later only if deliberate  
- [ ] Offline prep: `npm run operator:rc` → `operator:rc:verify-clean` → `operator:rc:publish-prep`  
- [ ] Human creates pre-release tag + uploads tarball + SHA256SUMS + MANIFEST  
- [x] Artifact set defined: `dist/`, `bin/`, `package.json`, `keys/trust-root.pem`, `runtime-identity.json`  
- [x] `@securist/operator` remains **`private: true` in monorepo** until human flips publish intent  
- [ ] Tag e.g. `operator-v0.1.0-rc.1` with checksums  

### F. Public messaging unlock

Only after E and deliberate human decision:

- [ ] Update [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md) public status table  
- [ ] Site may link GitHub Releases (still **no** public npx until npm path chosen)  
- [ ] Still: no credits metering; free path stays private individual  
- [ ] Announcement remains HOLD unless founder explicitly lifts it

---

## Agent vs human roles

| Actor | May |
|-------|-----|
| **Grok / agents** | Preflight, dogfood RC, monorepo Operator, tests, docs (WO-018) |
| **Human** | Offline private key, `npm run operator:rc`, publish, clean-machine sign-off, site install claims |

---

## Parallel track

**R1 (WO-008)** is the **paid Team Graph** activation. Operator distribution does not replace shared durable decisions—it makes the free middle step of the golden path real so paid shared memory has a reason to exist.

---

## Related

- WO-012 · PR #19 (internally shipped Operator)  
- WO-018 (RC proof tooling)  
- D-012 commercial architecture  
- [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md)  
