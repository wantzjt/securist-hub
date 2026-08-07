/**
 * WO-012 operator fixtures — package digest covers dist/cli.js, trust, permissions.
 */
import {
  writeFileSync,
  symlinkSync,
  rmSync,
  mkdtempSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  appendFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import {
  generateKeyPairSync,
  createPrivateKey,
  sign,
} from 'node:crypto'
import { assessLocalRepository } from '../src/assess'
import { runDoctor } from '../src/doctor'
import { openSandbox, resolveUnderSandbox } from '../src/path-sandbox'
import {
  ensureOperatorState,
  modeOf,
  operatorStateRoot,
  assertStateOutsideTarget,
} from '../src/local-state'
import {
  computeOperatorContentDigest,
  verifyOperatorRuntime,
  PACKAGE_ARTIFACT_RELS,
} from '../src/runtime-identity'
import {
  LOCAL_MCP_TOOLS_V1,
  LOCAL_MCP_FORBIDDEN_V1,
} from '../../contracts/src/local-assess'

let passed = 0
let failed = 0

function ok(name: string) {
  passed++
  console.log(`  ✓ ${name}`)
}
function fail(name: string, detail: string) {
  failed++
  console.error(`  ✗ ${name}: ${detail}`)
}
function assert(name: string, cond: boolean, detail = 'failed') {
  if (cond) ok(name)
  else fail(name, detail)
}

function ensureBuilt() {
  const dist = join(process.cwd(), 'packages/operator/dist/cli.js')
  if (!existsSync(dist)) {
    const b = spawnSync(process.execPath, ['scripts/build-operator.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    if (b.status !== 0) throw new Error(b.stderr || b.stdout || 'build failed')
  }
}

/** Ephemeral trust over packaged artifacts (incl. dist/cli.js). */
function installEphemeralTrust(): {
  cleanup: () => void
  identityPath: string
  resign: () => void
} {
  ensureBuilt()
  const dir = mkdtempSync(join(tmpdir(), 'securist-trust-'))
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  const publicKeyPath = join(dir, 'trust-root.pem')
  const identityPath = join(dir, 'runtime-identity.json')
  writeFileSync(publicKeyPath, pubPem, { mode: 0o600 })
  writeFileSync(join(dir, 'private.pem'), privPem, { mode: 0o600 })

  function resign() {
    const hex = computeOperatorContentDigest()
    const sig = sign(
      null,
      Buffer.from(hex, 'utf8'),
      createPrivateKey(privPem),
    ).toString('base64')
    writeFileSync(
      identityPath,
      JSON.stringify(
        {
          componentId: 'securist-operator',
          version: '0.1.0-test',
          contentDigest: { algorithm: 'sha256', hex },
          signerKeyId: 'ephemeral-test-key',
          signature: sig,
          artifacts: [...PACKAGE_ARTIFACT_RELS],
          note: 'fixture only',
        },
        null,
        2,
      ),
      { mode: 0o600 },
    )
  }

  resign()
  process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH = publicKeyPath
  process.env.SECURIST_OPERATOR_IDENTITY_PATH = identityPath

  return {
    identityPath,
    resign,
    cleanup: () => {
      delete process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH
      delete process.env.SECURIST_OPERATOR_IDENTITY_PATH
      rmSync(dir, { recursive: true, force: true })
    },
  }
}

function main() {
  console.log('Operator fixtures (WO-012 P1 — package digest includes dist)\n')

  ensureBuilt()
  assert(
    'package digest includes dist/cli.js path',
    (PACKAGE_ARTIFACT_RELS as readonly string[]).includes('dist/cli.js'),
  )

  const home = mkdtempSync(join(tmpdir(), 'securist-home-'))
  process.env.SECURIST_HOME = home

  console.log('[default trust: no signed identity]')
  delete process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH
  delete process.env.SECURIST_OPERATOR_IDENTITY_PATH
  const bare = verifyOperatorRuntime()
  assert('default without identity is not ok', bare.ok === false)
  const bareDoctor = runDoctor()
  assert(
    'doctor capability runtime_unavailable when unsigned',
    bareDoctor.capability === 'runtime_unavailable' ||
      bareDoctor.capability === 'signature_invalid',
  )
  assert(
    'doctor does not say Runtime verified when failed',
    !bareDoctor.lines.some((l) => /^Runtime verified/i.test(l)),
  )
  assert(
    'doctor blocks assess messaging',
    bareDoctor.lines.some((l) => /blocked/i.test(l)),
  )
  const blocked = assessLocalRepository({
    targetPath: process.cwd(),
    intendedUse: 'should block',
    environment: 'development',
    deploymentBoundary: 'local_only',
    dryRun: true,
  })
  assert(
    'assess blocked without trusted runtime',
    blocked.ok === false,
  )

  console.log('\n[sign → mutate dist/cli.js → mismatch]')
  const trust = installEphemeralTrust()
  assert('signed package verifies', verifyOperatorRuntime().ok === true)

  const distCli = join(process.cwd(), 'packages/operator/dist/cli.js')
  const originalDist = readFileSync(distCli)
  appendFileSync(distCli, '\n// tamper\n')
  const afterTamper = verifyOperatorRuntime()
  assert(
    'mutated dist/cli.js fails digest mismatch',
    afterTamper.ok === false && afterTamper.code === 'runtime_digest_mismatch',
    afterTamper.ok ? 'unexpected ok' : afterTamper.code,
  )
  const docTamper = runDoctor()
  assert(
    'doctor fails after dist tamper',
    docTamper.runtimeOk === false,
  )
  const assessTamper = assessLocalRepository({
    targetPath: process.cwd(),
    intendedUse: 'tamper test',
    environment: 'development',
    deploymentBoundary: 'local_only',
    dryRun: true,
  })
  assert(
    'assess blocked after dist tamper',
    assessTamper.ok === false &&
      (assessTamper.code === 'runtime_digest_mismatch' ||
        assessTamper.code === 'runtime_unavailable' ||
        assessTamper.code === 'signature_invalid'),
  )
  // restore dist and re-sign
  writeFileSync(distCli, originalDist)
  trust.resign()
  assert('restored dist verifies again', verifyOperatorRuntime().ok === true)

  console.log('\n[doctor with trusted packaged runtime]')
  const doctor = runDoctor()
  assert('doctor runtime ok', doctor.runtimeOk === true)
  assert(
    'doctor synthesis_unavailable',
    doctor.capability === 'synthesis_unavailable',
  )
  assert(
    'deterministic assess ready only when runtime ok',
    doctor.lines.some((l) => /deterministic assess ready/i.test(l)),
  )

  console.log('\n[local state permissions]')
  const state = ensureOperatorState()
  assert('state dir mode 0700', modeOf(state) === 0o700)
  assert('briefs dir mode 0700', modeOf(join(state, 'briefs')) === 0o700)

  console.log('\n[path sandbox]')
  const repo = mkdtempSync(join(tmpdir(), 'securist-repo-'))
  writeFileSync(
    join(repo, 'package.json'),
    JSON.stringify({ name: 'fixture-app', version: '1.2.3', license: 'MIT' }),
  )
  const outside = mkdtempSync(join(tmpdir(), 'securist-out-'))
  writeFileSync(join(outside, 'secret.txt'), 'top-secret')
  try {
    symlinkSync(outside, join(repo, 'escape-link'))
  } catch {
    /* optional */
  }
  const box = openSandbox(repo)
  assert('package.json readable', resolveUnderSandbox(box, 'package.json') !== null)
  assert('absolute rejected', resolveUnderSandbox(box, '/etc/passwd') === null)
  assert('dotdot rejected', resolveUnderSandbox(box, '../secret.txt') === null)
  if (existsSync(join(repo, 'escape-link'))) {
    assert(
      'symlink escape rejected',
      resolveUnderSandbox(box, 'escape-link/secret.txt') === null,
    )
  }

  console.log('\n[symlinked SECURIST_HOME into target rejected]')
  const nestedHome = join(repo, '.sneaky-home')
  mkdirSync(nestedHome, { recursive: true })
  process.env.SECURIST_HOME = nestedHome
  const jail = assertStateOutsideTarget(realpathSync(repo))
  assert('state inside target rejected', jail.ok === false)
  const linkHome = mkdtempSync(join(tmpdir(), 'securist-linkhome-'))
  const linkPath = join(linkHome, 'link')
  try {
    symlinkSync(nestedHome, linkPath)
    process.env.SECURIST_HOME = linkPath
    const viaLink = assertStateOutsideTarget(realpathSync(repo))
    assert('symlinked home into target rejected', viaLink.ok === false)
  } catch (e) {
    assert('symlinked home test', false, String(e))
  }
  process.env.SECURIST_HOME = home

  console.log('\n[assess with trusted runtime]')
  const result = assessLocalRepository({
    targetPath: repo,
    intendedUse: 'Local engineering review of fixture app',
    environment: 'development',
    deploymentBoundary: 'local_only',
    dryRun: false,
  })
  assert('assess ok', result.ok === true, result.ok ? '' : result.error)
  if (result.ok) {
    const b = result.brief as {
      kind: string
      synthesis: string
      capability: string
      provenance: { baseModel: unknown; adapter: unknown }
      repository: { packageName: string | null; rootLabel: string }
    }
    assert('kind local', b.kind === 'local_decision_brief')
    assert('deterministic_only', b.synthesis === 'deterministic_only')
    assert('baseModel null', b.provenance.baseModel === null)
    assert('package name', b.repository.packageName === 'fixture-app')
    const latest = join(operatorStateRoot(), 'runs', 'latest.json')
    if (existsSync(latest)) {
      assert('latest run file mode 0600', modeOf(latest) === 0o600)
    }
  }

  console.log('\n[MCP + dist CLI]')
  const tools = LOCAL_MCP_TOOLS_V1 as readonly string[]
  assert('three tools', tools.length === 3)
  assert('forbidden execute', LOCAL_MCP_FORBIDDEN_V1.includes('execute'))

  const build = spawnSync(process.execPath, ['scripts/build-operator.mjs'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
  assert('operator:build exits 0', build.status === 0, build.stderr || '')
  // rebuild invalidates signature — re-sign
  trust.resign()
  const distSrc = readFileSync(
    join(process.cwd(), 'packages/operator/dist/cli.js'),
    'utf8',
  )
  assert('dist has no npx', !/\bnpx\b/.test(distSrc))
  assert('dist has no tsx', !/\btsx\b/.test(distSrc))
  const distDoctor = spawnSync(
    process.execPath,
    [join(process.cwd(), 'packages/operator/dist/cli.js'), 'doctor'],
    { env: { ...process.env }, encoding: 'utf8' },
  )
  assert('dist doctor ok', distDoctor.status === 0, distDoctor.stderr)
  const binHelp = spawnSync(
    process.execPath,
    [join(process.cwd(), 'packages/operator/bin/securist.mjs'), 'help'],
    { encoding: 'utf8', env: process.env },
  )
  assert('bin help works', binHelp.status === 0)

  trust.cleanup()
  try {
    rmSync(repo, { recursive: true, force: true })
    rmSync(outside, { recursive: true, force: true })
    rmSync(home, { recursive: true, force: true })
  } catch {
    /* ignore */
  }

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
