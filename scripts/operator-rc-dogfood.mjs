#!/usr/bin/env node
/**
 * WO-018 — dogfood release candidate with an ephemeral keypair.
 *
 * Proves the pack + clean-machine path without the human offline key.
 * The ephemeral public key is staged only into the RC (not monorepo trust-root).
 * Does not publish. Does not claim public npx.
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  copyFileSync,
  rmSync,
  readFileSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import {
  generateKeyPairSync,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from 'node:crypto'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OPERATOR = join(ROOT, 'packages/operator')
const OUT = join(ROOT, '.operator-rc')

function die(msg) {
  console.error(msg)
  process.exit(1)
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: process.env,
    stdio: opts.stdio || 'pipe',
  })
  if (r.status !== 0) {
    die(`${cmd} failed:\n${r.stderr || r.stdout}`)
  }
  return r
}

async function main() {
  console.log('operator:rc:dogfood — ephemeral signed RC (no human key)\n')

  run(process.execPath, ['scripts/operator-rc-preflight.mjs'], {
    stdio: 'inherit',
  })

  const { computePackageContentDigest, PACKAGE_ARTIFACT_RELS } = await import(
    pathToFileURL(join(OPERATOR, 'package-artifacts.mjs')).href
  )

  const pkg = JSON.parse(readFileSync(join(OPERATOR, 'package.json'), 'utf8'))
  const version = pkg.version || '0.0.0'
  const dirName = `securist-operator-${version}-rc-dogfood`
  const stage = join(OUT, dirName)
  rmSync(stage, { recursive: true, force: true })
  mkdirSync(join(stage, 'bin'), { recursive: true })
  mkdirSync(join(stage, 'dist'), { recursive: true })
  mkdirSync(join(stage, 'keys'), { recursive: true })

  const copies = [
    ['package.json', 'package.json'],
    ['package-artifacts.mjs', 'package-artifacts.mjs'],
    ['bin/securist.mjs', 'bin/securist.mjs'],
    ['dist/cli.js', 'dist/cli.js'],
    ['keys/README.md', 'keys/README.md'],
  ]
  for (const [from, to] of copies) {
    copyFileSync(join(OPERATOR, from), join(stage, to))
  }

  // Ephemeral trust root staged into RC only (never overwrites monorepo trust-root)
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  writeFileSync(join(stage, 'keys/trust-root.pem'), pubPem)

  // Digest must cover staged trust-root + dist (same PACKAGE_ARTIFACT_RELS)
  const digest = computePackageContentDigest(stage)
  if (!digest.ok) die(digest.error)

  const signature = sign(
    null,
    Buffer.from(digest.hex, 'utf8'),
    createPrivateKey(privPem),
  ).toString('base64')
  if (
    !verify(
      null,
      Buffer.from(digest.hex, 'utf8'),
      createPublicKey(pubPem),
      Buffer.from(signature, 'base64'),
    )
  ) {
    die('ephemeral signature self-check failed')
  }

  const identity = {
    componentId: 'securist-operator',
    version: `${version}-dogfood`,
    contentDigest: { algorithm: 'sha256', hex: digest.hex },
    signerKeyId: 'securist-operator-dogfood-ephemeral',
    signature,
    artifacts: [...PACKAGE_ARTIFACT_RELS],
    note: 'Dogfood RC only — ephemeral key. Not a production release signature. Not for public npx.',
  }
  writeFileSync(
    join(stage, 'runtime-identity.json'),
    JSON.stringify(identity, null, 2) + '\n',
  )

  writeFileSync(
    join(stage, 'MANIFEST.json'),
    JSON.stringify(
      {
        kind: 'securist_operator_release_candidate_dogfood',
        version: identity.version,
        private: true,
        publicNpxClaim: false,
        contentDigest: identity.contentDigest,
        signerKeyId: identity.signerKeyId,
        dogfood: true,
      },
      null,
      2,
    ) + '\n',
  )
  writeFileSync(
    join(stage, 'VERIFY.md'),
    '# Dogfood RC — see monorepo docs/OPERATOR-RELEASE-LANE.md\n',
  )

  // Private key must not land in RC
  if (existsSync(join(stage, 'private.pem'))) {
    die('private key leaked into dogfood stage')
  }

  // Tar
  const tgz = join(OUT, `${dirName}.tgz`)
  const tar = spawnSync(
    'tar',
    ['-czf', tgz, '-C', OUT, dirName],
    { encoding: 'utf8' },
  )
  if (tar.status !== 0) die(`tar failed: ${tar.stderr}`)

  writeFileSync(
    join(OUT, 'latest-rc.json'),
    JSON.stringify(
      {
        ok: true,
        dogfood: true,
        stageDir: `.operator-rc/${dirName}`,
        tarball: `.operator-rc/${dirName}.tgz`,
        contentDigest: digest.hex,
        publicNpxClaim: false,
      },
      null,
      2,
    ) + '\n',
  )

  // Clean verify
  const clean = spawnSync(
    process.execPath,
    [
      'scripts/operator-rc-verify-clean.mjs',
      '--rc-dir',
      stage,
      '--fixture',
      join(OPERATOR, 'fixtures/sample-target'),
    ],
    { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' },
  )
  if (clean.status !== 0) {
    die('clean verify failed for dogfood RC')
  }

  // Never leave private key on disk longer than needed — write then unlink
  // (kept only in memory above)

  console.log('\noperator:rc:dogfood ok')
  console.log('  stage:', `.operator-rc/${dirName}`)
  console.log('  dogfood: true · publicNpxClaim: false')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
