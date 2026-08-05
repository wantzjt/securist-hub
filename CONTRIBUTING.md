# Contributing to Securist (securist)

INFOSEC · OSINT · CTI · GEOIP · MODELS

## Rules

- **Public sources / authorized use only**
- Tag discoveries with **legal_risk**
- **Agent drafts, human merges**
- No MaxMind `.mmdb` binaries in git
- No secrets / `.env` with keys
- No personal handles on public product surfaces
- No fake vendor or government affiliation
- GeoIP is **not** identity (city/ASN honesty only)
- HF weights: operator-controlled cache; no illegal rehost

## Dual-forge

- **GitHub** (`securist`) — code packages
- **Hugging Face** (`securist`) — models/datasets/spaces discovery
- Hub: https://secur.ist

## PR checklist

- [ ] License / model card reviewed if HF-related
- [ ] legal_risk noted
- [ ] Smoke proof (route or `npm test`)
- [ ] No secrets

Ops: ops@secur.ist · Security: https://secur.ist/security
