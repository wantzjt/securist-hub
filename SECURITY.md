# Security Policy

Report vulnerabilities to **securist_info_sec@protonmail.com**.

Public posture page: https://secur.ist/security

## Scope

- This repository (`wantzjt/securist-hub` / Securist org)  
- Live public product at secur.ist (especially `/assess`)  
- Monorepo Local Operator when run from source  
- Legal public-source / authorized testing only  

## Out of scope

- Unauthorized access, credential stuffing, social engineering of third parties  
- Testing private customer systems or non-public repos you do not own  
- Household GeoIP claims as identity  
- Illegal rehost of model weights  
- Demanding maintainers accept unsolicited offensive tooling  

## Coordinated disclosure

1. Email **securist_info_sec@protonmail.com** with description, impact, and reproduction.  
2. Allow reasonable time before public disclosure.  
3. Do not open a public issue for actively exploitable issues until coordinated.  

## Product honesty (attackers and researchers)

We intentionally **do not** claim:

- Public cloud assessment of private repositories  
- Autonomous exploitation or “AI red team” as a product  
- Shared multi-tenant durable graph before R1  

False capability claims in third-party writeups should be corrected against [`README.md`](README.md).

## Operator / signing

Release private keys are human-held. See [`docs/OPERATOR-RELEASE-LANE.md`](docs/OPERATOR-RELEASE-LANE.md).  
Do not submit PRs that embed private keys or weaken the packaged-artifact signature set.

**Release signature algorithm:** Ed25519 against the packaged public trust root.  
Unsigned monorepo builds report `runtime_unavailable` and block assess honesty-first.

## Crypto-agility inventory (posture — not a feature claim)

Where TLS / transport applies, Securist **inventory preference** is hybrid
post-quantum / traditional key agreement **X25519MLKEM768** (ML-KEM-768 + X25519;
hybrid KEM design in the RFC 10024-family hybrid TLS work).

| Claim | Truth |
|-------|--------|
| Inventory prefers X25519MLKEM768 for transport where applicable | Yes — posture for what to track |
| Local Operator negotiates ML-KEM / hybrid PQ TLS today | **No** |
| Operator release signing is Ed25519 trust-root | **Yes** |
| Quantum-fear marketing / “PQ-ready product” theater | **No** |

Public page: https://secur.ist/security

## Public forge honesty

| Surface | Canonical |
|---------|-----------|
| Product hub / open build | https://github.com/wantzjt/securist-hub |
| Public beachhead packages | https://github.com/Securist-InfoSec (scaffolds, not production CTI platforms) |
| Empty user `github.com/securist` | **Not** the package forge |
| Hugging Face house org | Do not claim live until the org resolves |
