/**
 * WO-021 — Automated dogfood / golden-path battery.
 *
 * Pounds the Assess → Local Operator (signed RC) loop without a human tester.
 * CI-safe by default (ephemeral dogfood keys). When SECURIST_OPERATOR_SIGNING_KEY
 * points at a real private key, also exercises the production-signed RC path.
 *
 * Does not: publish, provision Postgres, call production secrets, or claim public npx.
 */
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  verify,
} from 'node:crypto'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  readdirSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import {
  PRODUCT_NAV,
  LADDER,
  HERO,
  OPERATOR_COMMANDS,
} from '../../../src/lib/product-surface'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const OPERATOR = join(ROOT, 'packages/operator')
/** Burned fixture public key (WO-012) — must never be the monorepo trust root again */
const BURNED_FIXTURE_TRUST_SHA256 =
  '34a00b04986e7b9230953794ddd6a754954aae96d2661247bb2ae37b89a4db70'
/** Production trust root landed by WO-020 */
const PRODUCTION_TRUST_SHA256 =
  '300693cdbefc626db6171fd114f2c82039315bcb532b8ddc61bb74c6e2c1a84b'

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

function sha256File(abs: string) {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

function run(
  cmd: string,
  args: string[],
  opts: { env?: NodeJS.ProcessEnv; cwd?: string } = {},
) {
  return spawnSync(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...opts.env },
  })
}

function main() {
  console.log('Golden-path battery (WO-021) — automated dogfood\n')

  // ── 1. Product surface ladder (Assess → Operator → Team) ──────────────
  console.log('[product ladder — static]')
  assert(
    'hero is permission framing',
    HERO.title.toLowerCase().includes('permission'),
  )
  assert(
    'nav order Assess · Operator · Team',
    PRODUCT_NAV.map((n) => n.to).join(',') === '/assess,/operator,/team',
  )
  assert(
    'ladder statuses live,local,next',
    LADDER.map((s) => s.status).join(',') === 'live,local,next',
  )
  assert(
    'public ladder step href is /assess',
    LADDER.map((s) => s.href).includes('/assess'),
  )
  assert(
    'operator commands deny public npx',
    /not available|private|forthcoming|monorepo/i.test(OPERATOR_COMMANDS.note),
  )

  const operatorRoute = readFileSync(join(ROOT, 'src/routes/operator.tsx'), 'utf8')
  const assessRoute = readFileSync(join(ROOT, 'src/routes/assess.tsx'), 'utf8')
  assert(
    '/operator does not claim public npx install ready',
    !/npx\s+@securist\/operator/i.test(operatorRoute) ||
      /forthcoming|not available|private|until/i.test(operatorRoute),
  )
  assert(
    '/assess route exists as public intake',
    /assess|repository|Decision Brief/i.test(assessRoute),
  )
  assert(
    '/operator points to monorepo or signed RC honesty',
    /monorepo|Local Operator|doctor|assess/i.test(operatorRoute),
  )

  // ── 2. Trust root integrity (WO-020 production root) ───────────────────
  console.log('\n[trust-root integrity]')
  const trustPath = join(OPERATOR, 'keys/trust-root.pem')
  assert('trust-root.pem exists', existsSync(trustPath))
  const trustPem = readFileSync(trustPath, 'utf8')
  assert('trust-root is PUBLIC key PEM', /BEGIN PUBLIC KEY/.test(trustPem))
  assert(
    'trust-root is not private key material',
    !/BEGIN PRIVATE KEY|BEGIN RSA PRIVATE|BEGIN EC PRIVATE/i.test(trustPem),
  )
  const trustSha = sha256File(trustPath)
  assert(
    'trust-root is not burned fixture public key',
    trustSha !== BURNED_FIXTURE_TRUST_SHA256,
    `got ${trustSha}`,
  )
  assert(
    'trust-root matches WO-020 production public key',
    trustSha === PRODUCTION_TRUST_SHA256,
    `got ${trustSha}`,
  )
  try {
    const pub = createPublicKey(trustPem)
    assert('trust-root loads as Ed25519', pub.asymmetricKeyType === 'ed25519')
  } catch (e) {
    fail('trust-root loads as public key', String(e))
  }
  assert(
    'no fixture-private.pem in tree',
    !existsSync(join(OPERATOR, 'keys/fixture-private.pem')),
  )
  // Ensure monorepo is unsigned before fail-closed check
  rmSync(join(OPERATOR, 'runtime-identity.json'), { force: true })
  run(process.execPath, ['scripts/build-operator.mjs'])
  const doctorMono2 = run(process.execPath, [
    join(OPERATOR, 'bin/securist.mjs'),
    'doctor',
  ])
  assert(
    'monorepo doctor fails closed without signed identity',
    doctorMono2.status !== 0,
    doctorMono2.stdout + doctorMono2.stderr,
  )
  assert(
    'monorepo doctor does not claim Runtime verified when unsigned',
    !/Runtime verified/i.test(doctorMono2.stdout),
  )

  // ── 3. Dogfood RC pack (ephemeral) + dir verify ───────────────────────
  console.log('\n[dogfood RC — ephemeral key]')
  const dog = run(process.execPath, ['scripts/operator-rc-dogfood.mjs'])
  assert(
    'dogfood RC exits 0',
    dog.status === 0,
    (dog.stderr || dog.stdout || '').slice(0, 800),
  )
  const latestPath = join(ROOT, '.operator-rc/latest-rc.json')
  assert('latest-rc.json written', existsSync(latestPath))
  const latest = JSON.parse(readFileSync(latestPath, 'utf8'))
  assert('dogfood latest.dogfood true', latest.dogfood === true)
  assert('dogfood publicNpxClaim false', latest.publicNpxClaim === false)
  assert(
    'dogfood stage dir exists',
    typeof latest.stageDir === 'string' &&
      existsSync(join(ROOT, latest.stageDir)),
  )

  const stage = join(ROOT, latest.stageDir)
  const manifest = JSON.parse(
    readFileSync(join(stage, 'MANIFEST.json'), 'utf8'),
  )
  assert(
    'MANIFEST kind is dogfood or release candidate',
    /release_candidate/i.test(manifest.kind),
  )
  assert(
    'dogfood MANIFEST publicNpxClaim false',
    manifest.publicNpxClaim === false,
  )
  assert(
    'dogfood signerKeyId is ephemeral',
    /dogfood|ephemeral/i.test(manifest.signerKeyId || ''),
  )
  assert(
    'dogfood contentDigest is sha256 hex',
    manifest.contentDigest?.algorithm === 'sha256' &&
      /^[a-f0-9]{64}$/.test(manifest.contentDigest?.hex || ''),
  )

  const identity = JSON.parse(
    readFileSync(join(stage, 'runtime-identity.json'), 'utf8'),
  )
  const stagedTrust = readFileSync(join(stage, 'keys/trust-root.pem'), 'utf8')
  const digOk = verify(
    null,
    Buffer.from(identity.contentDigest.hex, 'utf8'),
    createPublicKey(stagedTrust),
    Buffer.from(identity.signature, 'base64'),
  )
  assert('dogfood identity signature verifies against staged trust-root', digOk)
  assert(
    'dogfood staged trust-root is NOT monorepo production key',
    sha256File(join(stage, 'keys/trust-root.pem')) !== PRODUCTION_TRUST_SHA256,
  )

  const verifyDir = run(process.execPath, [
    'scripts/operator-rc-verify-clean.mjs',
    '--rc-dir',
    stage,
  ])
  assert(
    'verify-clean on dogfood dir exits 0',
    verifyDir.status === 0,
    (verifyDir.stderr || verifyDir.stdout || '').slice(0, 600),
  )

  // ── 4. Tarball extract path (clean-machine shape) ─────────────────────
  console.log('\n[dogfood RC — tarball extract]')
  const tgz =
    latest.tarball && existsSync(join(ROOT, latest.tarball))
      ? join(ROOT, latest.tarball)
      : join(ROOT, '.operator-rc', readdirSync(join(ROOT, '.operator-rc')).find(
          (n) => n.endsWith('-rc-dogfood.tgz'),
        ) || '')
  assert('dogfood tarball exists', Boolean(tgz) && existsSync(tgz))
  if (tgz && existsSync(tgz)) {
    const verifyTgz = run(process.execPath, [
      'scripts/operator-rc-verify-clean.mjs',
      '--rc-tgz',
      tgz,
    ])
    assert(
      'verify-clean on dogfood tarball exits 0',
      verifyTgz.status === 0,
      (verifyTgz.stderr || verifyTgz.stdout || '').slice(0, 600),
    )
  }

  // ── 5. Adversarial: broken identity / wrong key ───────────────────────
  console.log('\n[adversarial — fail closed]')
  const work = mkdtempSync(join(tmpdir(), 'securist-gp-adv-'))
  try {
    // copy stage to temp and break signature
    const broken = join(work, 'broken-rc')
    run('cp', ['-R', stage, broken])
    const idPath = join(broken, 'runtime-identity.json')
    const id = JSON.parse(readFileSync(idPath, 'utf8'))
    id.signature = Buffer.from('not-a-valid-signature-bytes!!!!').toString(
      'base64',
    )
    writeFileSync(idPath, JSON.stringify(id, null, 2))
    const brokenDoctor = run(
      process.execPath,
      [join(broken, 'bin/securist.mjs'), 'doctor'],
      { env: { SECURIST_HOME: join(work, 'home-broken') }, cwd: broken },
    )
    assert(
      'forged signature: doctor fails',
      brokenDoctor.status !== 0,
      brokenDoctor.stdout + brokenDoctor.stderr,
    )

    // delete identity
    const noId = join(work, 'noid-rc')
    run('cp', ['-R', stage, noId])
    rmSync(join(noId, 'runtime-identity.json'), { force: true })
    const noIdDoctor = run(
      process.execPath,
      [join(noId, 'bin/securist.mjs'), 'doctor'],
      { env: { SECURIST_HOME: join(work, 'home-noid') }, cwd: noId },
    )
    assert(
      'missing identity: doctor fails',
      noIdDoctor.status !== 0,
      noIdDoctor.stdout + noIdDoctor.stderr,
    )

    // operator:rc without key fails
    const noKey = run(process.execPath, ['scripts/operator-rc-release.mjs'], {
      env: { SECURIST_OPERATOR_SIGNING_KEY: '' },
    })
    assert('production operator:rc without key fails', noKey.status !== 0)

    // random keypair cannot sign monorepo production trust-root
    const { privateKey } = generateKeyPairSync('ed25519')
    const wrongPriv = join(work, 'wrong-private.pem')
    writeFileSync(
      wrongPriv,
      privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
      { mode: 0o600 },
    )
    // need build for digest
    run(process.execPath, ['scripts/build-operator.mjs'])
    const wrongSign = run(process.execPath, ['scripts/sign-operator-identity.mjs'], {
      env: { SECURIST_OPERATOR_SIGNING_KEY: wrongPriv },
    })
    assert(
      'wrong private key cannot sign production trust-root',
      wrongSign.status !== 0,
      'expected mismatch with packaged public root',
    )
  } finally {
    rmSync(work, { recursive: true, force: true })
  }

  // ── 6. Production-signed path (only when offline key present) ─────────
  console.log('\n[production-signed RC — optional when key present]')
  const keyPath =
    process.env.SECURIST_OPERATOR_SIGNING_KEY?.trim() ||
    join(process.env.HOME || '', '.securist/keys/securist-operator-release-private.pem')
  if (keyPath && existsSync(keyPath)) {
    ok('production signing key path present (local)')
    const prod = run(process.execPath, ['scripts/operator-rc-release.mjs'], {
      env: {
        SECURIST_OPERATOR_SIGNING_KEY: keyPath,
        SECURIST_OPERATOR_SIGNER_KEY_ID: 'securist-operator-release-key',
      },
    })
    assert(
      'production operator:rc exits 0',
      prod.status === 0,
      (prod.stderr || prod.stdout || '').slice(0, 800),
    )
    const latestProd = JSON.parse(
      readFileSync(join(ROOT, '.operator-rc/latest-rc.json'), 'utf8'),
    )
    assert(
      'production latest publicNpxClaim false',
      latestProd.publicNpxClaim === false,
    )
    assert(
      'production signerKeyId is release key',
      latestProd.signerKeyId === 'securist-operator-release-key',
    )
    assert(
      'production stage is not dogfood dir name',
      !String(latestProd.stageDir || '').includes('dogfood'),
    )
    const prodStage = join(ROOT, latestProd.stageDir)
    const prodManifest = JSON.parse(
      readFileSync(join(prodStage, 'MANIFEST.json'), 'utf8'),
    )
    assert(
      'production MANIFEST kind is release candidate (not dogfood kind only)',
      prodManifest.kind === 'securist_operator_release_candidate',
    )
    assert(
      'production MANIFEST signerKeyId release key',
      prodManifest.signerKeyId === 'securist-operator-release-key',
    )
    assert(
      'production staged trust-root matches monorepo production',
      sha256File(join(prodStage, 'keys/trust-root.pem')) ===
        PRODUCTION_TRUST_SHA256,
    )
    const prodId = JSON.parse(
      readFileSync(join(prodStage, 'runtime-identity.json'), 'utf8'),
    )
    const prodTrust = readFileSync(
      join(prodStage, 'keys/trust-root.pem'),
      'utf8',
    )
    assert(
      'production identity verifies against production trust-root',
      verify(
        null,
        Buffer.from(prodId.contentDigest.hex, 'utf8'),
        createPublicKey(prodTrust),
        Buffer.from(prodId.signature, 'base64'),
      ),
    )
    // prove private key matches
    try {
      const priv = createPrivateKey(readFileSync(keyPath, 'utf8'))
      const derived = createPublicKey(priv)
        .export({ type: 'spki', format: 'pem' })
        .toString()
      assert(
        'offline private key derives monorepo trust-root',
        derived === readFileSync(trustPath, 'utf8'),
      )
    } catch (e) {
      fail('offline private key derives monorepo trust-root', String(e))
    }

    const prodVerify = run(process.execPath, [
      'scripts/operator-rc-verify-clean.mjs',
      '--rc-dir',
      prodStage,
    ])
    assert(
      'verify-clean production dir exits 0',
      prodVerify.status === 0,
      (prodVerify.stderr || prodVerify.stdout || '').slice(0, 600),
    )
    if (latestProd.tarball && existsSync(join(ROOT, latestProd.tarball))) {
      const prodTgz = run(process.execPath, [
        'scripts/operator-rc-verify-clean.mjs',
        '--rc-tgz',
        join(ROOT, latestProd.tarball),
      ])
      assert(
        'verify-clean production tarball exits 0',
        prodTgz.status === 0,
        (prodTgz.stderr || prodTgz.stdout || '').slice(0, 600),
      )
    }
    // remove monorepo runtime-identity residue so default stays unsigned
    rmSync(join(OPERATOR, 'runtime-identity.json'), { force: true })
  } else {
    ok('production signing key absent — CI/ephemeral path only (skip prod RC)')
  }

  // ── 7. Public assess unit contract smoke (imported battery) ───────────
  console.log('\n[public assess — module contract]')
  const assessTests = run(process.execPath, [
    'node_modules/tsx/dist/cli.mjs',
    'src/lib/decision-graph/fixtures/run-public-assess-tests.ts',
  ])
  // prefer npm script if tsx path differs
  const assessViaNpm = run('npm', ['run', 'test:public-assess'])
  assert(
    'public assess fixture suite exits 0',
    assessViaNpm.status === 0,
    (assessViaNpm.stderr || assessViaNpm.stdout || '').slice(0, 400),
  )
  void assessTests

  const productViaNpm = run('npm', ['run', 'test:product-surface'])
  assert(
    'product surface fixture suite exits 0',
    productViaNpm.status === 0,
    (productViaNpm.stderr || productViaNpm.stdout || '').slice(0, 400),
  )

  const opViaNpm = run('npm', ['run', 'test:operator'])
  assert(
    'operator fixture suite exits 0',
    opViaNpm.status === 0,
    (opViaNpm.stderr || opViaNpm.stdout || '').slice(0, 400),
  )

  // ── Summary ───────────────────────────────────────────────────────────
  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) {
    console.error(`\nGolden-path battery FAILED (${failed})`)
    process.exit(1)
  }
  console.log('\nGolden-path battery ok')
  console.log(
    'Loop covered: product ladder · trust-root · dogfood RC · tarball · adversarial · optional production RC · assess/operator suites',
  )
}

main()
