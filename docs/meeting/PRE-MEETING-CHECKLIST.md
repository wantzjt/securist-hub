# Pre-meeting checklist — intel firms

**Owner:** founder (human gates marked ★)  
**Agent prep done under WO-024:** meeting docs, WO hygiene, local signed RC  

---

## T−7 to T−2 days

| # | Item | Status owner |
|---|------|----------------|
| 1 | ★ **Backup** private signing key off this Mac (`~/.securist/keys/securist-operator-release-private.pem`) | human |
| 2 | Confirm [secur.ist](https://secur.ist), `/assess`, `/operator`, `/team` load | either |
| 3 | Dry-run [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) end-to-end once | human |
| 4 | Pick firm-specific public GitHub targets (1–2 repos they know) | human |
| 5 | GitHub **pre-release** Operator RC | **Done 2026-08-12** — [operator-v0.1.0-rc.1](https://github.com/wantzjt/securist-hub/releases/tag/operator-v0.1.0-rc.1) · still not npm |
| 6 | GitHub About description/topics | **Done 2026-08-12** via API (permission-system description + topics) |
| 7 | Print or PDF: [`INTEL-ONE-PAGER.md`](./INTEL-ONE-PAGER.md) + [`NON-PROMISES.md`](./NON-PROMISES.md) | human |
| 8 | Do **not** provision R1 for the meeting unless firm needs shared durable decisions *and* you accept residual risk | human |

---

## T−1 day

| # | Item |
|---|------|
| 1 | `cd vantage-hub && git pull && npm run test:golden-path` (expect 50/50 with key) |
| 2 | If using signed RC: `shasum -a 256 -c .operator-rc/SHA256SUMS.txt` |
| 3 | Offline: unpack RC → doctor → assess sample target |
| 4 | Browser smoke: assess a known public repo |
| 5 | Confirm no slides claim Team Graph live or public npx |
| 6 | Calendar: 30–45 min; leave 10 min for design-partner questions |

---

## T−0 (30 minutes before)

| # | Item |
|---|------|
| 1 | Close noisy tabs; open only demo tabs |
| 2 | Network check; have offline RC as backup |
| 3 | One-pager + non-promises card visible |
| 4 | Mentally restate product sentence once |

---

## Local RC commands (copy-paste)

```bash
cd /Users/master/ftw-lab/vantage-hub
export SECURIST_OPERATOR_SIGNING_KEY="$HOME/.securist/keys/securist-operator-release-private.pem"
export SECURIST_OPERATOR_SIGNER_KEY_ID=securist-operator-release-key
npm run operator:rc
npm run operator:rc:verify-clean -- --rc-dir .operator-rc/securist-operator-0.1.0-rc
npm run operator:rc:publish-prep
```

**2026-08-12 RC (local):**

| Field | Value |
|-------|--------|
| Tarball | `.operator-rc/securist-operator-0.1.0-rc.tgz` |
| SHA-256 | `8242def0c4967cae4216f12d24003c79584539c7a50c13ca923457acd69cad40` |
| Content digest | `436b6cd2b679e8151fa069b51d761882ba5501a39d213f6cec14ddb9e949ab73` |
| publicNpxClaim | false |

---

## GitHub Release (optional, human gate)

```bash
# From clean monorepo after publish-prep — does not npm publish
gh release create operator-v0.1.0-rc.1 \
  --repo wantzjt/securist-hub \
  --prerelease \
  --title "Local Operator 0.1.0 RC — signed · not npm" \
  --notes-file .operator-rc/RELEASE-NOTES-DRAFT.md \
  .operator-rc/securist-operator-0.1.0-rc.tgz \
  .operator-rc/SHA256SUMS.txt \
  .operator-rc/securist-operator-0.1.0-rc/MANIFEST.json
```

Do **not** run `npm publish`. Do **not** put `npx` on the website until deliberate unlock.

---

## After the meeting

| # | Item |
|---|------|
| 1 | Score confirm / revise / kill (interview kit) — private notes, no secrets in git |
| 2 | Log design-partner interest for WO-004 |
| 3 | Only open product WOs for *confirmed* gaps |
| 4 | Still HOLD broad announcement unless founder overrides |

---

## Hard stops (agents and humans)

- Commit or paste private signing key  
- Claim public npx  
- Flip production to Postgres without WO-008 authority  
- Promise SOC2 / SSO / air-gap on pilot day  
