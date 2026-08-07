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
