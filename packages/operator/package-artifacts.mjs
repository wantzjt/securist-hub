/**
 * Canonical packaged-artifact set for operator release digest/sign/verify.
 *
 * This set MUST include the executed binary (dist/cli.js). A signature over
 * sources alone does not attest what bin/securist.mjs runs.
 *
 * runtime-identity.json is excluded from the digest (it carries the signature)
 * but is included in the release package.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/** Relative paths under packages/operator that form the signed release. */
export const PACKAGE_ARTIFACT_RELS = [
  'dist/cli.js',
  'bin/securist.mjs',
  'package.json',
  'keys/trust-root.pem',
]

/**
 * @param {string} operatorDir absolute path to packages/operator
 * @returns {{ ok: true, files: string[] } | { ok: false, error: string, missing: string[] }}
 */
export function resolvePackageArtifacts(operatorDir) {
  const files = []
  const missing = []
  for (const rel of PACKAGE_ARTIFACT_RELS) {
    const abs = join(operatorDir, rel)
    if (!existsSync(abs)) missing.push(rel)
    else files.push(abs)
  }
  if (missing.length) {
    return {
      ok: false,
      error: `Missing packaged artifacts (build first): ${missing.join(', ')}`,
      missing,
    }
  }
  // Stable order matching PACKAGE_ARTIFACT_RELS
  return { ok: true, files }
}

/**
 * SHA-256 over relpath + content for each packaged artifact.
 * @param {string} operatorDir
 * @returns {{ ok: true, hex: string, files: string[] } | { ok: false, error: string }}
 */
export function computePackageContentDigest(operatorDir) {
  const resolved = resolvePackageArtifacts(operatorDir)
  if (!resolved.ok) return { ok: false, error: resolved.error }

  const h = createHash('sha256')
  for (const abs of resolved.files) {
    const rel = relative(operatorDir, abs).replace(/\\/g, '/')
    h.update(rel)
    h.update('\0')
    h.update(readFileSync(abs))
    h.update('\0')
  }
  return { ok: true, hex: h.digest('hex'), files: resolved.files }
}
