# Operator release lane — human-owned signed distribution

**Status:** Process for distribution-shipping the free Local Operator  
**Date:** 2026-08-07  
**Owner:** **human** (release signature, publish, keys)  
**Implementation:** monorepo package `@securist/operator` (WO-012 · PR #19)

This lane turns **internally shipped** Operator code into a **distribution-shipped** install. Until it exits, public claims stay monorepo-only.

---

## Honest status

| State | Meaning |
|-------|---------|
| **Internally shipped** | On `main`. Developers run from securist-hub monorepo. |
| **Distribution-shipped** | Signed artifact + deliberate package publish + clean-machine verify. |

**Do not** advertise `npx @securist/operator` (or equivalent) on the public site until this lane completes.

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

4. **Tamper:** mutating `dist/cli.js` after sign → `runtime_digest_mismatch`; doctor/assess fail.  
5. **Unsigned / missing identity:** `runtime_unavailable`; assess **blocked**. No fake “Runtime verified.”  
6. **TARX model pack** synthesis stays unavailable until a separate signed pack path exists.

See `packages/operator/package-artifacts.mjs` and `packages/operator/keys/README.md`.

---

## Human release checklist

### A. Prerequisites

- [ ] Human holds offline private key matching `trust-root.pem`  
- [ ] Clean `main` at intended release commit  
- [ ] No product claim of public install until checklist exit  

### B. Build

```bash
npm ci
npm run operator:build
# produces packages/operator/dist/cli.js
```

### C. Sign (offline / human machine)

```bash
SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem \
SECURIST_OPERATOR_SIGNER_KEY_ID=securist-operator-release-key \
  node scripts/sign-operator-identity.mjs
# writes packages/operator/runtime-identity.json
```

### D. Verify on signing machine

```bash
npm run securist -- doctor
# expect: Runtime verified · synthesis unavailable · deterministic assess ready

npm run securist -- assess /path/to/fixture-repo --intended-use "Release smoke"
# expect: Local Decision Brief · model synthesis not used
```

### E. Package / install distribution

- [ ] Decide channel (private registry, GitHub Release tarball, or deliberate npm publish of a **non-private** package name/version)  
- [ ] Artifact includes: `dist/`, `bin/`, `package.json`, `keys/trust-root.pem`, `runtime-identity.json`  
- [ ] `@securist/operator` remains **`private: true` in monorepo** until human flips publish intent  
- [ ] Tag release (e.g. `operator-v0.1.0`) with checksums  

### F. Clean-machine verification (required exit)

On a machine **without** monorepo sources or network install tricks:

- [ ] Install only the release artifact  
- [ ] `securist doctor` → Runtime verified  
- [ ] Mutate installed `dist/cli.js` → doctor fails `runtime_digest_mismatch`  
- [ ] `securist assess .` on a sample public-ish fixture path succeeds with `LocalDecisionBriefV1` honesty fields  
- [ ] No call to `npx tsx`; no source upload  

### G. Public messaging unlock

Only after F:

- [ ] Update [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md) public status table  
- [ ] Site may list public install command  
- [ ] Still: no credits metering; free path stays private individual  

---

## Agent vs human roles

| Actor | May |
|-------|-----|
| **Grok / agents** | Improve monorepo Operator, tests, docs; prepare build scripts |
| **Human** | Hold private key, sign, publish, clean-machine sign-off, site install claims |

---

## Parallel track

**R1 (WO-008)** runs in parallel for the **paid Team Graph**. Operator distribution does not replace shared durable decisions—it feeds the free acquisition path into paid shared memory.

---

## Related

- WO-012 · PR #19 (internally shipped Operator)  
- D-012 commercial architecture  
- [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md)  
