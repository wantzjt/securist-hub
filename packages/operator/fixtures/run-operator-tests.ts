/**
 * WO-012 operator fixtures — deterministic local assess, sandbox, MCP honesty.
 */
import {
  writeFileSync,
  symlinkSync,
  rmSync,
  mkdtempSync,
  existsSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { writeRuntimeIdentity, verifyOperatorRuntime } from '../src/runtime-identity'
import { assessLocalRepository } from '../src/assess'
import { runDoctor } from '../src/doctor'
import { openSandbox, resolveUnderSandbox } from '../src/path-sandbox'
import { operatorStateRoot } from '../src/local-state'
import { LOCAL_MCP_TOOLS_V1, LOCAL_MCP_FORBIDDEN_V1 } from '../../contracts/src/local-assess'

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

function main() {
  console.log('Operator fixtures (WO-012)\n')

  // Ensure identity matches sources
  writeRuntimeIdentity()
  process.env.SECURIST_HOME = mkdtempSync(join(tmpdir(), 'securist-home-'))

  console.log('[runtime identity]')
  const rt = verifyOperatorRuntime()
  assert('runtime verifies', rt.ok === true, rt.ok ? '' : rt.error)
  if (rt.ok) {
    const digest = rt.provenance.contentDigest
    assert(
      'runtime has content digest',
      digest !== null && digest.hex.length === 64,
    )
    assert(
      'runtime component is securist-operator not model pack',
      rt.provenance.componentId === 'securist-operator',
    )
  }

  console.log('\n[doctor]')
  const doctor = runDoctor()
  assert('doctor runtime ok', doctor.runtimeOk === true)
  assert(
    'doctor synthesis unavailable',
    doctor.capability === 'synthesis_unavailable' &&
      doctor.synthesisAvailable === false,
  )
  assert(
    'doctor lines mention deterministic',
    doctor.lines.some((l) => /synthesis unavailable|deterministic/i.test(l)),
  )

  console.log('\n[path sandbox]')
  const repo = mkdtempSync(join(tmpdir(), 'securist-repo-'))
  writeFileSync(
    join(repo, 'package.json'),
    JSON.stringify({ name: 'fixture-app', version: '1.2.3', license: 'MIT' }),
  )
  writeFileSync(join(repo, 'LICENSE'), 'MIT')
  const outside = mkdtempSync(join(tmpdir(), 'securist-out-'))
  writeFileSync(join(outside, 'secret.txt'), 'top-secret')
  try {
    symlinkSync(outside, join(repo, 'escape-link'))
  } catch {
    // platform may disallow
  }
  const box = openSandbox(repo)
  assert(
    'package.json readable',
    resolveUnderSandbox(box, 'package.json') !== null,
  )
  assert(
    'absolute path rejected',
    resolveUnderSandbox(box, '/etc/passwd') === null,
  )
  assert(
    'dotdot rejected',
    resolveUnderSandbox(box, '../secret.txt') === null,
  )
  if (existsSync(join(repo, 'escape-link'))) {
    assert(
      'symlink escape rejected',
      resolveUnderSandbox(box, 'escape-link/secret.txt') === null,
    )
  }

  console.log('\n[assess deterministic brief]')
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
      persistence: string
      shareability: string
      visibility: string
      synthesis: string
      capability: string
      provenance: { baseModel: unknown; adapter: unknown }
      observed: unknown[]
      evidenceGaps: unknown[]
      draftJson: string
      repository: { rootLabel: string; packageName: string | null }
    }
    assert('kind local_decision_brief', b.kind === 'local_decision_brief')
    assert('persistence local_only', b.persistence === 'local_only')
    assert('shareability never_automatic', b.shareability === 'never_automatic')
    assert('visibility local_only', b.visibility === 'local_only')
    assert('synthesis deterministic_only', b.synthesis === 'deterministic_only')
    assert(
      'capability synthesis_unavailable',
      b.capability === 'synthesis_unavailable',
    )
    assert('baseModel null', b.provenance.baseModel === null)
    assert('adapter null', b.provenance.adapter === null)
    assert(
      'no gpt-oss in provenance json',
      !JSON.stringify(b.provenance).includes('gpt-oss'),
    )
    assert('observed facts', b.observed.length > 0)
    assert('evidence gaps', b.evidenceGaps.length > 0)
    assert(
      'no absolute path in draft',
      !b.draftJson.includes(repo) && !/\/Users\//.test(b.draftJson),
    )
    assert('rootLabel is .', String(b.repository.rootLabel) === '.')
    assert(
      'package name observed',
      b.repository.packageName === 'fixture-app',
    )
    assert(
      'state outside target',
      !operatorStateRoot().startsWith(repo),
    )
  }

  const secret = assessLocalRepository({
    targetPath: repo,
    intendedUse: 'password=supersecret deploy',
    environment: 'development',
    deploymentBoundary: 'local_only',
    dryRun: true,
  })
  assert(
    'secret intendedUse rejected',
    secret.ok === false && secret.code === 'redaction',
  )

  console.log('\n[MCP allowlist constants]')
  const tools = LOCAL_MCP_TOOLS_V1 as readonly string[]
  assert('three tools', tools.length === 3 && tools.includes('get_brief'))
  assert(
    'forbidden has execute/path',
    LOCAL_MCP_FORBIDDEN_V1.includes('execute') &&
      LOCAL_MCP_FORBIDDEN_V1.includes('read_path'),
  )

  // cleanup
  try {
    rmSync(repo, { recursive: true, force: true })
    rmSync(outside, { recursive: true, force: true })
    const home = process.env.SECURIST_HOME
    if (home) rmSync(home, { recursive: true, force: true })
  } catch {
    /* ignore */
  }

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
