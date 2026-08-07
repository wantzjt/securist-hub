# Support

## What we support today

| Channel | Use for | Response |
|---------|---------|----------|
| **[GitHub Issues](https://github.com/wantzjt/securist-hub/issues)** | Bugs, docs gaps, reproducible monorepo failures | Best-effort; maintainers triage |
| **Public product** | [secur.ist/assess](https://secur.ist/assess) usage questions (public repos only) | Self-serve + issues |
| **Security** | Vulnerabilities | [`SECURITY.md`](SECURITY.md) · ops@secur.ist |

## What we do **not** provide (yet)

| Not available | Why |
|---------------|-----|
| SLA / paid support desk | No Team Graph product SKU live |
| Private repo assessment via the website | Pre-R1; use Local Operator monorepo path |
| Public `npx @securist/operator` install support | Not distribution-shipped ([release lane](docs/OPERATOR-RELEASE-LANE.md)) |
| “Please approve this package for production” as a service | Human decision stays with the customer |
| Autonomous remediation or agent execution as a product | Explicit non-goal for V1 |
| Customer private brief hosting | Free Operator is local-only |

## Design partners (Team Graph)

Shared decisions, drift, and re-review: design-partner conversations only until R1. See [`docs/BUYER-MESSAGING.md`](docs/BUYER-MESSAGING.md) and [`docs/ROADMAP.md`](docs/ROADMAP.md). Contact ops@secur.ist with **design partner** in the subject—no unsolicited customer data.

## Before opening an issue

1. Confirm the claim matches **live** capabilities (public assess vs monorepo Operator vs Team Graph).  
2. Include OS, Node version, command, and minimal reproduction.  
3. Redact secrets, private paths, and proprietary code.

## Status sources of truth

- Product truth: [`README.md`](README.md) · [`docs/STRATEGY.md`](docs/STRATEGY.md)  
- Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)  
- CI: protected `main` + workflow `verify`  
