# Session resume — Securist (pick up here)

**Last packed:** 2026-08-12  
**Repo:** [wantzjt/securist-hub](https://github.com/wantzjt/securist-hub) · local `ftw-lab/vantage-hub`  
**Purpose:** One page so a cold machine / new Grok session can continue without archaeology.

---

## Product truth (do not re-litigate)

```text
Public Assess (/assess)                 LIVE
Local Operator monorepo path            LIVE on /operator Path A
Local Operator signed RC path           UX on /operator Path B · Gate 1 proven offline
Team Graph / R1                         NOT LIVE (human Postgres only)
Public npx @securist/operator           NOT available
Broad announcement                      HOLD
```

**Locked sentence:** *Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.*

---

## Where things live

| Item | Path |
|------|------|
| Code | `/Users/master/ftw-lab/vantage-hub` → `wantzjt/securist-hub` |
| Public trust root | `packages/operator/keys/trust-root.pem` |
| **Private signing key** | `~/.securist/keys/securist-operator-release-private.pem` (mode 0600 · **never git**) |
| Public key mirror | `~/.securist/keys/securist-operator-release-public.pem` |
| Local signed RC (gitignored) | `.operator-rc/securist-operator-0.1.0-rc/` + `.tgz` |
| Golden-path tests | `npm run test:golden-path` |
| Publish gate plan | [`OPERATOR-PUBLISH-GATE.md`](./OPERATOR-PUBLISH-GATE.md) |
| R1 readiness | [`R1-READINESS-PACK.md`](./R1-READINESS-PACK.md) |
| Operator UX | `/operator` · WO-022 |
| **Intel meeting pack** | [`meeting/`](./meeting/) · WO-024 |

### Private key reminder

Do **not** run the `.pem` as a command (`permission denied` is correct).  
**Backup** that one private file off this Mac (encrypted USB / password manager). Losing it forces trust-root rotation.

```bash
ls -la ~/.securist/keys/
# -rw------- … securist-operator-release-private.pem
```

---

## 60-second health check (when you sit down)

```bash
cd /Users/master/ftw-lab/vantage-hub
git checkout main && git pull origin main
npm run test:golden-path
# expect 50/50 (or high 40s in CI without private key — production-sign block skips)
```

Optional with key present:

```bash
export SECURIST_OPERATOR_SIGNING_KEY="$HOME/.securist/keys/securist-operator-release-private.pem"
export SECURIST_OPERATOR_SIGNER_KEY_ID=securist-operator-release-key
npm run operator:rc
npm run operator:rc:verify-clean -- --rc-dir .operator-rc/securist-operator-0.1.0-rc
npm run operator:rc:publish-prep   # drafts notes under .operator-rc/ — does NOT publish
```

---

## Completed through this pack

| WO / gate | Result |
|-----------|--------|
| WO-018–019 | RC tooling + developer IA |
| WO-020 | Production trust-root on `main` · Gate 1 |
| WO-021 | CI golden-path battery |
| WO-022 | `/operator` dual path (monorepo + signed RC) |
| WO-023 | Publish-gate plan · R1 readiness pack · session resume |
| **WO-024** | Intel meeting kit · WO status hygiene · RC re-sign 2026-08-12 |

### 2026-08-12 Operator RC (local, gitignored)

| Field | Value |
|-------|--------|
| Tarball | `.operator-rc/securist-operator-0.1.0-rc.tgz` |
| SHA-256 | `8242def0c4967cae4216f12d24003c79584539c7a50c13ca923457acd69cad40` |
| Content digest | `436b6cd2b679e8151fa069b51d761882ba5501a39d213f6cec14ddb9e949ab73` |
| signerKeyId | `securist-operator-release-key` |
| publicNpxClaim | false |
| verify-clean | **PASS** (doctor Runtime verified · assess LocalDecisionBriefV1) |
| GitHub pre-release | [operator-v0.1.0-rc.1](https://github.com/wantzjt/securist-hub/releases/tag/operator-v0.1.0-rc.1) · **not** npm |

---

## Next moves (when you return)

| Priority | Work | Owner |
|----------|------|--------|
| **A** | Human: backup private key if not done | you |
| **B** | Optional: GitHub pre-release of signed RC ([`OPERATOR-PUBLISH-GATE.md`](./OPERATOR-PUBLISH-GATE.md)) | you or authorized session |
| **M** | Run meeting dry-run ([`meeting/DEMO-SCRIPT.md`](./meeting/DEMO-SCRIPT.md)) | you |
| **C** | R1: grant provision authority then [`R1-READINESS-PACK.md`](./R1-READINESS-PACK.md) | **you only** for credentials |
| **D** | Stay HOLD — no announce | default |

### Tell Grok

```text
Resume Securist from docs/SESSION-RESUME.md — continue with [A backup | B publish | M meeting dry-run | C R1 | D hold]
```

---

## Hard stops (agents must not do without you)

- Paste/commit private signing key  
- `npm publish` or claim public `npx`  
- Provision Postgres / set `DATABASE_URL` / flip `SECURIST_GRAPH_STORE=postgres`  
- Announce launch  
- Create Datadog customer connectors  

---

## Chat is not canonical

Source of truth: git work orders + `docs/ROADMAP.md` + this file + PRs.
