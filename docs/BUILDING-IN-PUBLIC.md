# Building in public

Securist uses GitHub as a **proof engine**, not only a code host.  
Open build means **inspectable security-relevant work**—not dumping every internal thought.

North stars for posture: [OpenSSF Best Practices](https://openssf.org/projects/best-practices-badge/) · [SLSA provenance](https://slsa.dev/spec/v1.2/).

---

## Weekly build-note template

Publish (issue, discussion, or short post) using:

```markdown
## Week of YYYY-MM-DD

### Shipped
- …

### Evidence
- PR links, CI green, fixture counts, smoke notes

### Known limits
- What is *not* live (npx, Team Graph, etc.)

### Next narrow bet
- One WO / one outcome
```

**Rules:** Prefer shipped evidence over roadmap theater. Link PRs. Call out honesty gaps first.

---

## Release-note requirements

Every release note (see [`CHANGELOG.md`](../CHANGELOG.md)) must state:

| Field | Content |
|-------|---------|
| **Behavior** | What users/devs can do differently |
| **Compatibility / security impact** | Breaking changes, trust-boundary changes |
| **Verification** | Commands or checks that prove the release |
| **Rollback** | How to reverse or pin |

Operator distribution releases additionally require signed artifact digest, public trust root reference, and clean-machine verification steps ([`OPERATOR-RELEASE-LANE.md`](./OPERATOR-RELEASE-LANE.md)).

---

## Disclosure boundaries

### Never publish

- Customer repositories, private evidence, or **Local Operator** brief output  
- Secrets, private keys, signing private material, or attack-enabling runbooks  
- Unverified AI claims (“we found a vuln”) without source, verification state, and uncertainty  

### May publish

- Public Decision Brief methodology and share-safe contracts  
- Green protected PRs, changelogs, decision records (D-*)  
- Public Scout methodology fields below  
- Signed release **public** provenance (digests, trust root, verify commands)  

---

## Public Scout methodology

When publishing Scout or research snapshots, always include:

| Field | Required |
|-------|----------|
| **Source** | Exact public origin (API, URL, repo) |
| **Collection time** | When data was fetched (UTC) |
| **Observed vs inferred** | Separate labels; no silent inference as fact |
| **Gaps** | What was *not* checked |

Scout output is **evidence input**, never an automatic Decision Graph write or customer alert.

---

## Contribution posture

| Prefer | Avoid |
|--------|--------|
| Maintainer-first small PRs against claimed WOs | Unsolicited multi-feature dumps |
| Upstream-first fixes in dependencies | Fork farms and vanity mirrors |
| Contract + fixture proof | Docs-only claims of capability |
| One work order / one branch / clean tree | Parallel agent chaos on the same WO |

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) · [`AGENT-OPERATIONS.md`](./AGENT-OPERATIONS.md).

---

## Credibility stack (target)

1. Green protected PRs and reviewable diffs  
2. Reproducible signed release artifacts (Operator lane)  
3. Honest Decision Brief contracts and fixtures  
4. One public dogfood re-review: Securist-owned dependency drifts → decision reopens → human resolves  
5. Changelog + security disclosure path that stay accurate  
