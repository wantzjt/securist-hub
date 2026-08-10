/**
 * WO-018 — release-candidate pipeline fixtures.
 * Dogfood pack + clean-machine verify with ephemeral keys only.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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
  console.log('Operator RC fixtures (WO-018)\n')
  const root = process.cwd()

  console.log('[preflight — no signing key]')
  const pre = spawnSync(
    process.execPath,
    ['scripts/operator-rc-preflight.mjs'],
    { cwd: root, encoding: 'utf8' },
  )
  assert(
    'preflight exits 0',
    pre.status === 0,
    pre.stderr || pre.stdout || `status ${pre.status}`,
  )
  const preflightReport = join(
    root,
    '.operator-rc/evidence/preflight-report.json',
  )
  assert('preflight report written', existsSync(preflightReport))
  if (existsSync(preflightReport)) {
    const rep = JSON.parse(readFileSync(preflightReport, 'utf8'))
    assert('preflight report ok true', rep.ok === true)
    assert(
      'preflight nonClaims mention no npm publish',
      Array.isArray(rep.nonClaims) &&
        rep.nonClaims.some((c: string) => /npm/i.test(c)),
    )
  }

  console.log('\n[dogfood RC + clean verify]')
  const dog = spawnSync(process.execPath, ['scripts/operator-rc-dogfood.mjs'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert(
    'dogfood RC exits 0',
    dog.status === 0,
    dog.stderr || dog.stdout || `status ${dog.status}`,
  )
  assert(
    'latest-rc.json exists',
    existsSync(join(root, '.operator-rc/latest-rc.json')),
  )
  if (existsSync(join(root, '.operator-rc/latest-rc.json'))) {
    const latest = JSON.parse(
      readFileSync(join(root, '.operator-rc/latest-rc.json'), 'utf8'),
    )
    assert('latest RC dogfood flag', latest.dogfood === true)
    assert('latest RC denies public npx claim', latest.publicNpxClaim === false)
    assert(
      'clean verify report written',
      existsSync(join(root, '.operator-rc/evidence/clean-verify-report.json')),
    )
  }

  console.log('\n[human release command requires key]')
  const noKey = spawnSync(process.execPath, ['scripts/operator-rc-release.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, SECURIST_OPERATOR_SIGNING_KEY: '' },
  })
  assert(
    'operator:rc without key fails closed',
    noKey.status !== 0,
    'expected non-zero',
  )
  assert(
    'operator:rc without key is actionable',
    /SECURIST_OPERATOR_SIGNING_KEY/i.test(noKey.stderr + noKey.stdout),
  )

  console.log('\n[honesty — no public npx in release scripts]')
  for (const rel of [
    'scripts/operator-rc-preflight.mjs',
    'scripts/operator-rc-release.mjs',
    'scripts/operator-rc-dogfood.mjs',
    'docs/OPERATOR-RELEASE-LANE.md',
  ]) {
    const t = readFileSync(join(root, rel), 'utf8')
    assert(
      `${rel} does not instruct public npx install as available`,
      !/npx\s+@securist\/operator(?![^\n]*(forthcoming|until|not|Do not|never))/i.test(
        t,
      ) || /not.*npx|Do not.*npx|forthcoming|until/i.test(t),
    )
  }

  console.log('\n[dogfood MANIFEST + tarball re-verify]')
  const latestPath = join(root, '.operator-rc/latest-rc.json')
  if (existsSync(latestPath)) {
    const latest = JSON.parse(readFileSync(latestPath, 'utf8'))
    const stage = join(root, latest.stageDir)
    if (existsSync(join(stage, 'MANIFEST.json'))) {
      const man = JSON.parse(readFileSync(join(stage, 'MANIFEST.json'), 'utf8'))
      assert(
        'dogfood MANIFEST publicNpxClaim false',
        man.publicNpxClaim === false,
      )
      assert(
        'dogfood MANIFEST has contentDigest hex',
        typeof man.contentDigest?.hex === 'string' &&
          man.contentDigest.hex.length === 64,
      )
      assert(
        'dogfood MANIFEST signerKeyId ephemeral',
        /dogfood|ephemeral/i.test(String(man.signerKeyId || '')),
      )
    }
    const tgzRel = latest.tarball
    if (tgzRel && existsSync(join(root, tgzRel))) {
      const tgzVerify = spawnSync(
        process.execPath,
        ['scripts/operator-rc-verify-clean.mjs', '--rc-tgz', join(root, tgzRel)],
        { cwd: root, encoding: 'utf8' },
      )
      assert(
        'verify-clean via dogfood tarball exits 0',
        tgzVerify.status === 0,
        tgzVerify.stderr || tgzVerify.stdout || `status ${tgzVerify.status}`,
      )
    } else {
      fail('dogfood tarball path', 'missing after dogfood RC')
    }
  }

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
