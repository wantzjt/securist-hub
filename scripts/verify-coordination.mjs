#!/usr/bin/env node
/**
 * Coordination control-plane checks (dependency-free).
 *
 * - Validates ops/work-orders/WO-*.md YAML front matter
 * - Requires PR body Work-Order: WO-NNN when PR context is present
 * - Flags contract / migration / state-machine changes that lack
 *   corresponding docs or tests in the same change set
 *
 * Does NOT claim to prove tenant isolation, security, or correctness.
 * Exit 0 = pass; exit 1 = fail.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const WO_DIR = join(ROOT, 'ops', 'work-orders')
const STATUSES = new Set([
  'proposed',
  'ready',
  'in_progress',
  'in_review',
  'blocked',
  'complete',
])
const REQUIRED_FIELDS = [
  'id',
  'title',
  'status',
  'owner',
  'branch',
  'depends_on',
  'contracts',
  'acceptance',
  'non_goals',
  'verification',
]

const errors = []
const warnings = []

function fail(msg) {
  errors.push(msg)
}

function warn(msg) {
  warnings.push(msg)
}

/** Minimal front-matter parser (YAML subset: keys, strings, lists). */
function parseFrontMatter(text, fileLabel) {
  if (!text.startsWith('---')) {
    fail(`${fileLabel}: missing opening --- front matter`)
    return null
  }
  const end = text.indexOf('\n---', 3)
  if (end === -1) {
    fail(`${fileLabel}: missing closing --- front matter`)
    return null
  }
  const block = text.slice(3, end).replace(/^\n/, '')
  const data = {}
  let currentList = null
  let currentKey = null

  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line.trim() || line.trim().startsWith('#')) continue

    const listItem = line.match(/^\s+-\s+(.*)$/)
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = []
      let v = listItem[1].trim()
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      data[currentKey].push(v)
      currentList = currentKey
      continue
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!kv) {
      fail(`${fileLabel}: unparsed front-matter line: ${line}`)
      continue
    }
    currentKey = kv[1]
    currentList = null
    let val = kv[2].trim()
    if (val === '' || val === '[]') {
      data[currentKey] = []
      continue
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (val.startsWith('[') && val.endsWith(']')) {
      const inner = val.slice(1, -1).trim()
      data[currentKey] = inner
        ? inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''))
        : []
      continue
    }
    data[currentKey] = val
  }

  void currentList
  return data
}

function validateWorkOrder(filePath) {
  const rel = relative(ROOT, filePath)
  const text = readFileSync(filePath, 'utf8')
  const data = parseFrontMatter(text, rel)
  if (!data) return

  for (const field of REQUIRED_FIELDS) {
    if (!(field in data)) {
      fail(`${rel}: missing required field "${field}"`)
    }
  }

  if (data.id != null && !/^WO-\d+$/.test(String(data.id))) {
    fail(`${rel}: id must match WO-<digits> (got ${data.id})`)
  }

  const base = filePath.split('/').pop() || ''
  if (data.id && !base.startsWith(String(data.id))) {
    fail(`${rel}: filename should start with ${data.id}`)
  }

  if (data.title != null && !String(data.title).trim()) {
    fail(`${rel}: title must be non-empty`)
  }

  if (data.status != null && !STATUSES.has(String(data.status))) {
    fail(
      `${rel}: status must be one of ${[...STATUSES].join('|')} (got ${data.status})`,
    )
  }

  if (data.owner == null || !String(data.owner).trim()) {
    fail(`${rel}: owner must be non-empty`)
  }

  for (const listField of [
    'depends_on',
    'contracts',
    'acceptance',
    'non_goals',
    'verification',
  ]) {
    if (data[listField] != null && !Array.isArray(data[listField])) {
      fail(`${rel}: ${listField} must be a list`)
    }
  }

  for (const listField of ['acceptance', 'non_goals', 'verification']) {
    if (Array.isArray(data[listField]) && data[listField].length === 0) {
      fail(`${rel}: ${listField} must contain at least one item`)
    }
  }

  const status = String(data.status || '')
  if (
    (status === 'in_progress' || status === 'in_review') &&
    !String(data.branch || '').trim()
  ) {
    fail(`${rel}: branch required when status is ${status}`)
  }

  if (Array.isArray(data.depends_on)) {
    for (const dep of data.depends_on) {
      if (!/^WO-\d+$/.test(String(dep))) {
        fail(`${rel}: depends_on entry must be WO-id (got ${dep})`)
      }
    }
  }
}

function loadAllWorkOrders() {
  if (!existsSync(WO_DIR)) {
    fail('ops/work-orders/ directory missing')
    return
  }
  const files = readdirSync(WO_DIR)
    .filter((f) => f.startsWith('WO-') && f.endsWith('.md'))
    .map((f) => join(WO_DIR, f))
  if (files.length === 0) {
    fail('no WO-*.md work orders found')
    return
  }
  for (const f of files) validateWorkOrder(f)
}

function readPrBody() {
  if (process.env.PR_BODY) return process.env.PR_BODY
  if (
    process.env.GITHUB_EVENT_PATH &&
    existsSync(process.env.GITHUB_EVENT_PATH)
  ) {
    try {
      const event = JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'),
      )
      return event.pull_request?.body || event.issue?.body || ''
    } catch {
      return ''
    }
  }
  return ''
}

function checkPrBodyWorkOrder() {
  const body = readPrBody()
  const requirePr =
    process.env.REQUIRE_PR_WORK_ORDER === '1' ||
    process.env.GITHUB_EVENT_NAME === 'pull_request'

  if (!body) {
    if (requirePr) {
      fail(
        'PR body missing: include "Work-Order: WO-NNN" (set PR_BODY for local PR simulation)',
      )
    } else {
      warn(
        'No PR body in environment — skipping Work-Order reference check (local ok)',
      )
    }
    return
  }

  const match = body.match(/Work-Order:\s*(WO-\d+)/i)
  if (!match) {
    fail('PR body must include a line like: Work-Order: WO-001')
    return
  }
  const id = match[1].toUpperCase().replace('WO-', 'WO-')
  const normalized = match[1].match(/WO-(\d+)/i)
  const woId = normalized ? `WO-${normalized[1]}` : id
  const woFiles = existsSync(WO_DIR)
    ? readdirSync(WO_DIR).filter((f) => f.startsWith(woId) && f.endsWith('.md'))
    : []
  if (woFiles.length === 0) {
    fail(`PR references ${woId} but no ops/work-orders/${woId}-*.md exists`)
  }
}

function gitChangedFiles() {
  try {
    const base = process.env.GITHUB_BASE_REF
      ? `origin/${process.env.GITHUB_BASE_REF}`
      : process.env.COORDINATION_DIFF_BASE || 'origin/main'
    // staged + unstaged + commits not in base
    let out = ''
    try {
      out = execSync(`git diff --name-only ${base}...HEAD`, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
    } catch {
      out = execSync('git diff --name-only HEAD', {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
    }
    const unstaged = execSync('git diff --name-only', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const staged = execSync('git diff --name-only --cached', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const set = new Set(
      [...out.split('\n'), ...unstaged.split('\n'), ...staged.split('\n')]
        .map((s) => s.trim())
        .filter(Boolean),
    )
    return [...set]
  } catch {
    warn('git diff unavailable — skipping change-set contract heuristics')
    return []
  }
}

/**
 * Heuristic only: if contracts/migrations/state-machine change,
 * expect some docs and/or tests in the same change set.
 * Not a proof of tenant isolation or correctness.
 */
function checkContractChangeHygiene(files) {
  if (files.length === 0) return

  const contracty = files.filter(
    (f) =>
      f.startsWith('packages/contracts/') ||
      f.startsWith('migrations/') ||
      f === 'src/lib/decision-graph/state-machine.ts' ||
      f === 'src/lib/decision-graph/types.ts' ||
      f === 'src/lib/decision-graph/outbox.ts' ||
      f === 'src/lib/decision-graph/store.ts',
  )

  if (contracty.length === 0) return

  const hasDocs = files.some(
    (f) =>
      f.startsWith('docs/') &&
      (f.includes('CONTRACT') ||
        f.includes('SYSTEM-MODEL') ||
        f.includes('OPERATIONS') ||
        f.includes('DECISION') ||
        f.includes('ROADMAP') ||
        f.includes('INFRA')),
  )
  const hasTests = files.some(
    (f) =>
      f.includes('fixtures/') ||
      f.includes('.test.') ||
      f.includes('run-e2e') ||
      f.includes('run-store') ||
      f.includes('test:'),
  )

  if (!hasTests) {
    fail(
      `contract/migration/state-machine changes without regression tests in the same change set:\n  - ${contracty.join('\n  - ')}\n` +
        'Add or update fixtures/tests. Documentation alone is not regression proof.',
    )
  }
  if (!hasDocs) {
    warn(
      'contract/migration/state-machine changes present without docs/* updates — confirm intentional',
    )
  }

  // Honesty marker: never claim isolation proof
  warn(
    'Note: verify:coordination does not prove tenant isolation or transactional outbox correctness',
  )
}

function main() {
  console.log('verify:coordination — work orders + PR hygiene\n')

  loadAllWorkOrders()
  checkPrBodyWorkOrder()
  const files = gitChangedFiles()
  if (files.length) {
    console.log(`Changed files considered: ${files.length}`)
  }
  checkContractChangeHygiene(files)

  for (const w of warnings) console.warn(`WARN: ${w}`)
  for (const e of errors) console.error(`FAIL: ${e}`)

  if (errors.length) {
    console.error(`\nverify:coordination failed (${errors.length} error(s))`)
    process.exitCode = 1
    return
  }
  console.log('\nverify:coordination ok')
}

main()
