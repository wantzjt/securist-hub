#!/usr/bin/env node
/**
 * WO-030 public Decision Brief comment helpers.
 * Not production approval. Team Graph not live. Not a scanner.
 */

export const COMMENT_MARKER = "<!-- securist-decision-brief -->"
export const HONESTY_STAMP =
  "Ephemeral public draft · Not durable · Not a production approval · Team Graph shared memory is not live"

function code(value) {
  return "`" + String(value) + "`"
}

function extractWorkOrder(body) {
  if (!body) return null
  const match = String(body).match(/Work-Order:\s*(WO-\d+)/i)
  if (!match) return null
  const digits = match[1].match(/WO-(\d+)/i)
  return digits ? "WO-" + digits[1] : null
}

export function buildBriefMarkdown(input) {
  const repo = input.repository
  const pr = input.pullRequest
  const files = Array.isArray(input.files) ? input.files : []
  const fetchedAt = input.fetchedAt
  const workOrder = extractWorkOrder(pr.body)
  const assessUrl = "https://secur.ist/assess?url=" + encodeURIComponent(repo.htmlUrl)
  const headSha = pr.headSha || "unknown"
  const fileLines = files.slice(0, 20).map((file) => {
    const name = file.filename || file.path || "unknown"
    const status = file.status || "modified"
    return "- " + code(status) + " " + name
  })
  if (files.length > 20) {
    fileLines.push("- ... " + (files.length - 20) + " more files not listed")
  }

  const observed = [
    {
      domain: "provenance",
      assertion: "Public pull request " + repo.fullName + "#" + pr.number + " at head " + String(headSha).slice(0, 12) + ".",
      verification: "observed",
      source: "github:api:pulls/" + pr.number,
    },
    {
      domain: "provenance",
      assertion: "Base " + (pr.baseRef || "unknown") + " <- head " + (pr.headRef || "unknown") + " (" + files.length + " files observed on this page).",
      verification: "observed",
      source: "github:api:pulls/" + pr.number + "/files",
    },
  ]
  if (workOrder) {
    observed.push({
      domain: "provenance",
      assertion: "PR body references " + workOrder + ".",
      verification: "observed",
      source: "github:api:pulls/" + pr.number + "#body",
    })
  }

  const lines = [
    COMMENT_MARKER,
    "",
    "# Decision Brief · " + repo.fullName + "#" + pr.number,
    "",
    "> " + HONESTY_STAMP,
    ">",
    "> This GitHub comment is an ephemeral reviewer aid. It is **not** a Decision Graph write, **not** production approval, and **not** Team Graph shared memory.",
    ">",
    "> Full public assess (separate ephemeral draft): " + assessUrl,
    "",
    "- Status: " + code("not_reviewed"),
    "- Persistence: " + code("ephemeral_pr_comment"),
    "- Durable: " + code("false"),
    "- Data: " + code("LIVE") + " (GitHub PR API facts on this run)",
    "- Fetched: " + fetchedAt,
    workOrder ? "- Work order: " + code(workOrder) : "- Work order: " + code("none observed in PR body"),
    "",
    "## Scope (stated)",
    "",
    "- Intended use: Review proposed changes on this public pull request",
    "- Environment: development",
    "- Boundary: external_service (GitHub-hosted comment only)",
    "",
    "## Pull request (observed)",
    "",
    "- Canonical URL: " + pr.htmlUrl,
    "- Title: " + (pr.title || "(untitled)"),
    "- Head SHA: " + code(headSha),
    "- Base <- head: " + code(pr.baseRef || "unknown") + " <- " + code(pr.headRef || "unknown"),
    "- Author: " + (pr.author || "unknown"),
    "- Draft: " + (pr.draft ? "yes" : "no"),
    "",
    "## Changed files (this page)",
    "",
    ...(fileLines.length ? fileLines : ["- None observed on this API page"]),
    "",
    "## Observed facts (LIVE)",
    "",
  ]

  for (const fact of observed) {
    lines.push(
      "- **" + fact.domain + "** · " + code(fact.verification) + " — " + fact.assertion,
      "  - Source: " + fact.source,
    )
  }

  lines.push(
    "",
    "## Evidence gaps",
    "",
    "- No SCA, advisory, or pentest ran in this Action.",
    "- Team Graph / durable shared decision is not live (R1).",
    "- This comment is not retained as tenant Decision Graph state.",
    "- Maintainer authenticity and supply-chain attestations were not verified.",
    "",
    "## What would force re-review",
    "",
    "- New commits on this PR (this Action updates the same comment in place).",
    "- Scope, intended environment, or deployment boundary change.",
    "- Policy version change affecting this intended use.",
    "",
    "## Unknowns (explicit)",
    "",
    "- Runtime behavior of the proposed change was not executed here.",
    "- Private evidence (Local Operator) was not collected.",
    "",
    "## Policy hints (not a decision)",
    "",
    "- Human review is still required before merge or production use.",
    "- This brief is not an authoritative Decision Graph approval.",
    "- Public registry install of @securist/operator is not available.",
    "- Do not treat this comment as Team Graph, registry publish, or launch authority.",
    "",
    "## Disclaimers",
    "",
    "- Public-source observation only (GitHub PR API on this run).",
    "- No vulnerability is asserted from model narrative or inference.",
    "- Not a penetration test, SCA scan, or compliance certification.",
    "- Action permissions: contents read + pull-requests write (comment upsert only). No contents write, no PR merge, no branch mutation.",
    "- Save and monitor is not available until durable workspace (R1).",
    "",
  )

  return lines.join(String.fromCharCode(10))
}

export function findBriefComment(comments) {
  if (!Array.isArray(comments)) return null
  const matches = comments.filter(
    (comment) =>
      comment &&
      typeof comment.body === "string" &&
      comment.body.includes(COMMENT_MARKER),
  )
  if (matches.length === 0) return null
  return matches[0]
}

export async function upsertBriefComment({ existing, body, createComment, updateComment }) {
  if (existing && existing.id) {
    const updated = await updateComment(existing.id, body)
    return { action: "updated", id: updated.id, url: updated.html_url || null }
  }
  const created = await createComment(body)
  return { action: "created", id: created.id, url: created.html_url || null }
}

function samplePr() {
  return {
    repository: {
      fullName: "wantzjt/securist-hub",
      htmlUrl: "https://github.com/wantzjt/securist-hub",
    },
    pullRequest: {
      number: 62,
      title: "feat(ci): public Decision Brief GitHub Action (WO-030)",
      htmlUrl: "https://github.com/wantzjt/securist-hub/pull/62",
      body: "Work-Order: WO-030\
Fixes #62\
",
      headSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      baseRef: "main",
      headRef: "feat/wo-030-public-brief-action",
      author: "wantzjt",
      draft: false,
    },
    files: [
      { filename: ".github/workflows/public-decision-brief.yml", status: "added" },
      { filename: "scripts/public-decision-brief-comment.mjs", status: "added" },
    ],
    fetchedAt: "2026-08-13T02:00:00.000Z",
  }
}

function assert(name, condition, detail = "assertion failed") {
  if (!condition) throw new Error("self-test failed: " + name + ": " + detail)
  console.log("  ✓ " + name)
}

export async function runSelfTest() {
  console.log("public-decision-brief-comment — self-test" + String.fromCharCode(10))
  const markdown = buildBriefMarkdown(samplePr())
  assert("marker present", markdown.includes(COMMENT_MARKER))
  assert("honesty stamp", markdown.includes(HONESTY_STAMP))
  assert("not_reviewed", markdown.includes("not_reviewed"))
  assert("ephemeral persistence", markdown.includes("ephemeral_pr_comment"))
  assert("durable false", markdown.includes("`false`"))
  assert("work order observed", markdown.includes("WO-030"))
  assert("assess link", markdown.includes("https://secur.ist/assess?url="))
  assert("not production approval", /not a production approval/i.test(markdown) || /not production approval/i.test(markdown))
  assert("team graph not live", /Team Graph shared memory is not live/i.test(markdown))
  assert("operator distro honesty", markdown.includes("@securist/operator") && /not available/i.test(markdown))
  assert("not a graph write", /not.*Decision Graph write/i.test(markdown))
  assert("find none", findBriefComment([]) === null)
  assert("no registry publish claim", markdown.includes("registry publish"))

  const ours = { id: 101, body: markdown, user: { login: "github-actions[bot]" } }
  const other = { id: 99, body: "unrelated review comment", user: { login: "alice" } }
  const found = findBriefComment([other, ours])
  assert("find existing marker", found && found.id === 101)
  const createdStore = []
  const createResult = await upsertBriefComment({
    existing: null,
    body: markdown,
    createComment: async (body) => {
      const row = { id: 7, body, html_url: "https://example.test/comments/7" }
      createdStore.push(row)
      return row
    },
    updateComment: async () => { throw new Error("update must not run on create path") },
  })
  assert("create action", createResult.action === "created" && createResult.id === 7)
  assert("create once", createdStore.length === 1)
  const updatedStore = []
  const updateResult = await upsertBriefComment({
    existing: ours,
    body: markdown + String.fromCharCode(10),
    createComment: async () => { throw new Error("create must not run on update path") },
    updateComment: async (id, body) => {
      updatedStore.push({ id, body })
      return { id, html_url: "https://example.test/comments/101" }
    },
  })
  assert("update action", updateResult.action === "updated" && updateResult.id === 101)
  assert("update once not spam", updatedStore.length === 1)
  assert("no second create", createdStore.length === 1)
  console.log(String.fromCharCode(10) + "public-decision-brief-comment self-test ok")
}

const isDirect = process.argv[1] && process.argv[1].replaceAll("\\", "/").endsWith("public-decision-brief-lib.mjs")
if (isDirect) {
  await runSelfTest()
}
