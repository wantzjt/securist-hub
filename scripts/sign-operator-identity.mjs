#!/usr/bin/env node
/**
 * Human/offline release signing for operator runtime identity.
 *
 * Requires SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem (NEVER in git).
 * Public key must match packages/operator/keys/trust-root.pem (or override path).
 *
 * Usage:
 *   SECURIST_OPERATOR_SIGNING_KEY=~/keys/operator-release.pem node scripts/sign-operator-identity.mjs
 */
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from 'node:crypto'
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const operatorDir = join(root, 'packages/operator')
const identityPath = join(operatorDir, 'runtime-identity.json')
const publicKeyPath =
  process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH ||
  join(operatorDir, 'keys', 'trust-root.pem')
const privateKeyPath = process.env.SECURIST_OPERATOR_SIGNING_KEY

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

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    if (['node_modules', 'fixtures', 'dist'].includes(name) || name.startsWith('.'))
      continue
    if (name === 'runtime-identity.json') continue
    if (name.endsWith('-private.pem') || name === 'fixture-private.pem') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p))
    else if (st.isFile()) out.push(p)
  }
  return out
}

const files = walk(operatorDir)
const h = createHash('sha256')
for (const f of files) {
  h.update(relative(operatorDir, f).replace(/\\/g, '/'))
  h.update('\0')
  h.update(readFileSync(f))
  h.update('\0')
}
const hex = h.digest('hex')
const version = JSON.parse(
  readFileSync(join(operatorDir, 'package.json'), 'utf8'),
).version

const priv = createPrivateKey(readFileSync(privateKeyPath, 'utf8'))
const pub = createPublicKey(readFileSync(publicKeyPath, 'utf8'))
const signature = sign(null, Buffer.from(hex, 'utf8'), priv).toString('base64')
if (!verify(null, Buffer.from(hex, 'utf8'), pub, Buffer.from(signature, 'base64'))) {
  console.error('Signature does not verify with packaged public trust root.')
  process.exit(1)
}

const identity = {
  componentId: 'securist-operator',
  version,
  contentDigest: { algorithm: 'sha256', hex },
  signerKeyId: process.env.SECURIST_OPERATOR_SIGNER_KEY_ID || 'securist-operator-release-key',
  signature,
  note: 'Release-signed operator integrity only — not TARX model-pack synthesis. Private key not in git.',
}
writeFileSync(identityPath, JSON.stringify(identity, null, 2) + '\n')
console.log('Wrote', identityPath)
console.log('digest', hex)
