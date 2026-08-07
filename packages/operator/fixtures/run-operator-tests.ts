/**
 * WO-012 operator fixtures — trust honesty, permissions, sandbox, dist CLI.
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
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import {
  generateKeyPairSync,
  createPrivateKey,
  sign,
  createHash,
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

/** Ephemeral trust: private key never committed; only for fixtures. */
function installEphemeralTrust(): {
  cleanup: () => void
  publicKeyPath: string
  identityPath: string
} {
  const dir = mkdtempSync(join(tmpdir(), 'securist-trust-'))
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  const publicKeyPath = join(dir, 'trust-root.pem')
  const identityPath = join(dir, 'runtime-identity.json')
  writeFileSync(publicKeyPath, pubPem, { mode: 0o600 })
  writeFileSync(join(dir, 'private.pem'), privPem, { mode: 0o600 })

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
        note: 'fixture only',
      },
      null,
      2,
    ),
    { mode: 0o600 },
  )

  process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH = publicKeyPath
  process.env.SECURIST_OPERATOR_IDENTITY_PATH = identityPath

  return {
    publicKeyPath,
    identityPath,
    cleanup: () => {
      delete process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH
      delete process.env.SECURIST_OPERATOR_IDENTITY_PATH
      rmSync(dir, { recursive: true, force: true })
    },
  }
}

function main() {
  console.log('Operator fixtures (WO-012 P1)\n')

  const home = mkdtempSync(join(tmpdir(), 'securist-home-'))
  process.env.SECURIST_HOME = home

  console.log('[default trust: no private key / no signed identity]')
  delete process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH
  delete process.env.SECURIST_OPERATOR_IDENTITY_PATH
  // Packaged trust-root.pem may exist without identity
  const bare = verifyOperatorRuntime()
  assert(
    'default without identity is not ok',
    bare.ok === false,
    bare.ok ? 'unexpected ok' : bare.error,
  )
  const bareDoctor = runDoctor()
  assert(
    'doctor capability runtime_unavailable or signature_invalid',
    bareDoctor.capability === 'runtime_unavailable' ||
      bareDoctor.capability === 'signature_invalid',
  )
  assert(
    'doctor does not claim deterministic assess ready when runtime fails',
    !bareDoctor.lines.some((l) =>
      /deterministic assess ready/i.test(l) && !/blocked/i.test(l),
    ) || bareDoctor.lines.some((l) => /blocked/i.test(l)),
  )
  assert(
    'doctor does not say Runtime verified when failed',
    !bareDoctor.lines.some((l) => /^Runtime verified/i.test(l)),
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
    blocked.ok === false &&
      (blocked.code === 'runtime_unavailable' ||
        blocked.code === 'signature_invalid' ||
        blocked.code === 'runtime_digest_mismatch'),
  )

  console.log('\n[tampered runtime fails]')
  const trust = installEphemeralTrust()
  const good = verifyOperatorRuntime()
  assert('ephemeral trust verifies', good.ok === true)
  // Tamper identity digest
  const id = JSON.parse(readFileSync(trust.identityPath, 'utf8')) as {
    contentDigest: { hex: string }
    signature: string
  }
  id.contentDigest.hex = createHash('sha256').update('tampered').digest('hex')
  writeFileSync(trust.identityPath, JSON.stringify(id))
  const tampered = verifyOperatorRuntime()
  assert(
    'tampered identity fails',
    tampered.ok === false &&
      (tampered.code === 'runtime_digest_mismatch' ||
        tampered.code === 'signature_invalid'),
  )
  // Restore good identity
  trust.cleanup()
  const trust2 = installEphemeralTrust()

  console.log('\n[doctor with trusted runtime]')
  const doctor = runDoctor()
  assert('doctor runtime ok', doctor.runtimeOk === true)
  assert(
    'doctor synthesis_unavailable when runtime ok',
    doctor.capability === 'synthesis_unavailable',
  )
  assert(
    'doctor prints deterministic assess ready only when runtime ok',
    doctor.lines.some((l) => /deterministic assess ready/i.test(l)),
  )
  assert(
    'doctor prints Runtime verified only when ok',
    doctor.lines.some((l) => /Runtime verified/i.test(l)),
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
  const prevHome = process.env.SECURIST_HOME
  process.env.SECURIST_HOME = nestedHome
  const jail = assertStateOutsideTarget(realpathSync(repo))
  assert(
    'state inside target rejected',
    jail.ok === false && jail.code === 'state_path',
  )
  process.env.SECURIST_HOME = prevHome

  // Symlink SECURIST_HOME -> inside repo
  const linkHome = mkdtempSync(join(tmpdir(), 'securist-linkhome-'))
  const linkPath = join(linkHome, 'link')
  try {
    rmSync(linkPath, { force: true })
    symlinkSync(nestedHome, linkPath)
    process.env.SECURIST_HOME = linkPath
    const viaLink = assertStateOutsideTarget(realpathSync(repo))
    assert(
      'symlinked home into target rejected',
      viaLink.ok === false && viaLink.code === 'state_path',
    )
  } catch (e) {
    assert('symlinked home test ran', false, String(e))
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
      draftJson: string
    }
    assert('kind local', b.kind === 'local_decision_brief')
    assert('deterministic_only', b.synthesis === 'deterministic_only')
    assert('capability synthesis_unavailable', b.capability === 'synthesis_unavailable')
    assert('baseModel null', b.provenance.baseModel === null)
    assert('adapter null', b.provenance.adapter === null)
    assert('package name', b.repository.packageName === 'fixture-app')
    assert('rootLabel', String(b.repository.rootLabel) === '.')
    const briefFile = join(operatorStateRoot(), 'briefs')
    // latest run file 0600
    const latest = join(operatorStateRoot(), 'runs', 'latest.json')
    if (existsSync(latest)) {
      assert('latest run file mode 0600', modeOf(latest) === 0o600)
    }
    void briefFile
  }

  console.log('\n[MCP allowlist]')
  const tools = LOCAL_MCP_TOOLS_V1 as readonly string[]
  assert('three tools', tools.length === 3 && tools.includes('get_brief'))
  assert(
    'forbidden',
    LOCAL_MCP_FORBIDDEN_V1.includes('execute') &&
      LOCAL_MCP_FORBIDDEN_V1.includes('read_path'),
  )

  console.log('\n[clean package / dist CLI — no npx tsx]')
  const build = spawnSync(process.execPath, ['scripts/build-operator.mjs'], {
    cwd: join(process.cwd()),
    encoding: 'utf8',
  })
  assert('operator:build exits 0', build.status === 0, build.stderr || build.stdout)
  const distCli = join(process.cwd(), 'packages/operator/dist/cli.js')
  assert('dist/cli.js exists', existsSync(distCli))
  const distSrc = readFileSync(distCli, 'utf8')
  assert('dist has no npx', !/\bnpx\b/.test(distSrc))
  assert('dist has no tsx', !/\btsx\b/.test(distSrc))
  // Run doctor via node dist with ephemeral trust (still set)
  const distDoctor = spawnSync(process.execPath, [distCli, 'doctor'], {
    env: { ...process.env },
    encoding: 'utf8',
  })
  assert(
    'dist doctor exits 0 with trust',
    distDoctor.status === 0,
    distDoctor.stderr + distDoctor.stdout,
  )
  assert(
    'dist doctor runtime verified line',
    /Runtime verified/i.test(distDoctor.stdout),
  )

  // bin without dist would fail — already have dist
  const bin = join(process.cwd(), 'packages/operator/bin/securist.mjs')
  const binHelp = spawnSync(process.execPath, [bin, 'help'], {
    encoding: 'utf8',
    env: process.env,
  })
  assert('bin help works', binHelp.status === 0, binHelp.stderr)

  trust2.cleanup()
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
