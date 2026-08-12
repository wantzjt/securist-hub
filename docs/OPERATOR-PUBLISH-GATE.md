# Operator publish gate — GitHub Release tarball first

**Status:** Plan + offline prep tooling · **not** executed  
**Date:** 2026-08-10  
**Owner:** **human** for upload/sign-off · Grok may draft artifacts only  
**Depends on:** Gate 1 (WO-020) · golden-path battery (WO-021) · dual-path UX (WO-022)  
**Related:** [`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md) · WO-023

This document is **publish gate E–F**: how we intentionally ship a signed Local Operator RC **without** unlocking public `npx` or broad announcement.

---

## Channel decision (locked for first ship)

| Channel | First ship? | Notes |
|---------|-------------|--------|
| **GitHub Release** attachment (`.tgz` + checksums) | **Yes — preferred** | Matches signed RC model; private package stays `private: true` in monorepo |
| Private registry | Later optional | Same tarball semantics |
| **npm public** `@securist/operator` | **No for first ship** | Requires separate deliberate decision + site copy change |
| Public site “download” store | **No** until Release exists and messaging unlocked | `/operator` Path B documents unpack only |

**Do not** put `npx @securist/operator` on the website until npm (or equivalent) is deliberately published **and** a human updates [`BUYER-MESSAGING.md`](./BUYER-MESSAGING.md).

---

## Preconditions (must all be true)

- [x] Production `trust-root.pem` on `main` (WO-020)  
- [x] Offline private key held by human (never in git)  
- [x] `npm run operator:rc` + `operator:rc:verify-clean` green locally  
- [x] `npm run test:golden-path` green  
- [x] `/operator` dual path honest (WO-022)  
- [ ] Private key backed up off primary machine  
- [x] Human / authorized session chose tip for first RC pre-release (`operator-v0.1.0-rc.1` · 2026-08-12 · main)  

---

## Artifact set (what humans attach)

From a clean monorepo at the intended commit:

```bash
export SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem
export SECURIST_OPERATOR_SIGNER_KEY_ID=securist-operator-release-key
npm ci
npm run operator:rc
npm run operator:rc:verify-clean -- --rc-dir .operator-rc/securist-operator-0.1.0-rc
npm run operator:rc:publish-prep
```

Attach (from `.operator-rc/`, gitignored):

| File | Role |
|------|------|
| `securist-operator-<version>-rc.tgz` | Signed pack |
| `SHA256SUMS.txt` (from publish-prep) | Integrity |
| `MANIFEST.json` (copy) | Provenance |
| `RELEASE-NOTES-DRAFT.md` (from publish-prep) | Human-edited then paste into GH Release |

**Required inside the tarball:** `dist/cli.js`, `bin/securist.mjs`, `package.json`, `keys/trust-root.pem`, `runtime-identity.json`, `MANIFEST.json`, `VERIFY.md`.

**Forbidden:** private key, `DATABASE_URL`, any customer data.

---

## GitHub Release steps (human)

1. Tag (example): `operator-v0.1.0-rc.1` on the exact commit used to build.  
2. Create **pre-release** on `wantzjt/securist-hub` (or `securist` org mirror if directed).  
3. Title: `Local Operator 0.1.0 RC — signed · not npm`.  
4. Body: paste edited `RELEASE-NOTES-DRAFT.md`. Must say:
   - Not public npm / not `npx`  
   - How to unpack + `node bin/securist.mjs doctor`  
   - Link to site `/operator` Path B  
   - Team Graph not live  
5. Upload tarball + SHA256SUMS + MANIFEST.  
6. **Do not** flip site copy to “download from Releases” until you intentionally want that CTA (optional follow-up WO).  
7. **Do not** run `npm publish`.  

CLI sketch (human; requires `gh` auth):

```bash
# After publish-prep; paths are local examples
gh release create operator-v0.1.0-rc.1 \
  --prerelease \
  --title "Local Operator 0.1.0 RC — signed · not npm" \
  --notes-file .operator-rc/RELEASE-NOTES-DRAFT.md \
  .operator-rc/securist-operator-0.1.0-rc.tgz \
  .operator-rc/SHA256SUMS.txt \
  .operator-rc/securist-operator-0.1.0-rc/MANIFEST.json
```

---

## Post-publish honesty matrix

| Surface | After first GH Release | Still forbidden |
|---------|------------------------|-----------------|
| Monorepo | Unchanged | — |
| `/operator` Path B | May later link “GitHub Releases” explicitly (separate WO) | Claiming public npx |
| BUYER-MESSAGING | Update only when human unlocks download CTA | “Available on npm” |
| Announcement | Still **HOLD** unless founder decides otherwise | Launch blog implying full golden path paid loop |

---

## Rollback

- Delete or mark Release as deprecated.  
- Site copy never claimed npx — no site rollback required.  
- Trust-root rotation only if private key compromised (new keypair + WO like WO-020).  

---

## Agent vs human

| Actor | May |
|-------|-----|
| **Grok** | `operator:rc:publish-prep`, docs, verify scripts, draft notes |
| **Human** | Hold key, create GH Release, decide messaging unlock, npm later |

---

## Explicit non-goals of this gate

- R1 / Team Graph  
- npm public package  
- Credits, accounts, cloud assess of private code  
- TARX branding as customer infrastructure  
