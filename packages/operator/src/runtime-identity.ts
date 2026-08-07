/**
 * Operator runtime trust check.
 *
 * Public trust root only is packaged. Matching private release key is
 * human-controlled and MUST NOT live in git/npm.
 *
 * Without a valid signed identity over current operator bytes, capability is
 * runtime_unavailable — never call that "runtime verified."
 *
 * Not a TARX model pack.
 */
import { createHash, createPublicKey, verify } from 'node:crypto'
import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ComponentProvenanceV1 } from '../../contracts/src/local-assess'
import { componentUsedVerified } from '../../contracts/src/local-assess'

const OPERATOR_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Override paths for tests (ephemeral trust root). Never a private key path. */
function publicKeyPath(): string {
  return (
    process.env.SECURIST_OPERATOR_PUBLIC_KEY_PATH?.trim() ||
    join(OPERATOR_DIR, 'keys', 'trust-root.pem')
  )
}

function identityPath(): string {
  return (
    process.env.SECURIST_OPERATOR_IDENTITY_PATH?.trim() ||
    join(OPERATOR_DIR, 'runtime-identity.json')
  )
}

const COMPONENT_ID = 'securist-operator'

export type RuntimeIdentityFile = {
  componentId: string
  version: string
  contentDigest: { algorithm: 'sha256'; hex: string }
  signerKeyId: string
  signature: string
  note: string
}

function walkHashFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir).sort()) {
    if (
      name === 'node_modules' ||
      name === 'fixtures' ||
      name === 'dist' ||
      name.startsWith('.')
    )
      continue
    if (name === 'runtime-identity.json') continue
    // Never hash private keys if present
    if (name.endsWith('-private.pem') || name === 'fixture-private.pem') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walkHashFiles(p))
    else if (st.isFile()) out.push(p)
  }
  return out
}

export function computeOperatorContentDigest(root = OPERATOR_DIR): string {
  const files = walkHashFiles(root)
  const h = createHash('sha256')
  for (const f of files) {
    const rel = relative(root, f).replace(/\\/g, '/')
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

export type RuntimeCheck =
  | {
      ok: true
      identity: RuntimeIdentityFile
      provenance: ComponentProvenanceV1
      trust: 'release_signed'
    }
  | { ok: false; code: string; error: string }

/**
 * Verify signed operator identity with packaged (or env) public trust root.
 * Does not claim TARX model-pack verification.
 * Does not use any private key.
 */
export function verifyOperatorRuntime(): RuntimeCheck {
  const pubPath = publicKeyPath()
  const idPath = identityPath()

  if (!existsSync(pubPath)) {
    return {
      ok: false,
      code: 'runtime_unavailable',
      error:
        'No public trust root for operator runtime. Release identity not configured.',
    }
  }
  if (!existsSync(idPath)) {
    return {
      ok: false,
      code: 'runtime_unavailable',
      error:
        'No signed runtime-identity.json. Human release signing required; assess blocked.',
    }
  }

  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(readFileSync(idPath, 'utf8')) as Record<string, unknown>
  } catch {
    return {
      ok: false,
      code: 'runtime_invalid',
      error: 'runtime-identity.json is not valid JSON',
    }
  }

  const digestObj = raw.contentDigest as { hex?: string } | undefined
  if (
    !digestObj?.hex ||
    typeof raw.signature !== 'string' ||
    typeof raw.signerKeyId !== 'string'
  ) {
    return {
      ok: false,
      code: 'runtime_unavailable',
      error: 'runtime-identity.json missing digest, signature, or signerKeyId',
    }
  }
  const identity = raw as unknown as RuntimeIdentityFile

  const current = computeOperatorContentDigest()
  if (current !== identity.contentDigest.hex) {
    return {
      ok: false,
      code: 'runtime_digest_mismatch',
      error:
        'Operator bytes do not match signed identity (tamper or unsigned local build).',
    }
  }

  let pub
  try {
    pub = createPublicKey(readFileSync(pubPath, 'utf8'))
  } catch {
    return {
      ok: false,
      code: 'runtime_unavailable',
      error: 'Public trust root is not a valid key',
    }
  }

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
      error: 'Operator integrity signature invalid against trust root',
    }
  }

  return {
    ok: true,
    identity,
    trust: 'release_signed',
    provenance: componentUsedVerified({
      componentId: identity.componentId || COMPONENT_ID,
      version: identity.version || readPackageVersion(),
      contentDigestHex: identity.contentDigest.hex,
      signerKeyId: identity.signerKeyId,
    }),
  }
}

/** True only if a real TARX model pack is installed and verified (not in WO-012). */
export function isTarxModelPackPresent(): boolean {
  return false
}
