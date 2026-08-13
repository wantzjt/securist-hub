#!/usr/bin/env node
/**
 * WO-030 — post or update ONE ephemeral public Decision Brief comment on a PR.
 *
 * Read-only vs repository contents and secrets. Token is used only to
 * list / create / update issue comments. Not a production approval.
 * Team Graph is not live. Not a Decision Graph write.
 */
import { readFileSync, existsSync } from 'node:fs'
import {
  buildBriefMarkdown,
  findBriefComment,
  upsertBriefComment,
} from './public-decision-brief-lib.mjs'

const DEFAULT_API = 'https://api.github.com'
const USER_AGENT = 'securist-public-decision-brief'

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

async function githubJson(method, path, { token, apiUrl, body } = {}) {
  const url = `${apiUrl}${path}`
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": USER_AGENT,
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers["Content-Type"] = "application/json"
  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = { message: text }
    }
  }
  if (!response.ok) {
    const message = json?.message || text || response.statusText
    const kind = response.status === 403 || response.status === 429 ? "rate_limited" : "github_error"
    throw new Error(`${kind}: ${method} ${path} failed ${response.status}: ${message}. No brief was invented.`)
  }
  return json
}

async function listAllComments({ token, apiUrl, owner, repo, number }) {
  const all = []
  for (let page = 1; page <= 10; page++) {
    const batch = await githubJson(
      "GET",
      `/repos/${owner}/${repo}/issues/${number}/comments?per_page=100&page=${page}`,
      { token, apiUrl },
    )
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}

function parseRepo(fullName) {
  const [owner, repo] = String(fullName || "").split("/")
  if (!owner || !repo) {
    throw new Error(`GITHUB_REPOSITORY must be owner/repo (got ${fullName})`)
  }
  return { owner, repo }
}

async function runFromGithub() {
  const token = process.env.GITHUB_TOKEN
  const repoFull = process.env.GITHUB_REPOSITORY
  const apiUrl = process.env.GITHUB_API_URL || DEFAULT_API
  let number = Number.parseInt(String(process.env.PR_NUMBER || ''), 10)

  if (!token) {
    throw new Error('GITHUB_TOKEN is required (comment upsert only)')
  }
  if (!repoFull) {
    throw new Error('GITHUB_REPOSITORY is required')
  }
  if (!number && process.env.GITHUB_EVENT_PATH && existsSync(process.env.GITHUB_EVENT_PATH)) {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
    number = Number(event.pull_request?.number || event.inputs?.pr_number || 0)
  }
  if (!number) {
    throw new Error('PR_NUMBER is required')
  }

  const { owner, repo } = parseRepo(repoFull)
  const pr = await githubJson('GET', `/repos/${owner}/${repo}/pulls/${number}`, {
    token,
    apiUrl,
  })
  if (pr.base?.repo?.private || pr.head?.repo?.private) {
    throw new Error('Refusing private repositories (public Decision Brief dogfood only)')
  }
  const files =
    (await githubJson(
      'GET',
      `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`,
      { token, apiUrl },
    )) || []

  const markdown = buildBriefMarkdown({
    repository: {
      fullName: `${owner}/${repo}`,
      htmlUrl: pr.base?.repo?.html_url || `https://github.com/${owner}/${repo}`,
    },
    pullRequest: {
      number,
      title: pr.title,
      htmlUrl: pr.html_url,
      body: pr.body || '',
      headSha: pr.head?.sha,
      baseRef: pr.base?.ref,
      headRef: pr.head?.ref,
      author: pr.user?.login,
      draft: Boolean(pr.draft),
    },
    files,
    fetchedAt: new Date().toISOString(),
  })
  const comments = await listAllComments({
    token,
    apiUrl,
    owner,
    repo,
    number,
  })
  const existing = findBriefComment(comments)
  const result = await upsertBriefComment({
    existing,
    body: markdown,
    createComment: (body) =>
      githubJson('POST', `/repos/${owner}/${repo}/issues/${number}/comments`, {
        token,
        apiUrl,
        body: { body },
      }),
    updateComment: (id, body) =>
      githubJson('PATCH', `/repos/${owner}/${repo}/issues/comments/${id}`, {
        token,
        apiUrl,
        body: { body },
      }),
  })

  console.log(
    `Decision Brief comment ${result.action}: id=${result.id}${result.url ? ' ' + result.url : ''}`,
  )
}

async function main() {
  if (process.argv.includes('--self-test')) {
    const { runSelfTest } = await import('./public-decision-brief-lib.mjs')
    await runSelfTest()
    return
  }
  try {
    await runFromGithub()
  } catch (error) {
    fail(String(error?.stack || error))
  }
}

const isDirect =
  process.argv[1] &&
  process.argv[1].replaceAll('\\', '/').endsWith('public-decision-brief-comment.mjs')

if (isDirect) {
  await main()
}
