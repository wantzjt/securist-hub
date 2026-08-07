# Public Assess — production rate-control checklist

Human-owned. This is **not** a product SLA and does not claim guaranteed QPS.

Anonymous `POST` public assess uses the **unauthenticated** GitHub REST API only.
No `GITHUB_TOKEN` / `GH_TOKEN` may be attached to this path (see `src/lib/public-repo-assess.ts`
and `test:public-assess`).

## Honest capacity facts

| Fact | Reality |
|------|---------|
| GitHub unauthenticated limit | On the order of **60 requests/hour per source IP** (GitHub’s published default; may change) |
| Calls per uncached assess | Up to **4** (`repo`, `releases/latest`, `commits`, `package.json`) |
| In-process fact cache | TTL + max entries (see `PUBLIC_ASSESS_RESILIENCE_V1`) reduce **repeat** load for the same public `owner/repo` |
| Cache scope | **Public repository facts only** — never `intendedUse`, never secrets, never private paths |
| Multi-instance | Cache is **process-local**. Horizontal scale does **not** share one cache or invent a global rate budget |
| Privileged tokens | First-party Scout may use tokens elsewhere; **public assess must not** “fix” rate limits with secrets |

## Pre-launch / load-spike checklist

- [ ] Confirm CI `test:public-assess` green (no Authorization header; redaction before fetch).
- [ ] Confirm outbound timeout is set (`PUBLIC_ASSESS_RESILIENCE_V1.githubTimeoutMs`).
- [ ] Confirm fact-cache bounds (`factCacheTtlMs`, `factCacheMaxEntries`) match ops intent.
- [ ] Watch client-visible codes: `rate_limited`, `timeout`, `upstream_unavailable`, `github_error`, `not_found`.
- [ ] Confirm edge / platform rate limits (Vercel, WAF, bot rules) are configured separately if needed — human-owned.
- [ ] Do **not** advertise unlimited assess, guaranteed throughput, or “never rate limited.”
- [ ] Do **not** log request bodies that may contain private intended-use text beyond what product policy allows.

## Client-visible failure honesty

| Code | Meaning |
|------|---------|
| `timeout` | GitHub did not answer within the configured abort timeout |
| `upstream_unavailable` | Network failure or GitHub 5xx / unusable upstream |
| `rate_limited` | GitHub 403 consistent with rate limit / secondary limit |
| `github_error` | Other non-success GitHub response not mapped above |
| `not_found` | Repo missing or not public |
| `private_repo` | Metadata indicated private (rejected) |

When these fire, the UI should surface the server error string and invite retry later — not invent success or seed “fake live” facts for public assess.

## Related

- Contract: `packages/contracts/src/public-assess.ts` (`PUBLIC_ASSESS_RESILIENCE_V1`)
- Runtime: `src/lib/public-repo-assess.ts`
- Work order: `ops/work-orders/WO-016-public-assess-resilience.md`
