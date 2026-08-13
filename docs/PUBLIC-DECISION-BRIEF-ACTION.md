# Public Decision Brief GitHub Action (WO-030)

Read-only **ephemeral** Decision Brief posted or updated as **one** PR comment.

**Not production approval. Team Graph not live.** Not a scanner, SCA, pentest, package-registry publish, or private-code cloud assess.

Dogfood: wantzjt/securist-hub workflow `.github/workflows/public-decision-brief.yml`.

---

## What it does

1. Runs on public `pull_request` (opened / synchronize / reopened / ready_for_review) or `workflow_dispatch` with a PR number.
2. Reads **public** repository plus pull-request metadata with `GITHUB_TOKEN`.
3. Renders a Decision Brief (observed facts, unknowns, evidence gaps, re-review triggers, non-authoritative policy hints).
4. Finds an existing issue comment whose body contains `<!-- securist-decision-brief -->` and **updates that comment**. If none exists, **creates one**. Re-runs do not spam.

It does **not** write repo contents, merge, close the PR, or scan file contents.

---

## Token and permissions

| Rule | Reality |
| ---- | ------- |
| Secret | **GITHUB_TOKEN only** — no PAT, no extra Actions secrets |
| Workflow permissions | `contents: read` · `pull-requests: write` |
| Checkout | `persist-credentials: false` |
| Public /assess path | Still **must not** use GITHUB_TOKEN (see PUBLIC-ASSESS-RATE-CONTROL.md) |

Anonymous public assess and this Action are different trust boundaries. This Action may use GITHUB_TOKEN **only** to list/create/update comments and read public metadata on the workflow own repository. It is not a way to raise /assess rate limits.

---

## Honesty labels (required in the comment)

- **ephemeral** — the comment is overwritten in place; not a durable tenant store
- **Not production approval** — humans still decide merge / production use
- **Team Graph not live** — not a Decision Graph write; R1 is not active
- `durable: false` · `decisionStatus: not_reviewed`
- File contents were **not** scanned

---

## Rate limit / failure (honest)

This Action **does not invent a brief** on failure.

| Condition | Behavior |
| --------- | -------- |
| GitHub 403 / 429 consistent with rate limit | Job **fails**. Message includes `rate_limited`. No fake success comment. |
| Other GitHub API errors | Job **fails** with `github_error`. |
| Missing GITHUB_TOKEN | Job **fails**. No extra-token fallback. |
| Private repository | Job **fails** and refuses to post. Private-code cloud assess is out of scope. |
| Fork PRs with read-only GITHUB_TOKEN | Comment write may 403. Job fails honestly; same-repo dogfood is the supported path. |
| Residual race (two first-runs before either comment exists) | Concurrency group cancels in-progress runs. If two marker comments ever exist, later runs update the **oldest** and do not create a third. |

GitHub published Actions GITHUB_TOKEN budget is on the order of thousands of requests per hour per repository (not an SLA; GitHub may change it). This workflow uses a handful of REST calls per run (repo, pull, comment list, create or patch).

Do **not** advertise unlimited posting, guaranteed delivery, or never-rate-limited behavior.

---

## Enable / dogfood

Same-repo (this hub): the workflow file on the default branch (and on the PR branch for pull_request jobs) is enough. No extra secret.

workflow_dispatch: Actions then public-decision-brief then Run workflow then PR number.

Manual check: open a public PR; one Brief comment appears; push another commit; the **same** comment updates (no second Brief comment).

---

## Non-goals

- Marketplace launch marketing
- package registry publish
- Team Graph live / R1
- Announce
- Private-code cloud assess
- Scanner theater (CVE lists, merge gates, invented vulns)

---

## Related

- Renderer: `scripts/public-decision-brief-comment.mjs`
- Composite action: `.github/actions/public-decision-brief/`
- Work order: `ops/work-orders/WO-030-public-decision-brief-action.md`
- Public assess (different path): `docs/PUBLIC-ASSESS-RATE-CONTROL.md`
