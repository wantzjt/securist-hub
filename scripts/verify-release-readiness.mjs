#!/usr/bin/env node
/**
 * Release-process completeness checks (dependency-free, offline-safe).
 *
 * Verifies that release-train documentation and work-order gates exist
 * and contain required sections / references.
 *
 * NEVER claims to prove:
 * - live Vercel or tarx scope
 * - database connectivity or migration applied
 * - production route health
 * - customer/PoV evidence
 * - security headers or secret absence in production
 *
 * Exit 0 = pass; exit 1 = fail.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')

const errors = []
const warnings = []

function fail(msg) {
  errors.push(msg)
}

function warn(msg) {
  warnings.push(msg)
}

function read(rel) {
  const p = join(ROOT, rel)
  if (!existsSync(p)) {
    fail(`missing required file: ${rel}`)
    return null
  }
  return readFileSync(p, 'utf8')
}

function mustInclude(text, rel, patterns) {
  if (!text) return
  for (const p of patterns) {
    const re = typeof p === 'string' ? new RegExp(p, 'i') : p
    if (!re.test(text)) {
      fail(`${rel}: missing required pattern ${re}`)
    }
  }
}

function mustNotClaim(text, rel, patterns) {
  if (!text) return
  for (const p of patterns) {
    const re = typeof p === 'string' ? new RegExp(p, 'i') : p
    if (re.test(text)) {
      // Soft: only warn if we find dangerous "R1 is active" without "not"
      warn(`${rel}: review claim matching ${re} (ensure not overstating live activation)`)
    }
  }
}

function parseFrontMatter(text, label) {
  if (!text.startsWith('---')) {
    fail(`${label}: missing YAML front matter`)
    return null
  }
  const end = text.indexOf('\n---', 3)
  if (end === -1) {
    fail(`${label}: unclosed YAML front matter`)
    return null
  }
  return text.slice(3, end)
}

function requireWo(id) {
  const dir = join(ROOT, 'ops', 'work-orders')
  if (!existsSync(dir)) {
    fail('ops/work-orders/ missing')
    return
  }
  const files = readdirSync(dir).filter(
    (f) => f.startsWith(id) && f.endsWith('.md'),
  )
  if (files.length === 0) {
    fail(`work order file for ${id} not found under ops/work-orders/`)
    return null
  }
  const rel = `ops/work-orders/${files[0]}`
  const text = read(rel)
  if (!text) return null
  const fm = parseFrontMatter(text, rel)
  if (fm && !new RegExp(`id:\\s*${id}\\b`).test(fm)) {
    fail(`${rel}: front matter id must be ${id}`)
  }
  return { rel, text, fm }
}

function main() {
  console.log('verify:release-readiness — offline release process check\n')
  console.log(
    'Note: this does not verify live Vercel, databases, customers, or production security.\n',
  )

  // —— Required artifacts ——
  const releasePlan = read('docs/RELEASE-PLAN.md')
  const r3 = read('ops/release/R3-STRONG-RELEASE.md')
  const rm003 = read('docs/RM-003-PROVISION-CHECKLIST.md')
  const infra = read('docs/INFRA-AUDIT-POSTGRES.md')
  const founder = read('docs/FOUNDER-THESIS.md')

  mustInclude(releasePlan, 'docs/RELEASE-PLAN.md', [
    /## R0/,
    /## R1/,
    /## R2/,
    /## R3/,
    /Entry criteria/i,
    /Exit criteria/i,
    /R1 is not active/i,
    /SECURIST_GRAPH_STORE/,
    /SECURIST_DEFAULT_TENANT_ID/,
    /WO-008/,
    /P0/,
  ])

  mustInclude(r3, 'ops/release/R3-STRONG-RELEASE.md', [
    /Contract/i,
    /Migration/i,
    /Environment/i,
    /route smoke/i,
    /Security headers/i,
    /Error-log/i,
    /Customer-proof/i,
    /Go\s*\/\s*no-go/i,
    /P0/,
    /Automated/i,
    /Human/i,
    /verify:release-readiness/,
  ])

  // Explicit honesty: plan must not assert R1 active without human gate language
  if (releasePlan && /R1 is active/i.test(releasePlan) && !/not active/i.test(releasePlan)) {
    fail(
      'docs/RELEASE-PLAN.md: claims "R1 is active" without "not active" guard language',
    )
  }

  // —— Work orders ——
  const wo007 = requireWo('WO-007')
  const wo008 = requireWo('WO-008')

  if (wo007?.text) {
    mustInclude(wo007.text, wo007.rel, [
      /RELEASE-PLAN/,
      /R3-STRONG-RELEASE/,
      /verify:release-readiness/,
    ])
  }

  if (wo008?.text) {
    mustInclude(wo008.text, wo008.rel, [
      /SECURIST_GRAPH_STORE/,
      /DATABASE_URL/,
      /SECURIST_DEFAULT_TENANT_ID/,
      /001_decision_graph\.sql/,
      /[Rr]ollback/,
      /[Ss]moke/,
      /blocked|human/i,
    ])
    if (wo008.fm && !/status:\s*blocked/.test(wo008.fm) && !/status:\s*ready/.test(wo008.fm) && !/status:\s*complete/.test(wo008.fm) && !/status:\s*in_progress/.test(wo008.fm)) {
      fail(`${wo008.rel}: expected a known status for R1 prep WO`)
    }
    // Prefer blocked until authority — warn if complete without evidence note
    if (wo008.fm && /status:\s*complete/.test(wo008.fm)) {
      warn(
        `${wo008.rel}: status complete — ensure R1 human evidence exists outside CI claims`,
      )
    }
  }

  // —— Package script ——
  const pkgPath = join(ROOT, 'package.json')
  if (!existsSync(pkgPath)) {
    fail('package.json missing')
  } else {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    if (!pkg.scripts?.['verify:release-readiness']) {
      fail('package.json missing scripts["verify:release-readiness"]')
    }
  }

  // —— CI wiring (optional soft fail if workflow missing step) ——
  const ciPath = join(ROOT, '.github', 'workflows', 'ci.yml')
  if (!existsSync(ciPath)) {
    warn('.github/workflows/ci.yml missing — cannot confirm CI wiring')
  } else {
    const ci = readFileSync(ciPath, 'utf8')
    if (!/verify:release-readiness/.test(ci)) {
      fail(
        '.github/workflows/ci.yml: must invoke npm run verify:release-readiness',
      )
    }
  }

  // —— Related durable-path docs ——
  mustInclude(rm003, 'docs/RM-003-PROVISION-CHECKLIST.md', [
    /DATABASE_URL/,
    /SECURIST_DEFAULT_TENANT_ID/,
    /tarx/i,
  ])
  mustInclude(infra, 'docs/INFRA-AUDIT-POSTGRES.md', [
    /SECURIST_GRAPH_STORE/,
    /missing_default_tenant_id|DEFAULT_TENANT/,
  ])
  if (founder && !/stale-approval|PoV|interview/i.test(founder)) {
    warn('docs/FOUNDER-THESIS.md: expected founder bar language for R2 linkage')
  }

  // —— Forbidden fake-live patterns in the verifier's own promise ——
  // (document that release plan must not instruct CI to curl production secrets)
  if (r3 && /DATABASE_URL\s*=\s*postgres/i.test(r3)) {
    fail(
      'ops/release/R3-STRONG-RELEASE.md: must not embed live connection strings',
    )
  }

  for (const w of warnings) console.warn(`WARN: ${w}`)
  for (const e of errors) console.error(`FAIL: ${e}`)

  if (errors.length) {
    console.error(
      `\nverify:release-readiness failed (${errors.length} error(s))`,
    )
    process.exitCode = 1
    return
  }
  console.log('verify:release-readiness ok')
  console.log(
    '(Reminder: live R1–R3 evidence remains human-owned; this check is document/gate completeness only.)',
  )
}

main()
