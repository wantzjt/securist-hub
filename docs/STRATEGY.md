# Securist strategy

## Thesis

Intelligence-to-action for security engineering:

**Discover → understand → validate locally → contribute or integrate → retain evidence.**

Not a social timeline, news site, or bulk-forking machine.

## Five questions per artifact

1. Adopt under which policy and use?
2. What changed since approval?
3. What did we test locally, with which boundary?
4. What upstream contribution remained compatible?
5. Which approvals are now stale (license, provenance, vuln, model, crypto)?

## Dual-forge

| Lane | System |
|------|--------|
| Code | GitHub |
| Weights / public models | Hugging Face |
| Decision why/trust | **Securist Decision Graph** |
| Cloud research workflows | **Eve** (propose only — see `docs/EVE-RUNTIME.md`) |
| Local private validation | **TARX / operator** (optional, never vendored) |

**Eve proposes → Securist contracts decide → humans approve external writes.**

## Activity

Operations pulse across GitHub, Hugging Face, site ledger, operator evidence, policy/decision changes. Always show source, verification, what/why/action.

## Filters that change decisions

Domain · artifact type · decision status · action · evidence domain · scope (public / org / operator).

Post-quantum remains first-class: inventory and migration implication—not fear marketing.
