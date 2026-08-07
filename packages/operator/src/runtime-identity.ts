/**
 * Operator package integrity as local deterministic runtime.
 * Not a TARX model pack. Signature attests operator sources only.
 */
import {
  createHash,
  createPublicKey,
  createPrivateKey,
  sign,
  verify,
} from 'node:crypto'
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ComponentProvenanceV1 } from '../../contracts/src/local-assess'
import { componentUsedVerified } from '../../contracts/src/local-assess'

const OPERATOR_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')
const IDENTITY_PATH = join(OPERATOR_DIR, 'runtime-identity.json')
const PUBLIC_KEY_PATH = join(OPERATOR_DIR, 'keys', 'fixture-public.pem')
const PRIVATE_KEY_PATH = join(OPERATOR_DIR, 'keys', 'fixture-private.pem')

const SIGNER_KEY_ID = 'securist-operator-fixture-key-1'
const COMPONENT_ID = 'securist-operator'

export type RuntimeIdentityFile = {
  componentId: string
  version: string
  contentDigest: { algorithm: 'sha256'; hex: string }
  signerKeyId: string
  signature: string
  note: string
}

function walkSourceFiles(dir: string, base = dir): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir).sort()) {
    if (name === 'node_modules' || name === 'fixtures' || name.startsWith('.'))
      continue
    if (name === 'runtime-identity.json') continue
    if (name === 'fixture-private.pem') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walkSourceFiles(p, base))
    else if (st.isFile()) out.push(p)
  }
  return out
}

export function computeOperatorContentDigest(): string {
  const files = walkSourceFiles(OPERATOR_DIR)
  const h = createHash('sha256')
  for (const f of files) {
    const rel = relative(OPERATOR_DIR, f).replace(/\\/g, '/')
    h.update(rel)
    h.update('\0')
    h.update(readFileSync(f))
    h.update('\0')
  }
  return h.digest('hex')
}

export function readPackageVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(join(OPERATOR_DIR, 'package.json'), 'utf8'),
    ) as { version?: string }
    return pkg.version || '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export function writeRuntimeIdentity(): RuntimeIdentityFile {
  const hex = computeOperatorContentDigest()
  const version = readPackageVersion()
  const priv = createPrivateKey(readFileSync(PRIVATE_KEY_PATH, 'utf8'))
  const signature = sign(null, Buffer.from(hex, 'utf8'), priv).toString('base64')
  const identity: RuntimeIdentityFile = {
    componentId: COMPONENT_ID,
    version,
    contentDigest: { algorithm: 'sha256', hex },
    signerKeyId: SIGNER_KEY_ID,
    signature,
    note: 'Operator package integrity only — not TARX model-pack synthesis.',
  }
  writeFileSync(IDENTITY_PATH, JSON.stringify(identity, null, 2) + '\n', 'utf8')
  return identity
}

export type RuntimeCheck =
  | {
      ok: true
      identity: RuntimeIdentityFile
      provenance: ComponentProvenanceV1
    }
  | { ok: false; code: string; error: string }

/**
 * Verify operator integrity signature against current sources.
 * Does not claim TARX model pack verification.
 */
export function verifyOperatorRuntime(): RuntimeCheck {
  if (!existsSync(IDENTITY_PATH) || !existsSync(PUBLIC_KEY_PATH)) {
    return {
      ok: false,
      code: 'runtime_unavailable',
      error:
        'Operator runtime identity missing. Run: npm run operator:sign-identity',
    }
  }
  let identity: RuntimeIdentityFile
  try {
    identity = JSON.parse(
      readFileSync(IDENTITY_PATH, 'utf8'),
    ) as RuntimeIdentityFile
  } catch {
    return {
      ok: false,
      code: 'runtime_invalid',
      error: 'runtime-identity.json is not valid JSON',
    }
  }

  const current = computeOperatorContentDigest()
  if (current !== identity.contentDigest.hex) {
    return {
      ok: false,
      code: 'runtime_digest_mismatch',
      error:
        'Operator sources changed since identity was signed. Run: npm run operator:sign-identity',
    }
  }

  const pub = createPublicKey(readFileSync(PUBLIC_KEY_PATH, 'utf8'))
  const sigOk = verify(
    null,
    Buffer.from(identity.contentDigest.hex, 'utf8'),
    pub,
    Buffer.from(identity.signature, 'base64'),
  )
  if (!sigOk) {
    return {
      ok: false,
      code: 'signature_invalid',
      error: 'Operator integrity signature invalid',
    }
  }

  return {
    ok: true,
    identity,
    provenance: componentUsedVerified({
      componentId: identity.componentId,
      version: identity.version,
      contentDigestHex: identity.contentDigest.hex,
      signerKeyId: identity.signerKeyId,
    }),
  }
}

/** True only if a real TARX model pack is installed and verified (not in WO-012 ship). */
export function isTarxModelPackPresent(): boolean {
  // Explicit: no pretend pack. Future: check signed pack under SECURIST_HOME/packs
  const packDir = join(
    process.env.SECURIST_HOME || '',
    'packs',
    'tarx-securist-operator',
  )
  return Boolean(process.env.SECURIST_HOME && existsSync(packDir))
}
