/**
 * Operator runtime trust check over packaged artifacts (incl. dist/cli.js).
 *
 * Digest set must match scripts/sign-operator-identity.mjs /
 * packages/operator/package-artifacts.mjs exactly.
 */
import { createHash, createPublicKey, verify } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ComponentProvenanceV1 } from '../../contracts/src/local-assess'
import { componentUsedVerified } from '../../contracts/src/local-assess'

const OPERATOR_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Keep in sync with package-artifacts.mjs PACKAGE_ARTIFACT_RELS */
export const PACKAGE_ARTIFACT_RELS = [
  'dist/cli.js',
  'bin/securist.mjs',
  'package.json',
  'keys/trust-root.pem',
] as const

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
  artifacts?: string[]
}

export function tryComputeOperatorContentDigest(
  root = OPERATOR_DIR,
): { ok: true; hex: string } | { ok: false; error: string } {
  const parts: string[] = []
  const missing: string[] = []
  for (const rel of PACKAGE_ARTIFACT_RELS) {
    const abs = join(root, rel)
    if (!existsSync(abs)) missing.push(rel)
    else parts.push(abs)
  }
  if (missing.length) {
    return {
      ok: false,
      error: `Missing packaged artifacts (build first): ${missing.join(', ')}`,
    }
  }
  const h = createHash('sha256')
  for (const abs of parts) {
    const rel = relative(root, abs).replace(/\\/g, '/')
    h.update(rel)
    h.update('\0')
    h.update(readFileSync(abs))
    h.update('\0')
  }
  return { ok: true, hex: h.digest('hex') }
}

export function computeOperatorContentDigest(root = OPERATOR_DIR): string {
  const r = tryComputeOperatorContentDigest(root)
  if (!r.ok) throw new Error(r.error)
  return r.hex
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

  const digestResult = tryComputeOperatorContentDigest()
  if (!digestResult.ok) {
    return {
      ok: false,
      code: 'runtime_unavailable',
      error: digestResult.error,
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

  if (digestResult.hex !== identity.contentDigest.hex) {
    return {
      ok: false,
      code: 'runtime_digest_mismatch',
      error:
        'Packaged artifacts (including dist/cli.js) do not match signed identity (tamper or stale build).',
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

export function isTarxModelPackPresent(): boolean {
  return false
}
