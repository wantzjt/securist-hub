#!/usr/bin/env node
/**
 * WO-018 — Local Operator release-candidate preflight (no secrets).
 *
 * Automates every non-secret check possible before human signing.
 * Does NOT sign, publish, or claim public npx availability.
 *
 * Exit 0 = preflight pass; exit 1 = fail with precise errors.
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createPublicKey } from 'node:crypto'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OPERATOR = join(ROOT, 'packages/operator')
const errors = []
const warnings = []
const checks = []

function fail(msg) {
  errors.push(msg)
  checks.push({ ok: false, msg })
}
function warn(msg) {
  warnings.push(msg)
  checks.push({ ok: true, warn: true, msg })
}
function ok(msg) {
  checks.push({ ok: true, msg })
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: process.env,
    ...opts,
  })
}

function scanForPrivateKeyMaterial(dir, baseLabel) {
  const hits = []
  function walk(d) {
    let entries
    try {
      entries = readdirSync(d, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      const p = join(d, e.name)
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist') continue
        walk(p)
        continue
      }
      if (!e.isFile()) continue
      if (e.name === 'trust-root.pem') continue
      if (/\.pem$/i.test(e.name) || /private.?key/i.test(e.name)) {
        hits.push(relative(ROOT, p))
        continue
      }
      if (e.name.endsWith('.json') || e.name.endsWith('.md') || e.name.endsWith('.mjs')) {
        try {
          const t = readFileSync(p, 'utf8')
          if (
            /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/.test(t) ||
            /BEGIN PRIVATE KEY/.test(t)
          ) {
            hits.push(relative(ROOT, p))
          }
        } catch {
          /* skip */
        }
      }
    }
  }
  walk(dir)
  return hits
}

async function main() {
  console.log('operator:rc:preflight — non-secret release-candidate checks\n')

  // Package honesty
  const pkgPath = join(OPERATOR, 'package.json')
  if (!existsSync(pkgPath)) {
    fail('packages/operator/package.json missing')
  } else {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    if (pkg.private !== true) {
      fail(
        'packages/operator/package.json must have "private": true until human publish gate',
      )
    } else ok('package.json private: true')
    if (pkg.name !== '@securist/operator') {
      fail(`unexpected package name: ${pkg.name}`)
    } else ok(`package name ${pkg.name}`)
    if (!pkg.bin?.securist) fail('package.json bin.securist missing')
    else ok('bin.securist declared')
  }

  // No private keys in operator tree
  const keyHits = scanForPrivateKeyMaterial(OPERATOR, 'operator')
  if (keyHits.length) {
    fail(
      `private key material found under packages/operator (must never ship):\n  - ${keyHits.join('\n  - ')}`,
    )
  } else ok('no private key material under packages/operator')

  // Public trust root is a public key
  const trustPath = join(OPERATOR, 'keys/trust-root.pem')
  if (!existsSync(trustPath)) {
    fail('packages/operator/keys/trust-root.pem missing')
  } else {
    const pem = readFileSync(trustPath, 'utf8')
    if (/PRIVATE KEY/.test(pem)) {
      fail('trust-root.pem must be PUBLIC key only')
    } else {
      try {
        createPublicKey(pem)
        ok('trust-root.pem is a loadable public key')
      } catch (e) {
        fail(`trust-root.pem not a valid public key: ${e}`)
      }
    }
  }

  // Build
  const build = run(process.execPath, ['scripts/build-operator.mjs'])
  if (build.status !== 0) {
    fail(`operator:build failed:\n${build.stderr || build.stdout}`)
  } else ok('operator:build ok')

  const distCli = join(OPERATOR, 'dist/cli.js')
  if (!existsSync(distCli)) fail('dist/cli.js missing after build')
  else {
    const js = readFileSync(distCli, 'utf8')
    if (/\bnpx\b/.test(js) || /\btsx\b/.test(js)) {
      fail('dist/cli.js references npx or tsx')
    } else ok('dist/cli.js free of npx/tsx')
  }

  const { computePackageContentDigest, PACKAGE_ARTIFACT_RELS } = await import(
    pathToFileURL(join(OPERATOR, 'package-artifacts.mjs')).href
  )
  const digest = computePackageContentDigest(OPERATOR)
  if (!digest.ok) fail(digest.error)
  else {
    ok(`package digest computable (${digest.hex.slice(0, 12)}…)`)
    ok(`signed set: ${PACKAGE_ARTIFACT_RELS.join(', ')}`)
  }

  // Unsigned path must block assess (precise failure)
  const home = join(ROOT, '.operator-rc', 'preflight-home')
  mkdirSync(home, { recursive: true })
  const doctor = run(
    process.execPath,
    [join(OPERATOR, 'bin/securist.mjs'), 'doctor'],
    {
      env: {
        ...process.env,
        SECURIST_HOME: home,
        // Force no identity
        SECURIST_OPERATOR_IDENTITY_PATH: join(home, 'no-such-identity.json'),
      },
    },
  )
  if (doctor.status === 0) {
    fail('doctor succeeded without signed identity — must fail closed')
  } else if (!/Runtime unavailable|runtime_unavailable|signed/i.test(doctor.stdout + doctor.stderr)) {
    fail(
      `doctor failed without clear runtime message:\n${doctor.stdout}\n${doctor.stderr}`,
    )
  } else ok('unsigned doctor fails closed with precise message')

  const assess = run(
    process.execPath,
    [
      join(OPERATOR, 'bin/securist.mjs'),
      'assess',
      join(OPERATOR, 'fixtures/sample-target'),
      '--intended-use',
      'RC preflight smoke',
    ],
    {
      env: {
        ...process.env,
        SECURIST_HOME: home,
        SECURIST_OPERATOR_IDENTITY_PATH: join(home, 'no-such-identity.json'),
      },
    },
  )
  if (assess.status === 0) {
    fail('assess succeeded without signed identity — must block')
  } else ok('unsigned assess blocked')

  // Operator unit fixtures
  const opTests = run('npm', ['run', 'test:operator'])
  if (opTests.status !== 0) {
    fail(`test:operator failed:\n${opTests.stderr || opTests.stdout}`)
  } else ok('test:operator passed')

  // Messaging honesty in release lane doc
  const lane = readFileSync(join(ROOT, 'docs/OPERATOR-RELEASE-LANE.md'), 'utf8')
  if (!/not.*npx|Do not.*npx|forthcoming/i.test(lane)) {
    warn('OPERATOR-RELEASE-LANE.md should keep public npx non-claim language')
  } else ok('release lane retains no-public-npx honesty')

  // Signing key env must not be required for preflight
  if (process.env.SECURIST_OPERATOR_SIGNING_KEY) {
    warn(
      'SECURIST_OPERATOR_SIGNING_KEY is set; preflight does not use it (sign is a separate step)',
    )
  } else ok('preflight did not require signing key')

  const report = {
    kind: 'operator_rc_preflight',
    ok: errors.length === 0,
    at: new Date().toISOString(),
    packageDigest: digest.ok ? digest.hex : null,
    checks,
    errors,
    warnings,
    nextHumanStep:
      'SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem npm run operator:rc',
    nonClaims: [
      'Does not publish to npm',
      'Does not enable public npx @securist/operator',
      'Does not store or require the private signing key',
    ],
  }

  // Generated reports live under gitignored .operator-rc/ (CI clean-worktree safe)
  const outDir = join(ROOT, '.operator-rc', 'evidence')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(
    join(outDir, 'preflight-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  )

  for (const c of checks) {
    const mark = c.ok ? (c.warn ? 'WARN' : 'ok') : 'FAIL'
    console.log(`  [${mark}] ${c.msg}`)
  }
  for (const w of warnings) console.warn(`WARN: ${w}`)
  for (const e of errors) console.error(`FAIL: ${e}`)

  if (errors.length) {
    console.error(`\noperator:rc:preflight failed (${errors.length})`)
    process.exitCode = 1
    return
  }
  console.log('\noperator:rc:preflight ok')
  console.log('evidence: .operator-rc/evidence/preflight-report.json')
  console.log('next: SECURIST_OPERATOR_SIGNING_KEY=… npm run operator:rc')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
