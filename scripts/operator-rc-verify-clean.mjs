#!/usr/bin/env node
/**
 * WO-018 — clean-machine verification of a Local Operator release candidate.
 *
 * Usage:
 *   node scripts/operator-rc-verify-clean.mjs --rc-dir .operator-rc/securist-operator-0.1.0-rc
 *   node scripts/operator-rc-verify-clean.mjs --rc-tgz .operator-rc/securist-operator-0.1.0-rc.tgz
 *
 * Uses only dogfood/public fixture paths. No network required.
 * Exit 0 = golden path pass; exit 1 = precise failure.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
  copyFileSync,
  rmSync,
  chmodSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const steps = []

function fail(msg) {
  errors.push(msg)
  steps.push({ ok: false, msg })
}
function ok(msg) {
  steps.push({ ok: true, msg })
}

function parseArgs(argv) {
  const out = { rcDir: null, rcTgz: null, fixture: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--rc-dir') out.rcDir = argv[++i]
    else if (argv[i] === '--rc-tgz') out.rcTgz = argv[++i]
    else if (argv[i] === '--fixture') out.fixture = argv[++i]
  }
  return out
}

function runNode(rcDir, args, env = {}) {
  return spawnSync(process.execPath, [join(rcDir, 'bin/securist.mjs'), ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    cwd: rcDir,
  })
}

function extractTgz(tgz, destParent) {
  const r = spawnSync('tar', ['-xzf', tgz, '-C', destParent], {
    encoding: 'utf8',
  })
  if (r.status !== 0) {
    fail(`extract failed: ${r.stderr || r.stdout}`)
    return null
  }
  const entries = readdirSync(destParent).filter((n) =>
    n.startsWith('securist-operator-'),
  )
  if (!entries.length) {
    fail('tarball did not contain securist-operator-* directory')
    return null
  }
  return join(destParent, entries[0])
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  console.log('operator:rc:verify-clean — clean-machine golden path\n')

  let work = mkdtempSync(join(tmpdir(), 'securist-rc-verify-'))
  let rcDir = null
  let cleanupWork = true

  try {
    if (args.rcTgz) {
      const tgz = resolve(args.rcTgz)
      if (!existsSync(tgz)) {
        fail(`tarball not found: ${tgz}`)
      } else {
        rcDir = extractTgz(tgz, work)
      }
    } else if (args.rcDir) {
      rcDir = resolve(args.rcDir)
      cleanupWork = true
      if (!existsSync(rcDir)) fail(`rc dir not found: ${rcDir}`)
    } else {
      // Default: latest staged RC under monorepo .operator-rc
      const latest = join(ROOT, '.operator-rc/latest-rc.json')
      if (existsSync(latest)) {
        const j = JSON.parse(readFileSync(latest, 'utf8'))
        rcDir = resolve(ROOT, j.stageDir)
      } else {
        fail(
          'Provide --rc-dir or --rc-tgz (or run npm run operator:rc first to create .operator-rc/latest-rc.json)',
        )
      }
    }

    if (!rcDir || errors.length) {
      finish(null)
      return
    }

    // Structure
    for (const rel of [
      'bin/securist.mjs',
      'dist/cli.js',
      'package.json',
      'keys/trust-root.pem',
      'runtime-identity.json',
      'MANIFEST.json',
      'VERIFY.md',
    ]) {
      if (!existsSync(join(rcDir, rel))) fail(`RC missing required file: ${rel}`)
      else ok(`has ${rel}`)
    }

    const pkg = JSON.parse(readFileSync(join(rcDir, 'package.json'), 'utf8'))
    if (pkg.private !== true) {
      fail('RC package.json must remain private: true until human publish gate')
    } else ok('package private: true')
    if (/npx\s+@securist\/operator/i.test(JSON.stringify(pkg))) {
      fail('package.json must not advertise public npx')
    } else ok('no public npx string in package.json')

    const home = join(work, 'securist-home')
    mkdirSync(home, { recursive: true })
    const env = { SECURIST_HOME: home }

    // Doctor — must verify
    const doctor = runNode(rcDir, ['doctor'], env)
    if (doctor.status !== 0) {
      fail(`doctor failed (expected Runtime verified):\n${doctor.stdout}\n${doctor.stderr}`)
    } else if (!/Runtime verified/i.test(doctor.stdout)) {
      fail(`doctor exit 0 but missing "Runtime verified":\n${doctor.stdout}`)
    } else ok('doctor: Runtime verified')

    if (!/synthesis unavailable|Synthesis unavailable/i.test(doctor.stdout)) {
      fail('doctor must report synthesis unavailable (honest capability)')
    } else ok('doctor: synthesis unavailable (honest)')

    // Local state permissions
    const stateRoot = join(home, 'operator')
    if (!existsSync(stateRoot)) {
      fail('doctor did not create operator state root under SECURIST_HOME')
    } else {
      try {
        const mode = statSync(stateRoot).mode & 0o777
        if (mode !== 0o700 && process.platform !== 'win32') {
          fail(`state root mode ${mode.toString(8)} expected 700`)
        } else ok(`state root mode ok (${mode.toString(8)})`)
      } catch (e) {
        fail(`state mode check: ${e}`)
      }
    }

    // Assess fixture
    const fixture =
      args.fixture ||
      join(ROOT, 'packages/operator/fixtures/sample-target')
    if (!existsSync(fixture)) {
      fail(`fixture missing: ${fixture}`)
    } else {
      const assess = runNode(
        rcDir,
        [
          'assess',
          fixture,
          '--intended-use',
          'WO-018 clean-machine RC verification',
          '--json',
        ],
        env,
      )
      if (assess.status !== 0) {
        fail(`assess failed:\n${assess.stdout}\n${assess.stderr}`)
      } else {
        try {
          const brief = JSON.parse(assess.stdout)
          if (brief.kind !== 'local_decision_brief') {
            fail(`assess kind ${brief.kind} expected local_decision_brief`)
          } else ok('assess: LocalDecisionBriefV1 kind')
          if (brief.persistence !== 'local_only') {
            fail(`persistence ${brief.persistence} expected local_only`)
          } else ok('assess: persistence local_only')
          if (brief.shareability !== 'never_automatic') {
            fail(`shareability ${brief.shareability}`)
          } else ok('assess: shareability never_automatic')
          const dumped = JSON.stringify(brief)
          if (/\/Users\/|C:\\\\|file:\/\//i.test(dumped) && /Users\//.test(dumped)) {
            // soft: absolute paths in default brief are a honesty issue
            if (brief.rootLabel && brief.rootLabel.startsWith('/')) {
              fail('brief rootLabel must not be absolute path')
            }
          }
          ok('assess: Local Decision Brief produced')
        } catch (e) {
          fail(`assess JSON parse: ${e}\n${assess.stdout}`)
        }
      }
    }

    // MCP tools list
    const mcp = spawnSync(
      process.execPath,
      [join(rcDir, 'bin/securist.mjs'), 'mcp'],
      {
        encoding: 'utf8',
        env: { ...process.env, ...env },
        input: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
        }) + '\n',
      },
    )
    const mcpOut = mcp.stdout || ''
    if (!/get_brief/.test(mcpOut) || !/list_gaps/.test(mcpOut)) {
      fail(`MCP tools/list missing allowlisted tools:\n${mcpOut}\n${mcp.stderr}`)
    } else ok('MCP stdio: allowlisted tools present')
    if (/execute|shell|approve/i.test(mcpOut) && /"name"\s*:\s*"(execute|shell|approve)/i.test(mcpOut)) {
      fail('MCP listed forbidden tools')
    } else ok('MCP stdio: no execute/shell/approve tools')

    // Tamper dist/cli.js
    const cli = join(rcDir, 'dist/cli.js')
    const bak = join(rcDir, 'dist/cli.js.wo018-bak')
    copyFileSync(cli, bak)
    appendFileSync(cli, '\n// wo-018-tamper\n')
    const tampered = runNode(rcDir, ['doctor'], env)
    copyFileSync(bak, cli)
    rmSync(bak, { force: true })
    if (tampered.status === 0) {
      fail('doctor succeeded after dist/cli.js tamper — must fail')
    } else if (
      !/mismatch|digest|signature|unavailable|invalid/i.test(
        tampered.stdout + tampered.stderr,
      )
    ) {
      fail(
        `tampered doctor failed without digest/signature message:\n${tampered.stdout}\n${tampered.stderr}`,
      )
    } else ok('tampered dist/cli.js: doctor fails closed')

    // Assess must also block when tampered — re-tamper briefly
    copyFileSync(cli, bak)
    appendFileSync(cli, '\n// wo-018-tamper-2\n')
    const assessTamper = runNode(
      rcDir,
      ['assess', fixture, '--intended-use', 'should-block'],
      env,
    )
    copyFileSync(bak, cli)
    rmSync(bak, { force: true })
    if (assessTamper.status === 0) {
      fail('assess succeeded after tamper — must block')
    } else ok('tampered runtime: assess blocked')

    finish(rcDir)
  } finally {
    if (cleanupWork) {
      try {
        rmSync(work, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
  }
}

function finish(rcDir) {
  const report = {
    kind: 'operator_rc_verify_clean',
    ok: errors.length === 0,
    at: new Date().toISOString(),
    rcDir,
    steps,
    errors,
  }

  // Write evidence under gitignored .operator-rc/ (CI clean-worktree safe)
  try {
    const evidenceDir = join(ROOT, '.operator-rc', 'evidence')
    mkdirSync(evidenceDir, { recursive: true })
    writeFileSync(
      join(evidenceDir, 'clean-verify-report.json'),
      JSON.stringify(report, null, 2) + '\n',
    )
  } catch {
    /* optional */
  }

  for (const s of steps) {
    console.log(`  [${s.ok ? 'ok' : 'FAIL'}] ${s.msg}`)
  }
  for (const e of errors) console.error(`FAIL: ${e}`)

  if (errors.length) {
    console.error(`\noperator:rc:verify-clean failed (${errors.length})`)
    process.exitCode = 1
    return
  }
  console.log('\noperator:rc:verify-clean ok')
  console.log('Local golden path: doctor → assess → MCP → tamper-fail')
}

main()
