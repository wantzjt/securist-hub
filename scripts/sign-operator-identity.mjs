#!/usr/bin/env node
/**
 * Human/offline release signing for operator packaged artifacts.
 *
 * Order: npm run operator:build → this script.
 * Digests dist/cli.js + bin + package.json + trust-root (not runtime-identity.json).
 *
 * Requires SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem (NEVER in git).
 *
 * Usage:
 *   SECURIST_OPERATOR_SIGNING_KEY=~/keys/operator-release.pem node scripts/sign-operator-identity.mjs
 */
import {
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const operatorDir = join(root, 'packages/operator')
const identityPath = join(operatorDir, 'runtime-identity.json')
const publicKeyPath =
  process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH ||
  join(operatorDir, 'keys', 'trust-root.pem')
const privateKeyPath = process.env.SECURIST_OPERATOR_SIGNING_KEY

const { computePackageContentDigest, PACKAGE_ARTIFACT_RELS } = await import(
  pathToFileURL(join(operatorDir, 'package-artifacts.mjs')).href
)

if (!privateKeyPath || !existsSync(privateKeyPath)) {
  console.error(
    'Set SECURIST_OPERATOR_SIGNING_KEY to a private key path outside the repository.',
  )
  process.exit(1)
}
if (!existsSync(publicKeyPath)) {
  console.error('Public trust root missing:', publicKeyPath)
  process.exit(1)
}

const digest = computePackageContentDigest(operatorDir)
if (!digest.ok) {
  console.error(digest.error)
  console.error('Run: npm run operator:build')
  process.exit(1)
}

const version = JSON.parse(
  readFileSync(join(operatorDir, 'package.json'), 'utf8'),
).version

const priv = createPrivateKey(readFileSync(privateKeyPath, 'utf8'))
const pub = createPublicKey(readFileSync(publicKeyPath, 'utf8'))
const signature = sign(null, Buffer.from(digest.hex, 'utf8'), priv).toString(
  'base64',
)
if (
  !verify(
    null,
    Buffer.from(digest.hex, 'utf8'),
    pub,
    Buffer.from(signature, 'base64'),
  )
) {
  console.error('Signature does not verify with packaged public trust root.')
  process.exit(1)
}

const identity = {
  componentId: 'securist-operator',
  version,
  contentDigest: { algorithm: 'sha256', hex: digest.hex },
  signerKeyId:
    process.env.SECURIST_OPERATOR_SIGNER_KEY_ID ||
    'securist-operator-release-key',
  signature,
  artifacts: [...PACKAGE_ARTIFACT_RELS],
  note: 'Release-signed packaged artifacts (incl. dist/cli.js). Private key not in git. Not TARX model-pack synthesis.',
}
writeFileSync(identityPath, JSON.stringify(identity, null, 2) + '\n')
console.log('Wrote', identityPath)
console.log('digest', digest.hex)
console.log('artifacts', PACKAGE_ARTIFACT_RELS.join(', '))
