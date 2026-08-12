# Securist production deployment

## Canonical target

| Item              | Value                                     |
| ----------------- | ----------------------------------------- |
| Product           | Securist                                  |
| Domain            | `secur.ist`                               |
| Vercel team       | `tarx`                                    |
| Vercel project    | `securist-hub`                            |
| Production URL    | `https://secur.ist`                       |
| Source repository | `https://github.com/wantzjt/securist-hub` |

Deploy Securist only through the TARX team. The scope guard is the source of truth: [docs/VERCEL-SCOPE.md](docs/VERCEL-SCOPE.md).

```bash
./scripts/vercel-deploy-tarx.sh
```

The wrapper links a missing local `.vercel` directory to `tarx/securist-hub`, verifies the expected project identity, and refuses to deploy if the local link points anywhere else.

## Production checks

Before deploying:

```bash
npm run typecheck
npm run test:lifecycle
npm run build
```

After deployment:

```bash
vercel domains verify secur.ist --scope tarx
curl -sS -I https://secur.ist
vercel logs secur.ist --scope tarx --level error --since 1h
```

Verify `/`, `/artifacts`, an Artifact Profile, `/activity`, `/models`, `/daemon`, and `/links`. `SEED` content must remain visibly distinct from live source evidence.

## Environment variables

The public runtime requires only:

| Variable                 | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `VITE_PUBLIC_HOSTNAME`   | Public host, normally `secur.ist`         |
| `VITE_PUBLIC_GITHUB_ORG` | Public GitHub organization identity (use Securist-InfoSec; not empty user securist)       |
| `VITE_PUBLIC_HF_ORG`     | Public Hugging Face organization identity |

Server-only integrations are optional and must not be added until their production gates are complete:

- `GITHUB_TOKEN` or `GH_TOKEN` for rate-limit headroom on public-source Scout calls.
- `SECURIST_DAEMON_SECRET` only as a development fallback; production operator ingest needs per-operator authentication and persistent nonce storage.
- Remote model-provider credentials only after an explicit data-boundary policy and provider opt-in.

Never commit a secret or expose it as a `VITE_PUBLIC_*` variable.

## DNS and transport

`secur.ist` is attached to the TARX Vercel project. Keep Cloudflare/TLS configuration aligned with Vercel’s current domain instructions:

- Full (strict) TLS
- HTTPS redirect enabled
- Rocket Loader disabled
- Vercel-provided DNS records used exactly as shown

The repository’s `vercel.json` carries the browser security headers. Any CSP change must preserve the local, self-hosted IBM Plex font assets and the approved GitHub/Hugging Face public-source connections.

## What is not a deploy switch

Shipping the public Decision Graph does not enable a durable organization database, an external daemon ingest endpoint, an Eve agent, or autonomous contributions. Those controls are separately gated in [docs/V1-LAUNCH-ROADMAP.md](docs/V1-LAUNCH-ROADMAP.md) and [docs/OPERATIONS.md](docs/OPERATIONS.md).
