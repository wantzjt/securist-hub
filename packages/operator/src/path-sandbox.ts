/**
 * Hostile-input-safe path resolution.
 * All reads must stay inside the real target root; no symlink escape.
 */
import { realpathSync, existsSync, lstatSync, readFileSync, statSync } from 'node:fs'
import { resolve, relative, isAbsolute, sep } from 'node:path'

export type SandboxRoot = {
  /** Absolute real path of target root */
  rootReal: string
  /** Display label only */
  rootLabel: '.'
}

export function openSandbox(targetPath: string): SandboxRoot {
  const abs = resolve(targetPath)
  if (!existsSync(abs)) {
    throw Object.assign(new Error(`Path not found: ${targetPath}`), {
      code: 'not_found',
    })
  }
  const st = lstatSync(abs)
  if (st.isSymbolicLink()) {
    // Resolve once, then enforce containment of the final root
  }
  const rootReal = realpathSync(abs)
  const rootStat = statSync(rootReal)
  if (!rootStat.isDirectory()) {
    throw Object.assign(new Error('Assess target must be a directory'), {
      code: 'not_directory',
    })
  }
  return { rootReal, rootLabel: '.' }
}

/**
 * Resolve a relative path under the sandbox. Rejects absolute paths and
 * anything that escapes root after realpath (symlink jail).
 */
export function resolveUnderSandbox(
  sandbox: SandboxRoot,
  relativePath: string,
): string | null {
  if (!relativePath || relativePath.includes('\0')) return null
  if (isAbsolute(relativePath)) return null
  if (relativePath.split(/[/\\]/).includes('..')) return null

  const candidate = resolve(sandbox.rootReal, relativePath)
  // Quick prefix check before realpath
  const rel = relative(sandbox.rootReal, candidate)
  if (rel.startsWith('..') || isAbsolute(rel)) return null

  if (!existsSync(candidate)) return null

  let real: string
  try {
    // If symlink, realpath must still be under root
    real = realpathSync(candidate)
  } catch {
    return null
  }

  const relReal = relative(sandbox.rootReal, real)
  if (relReal.startsWith('..') || isAbsolute(relReal)) return null
  return real
}

const MAX_FILE_BYTES = 512 * 1024

export function readTextUnderSandbox(
  sandbox: SandboxRoot,
  relativePath: string,
): { ok: true; text: string; relativePath: string } | { ok: false; reason: string } {
  const real = resolveUnderSandbox(sandbox, relativePath)
  if (!real) return { ok: false, reason: 'path_rejected' }
  const st = lstatSync(real)
  if (!st.isFile() && !st.isSymbolicLink()) {
    return { ok: false, reason: 'not_file' }
  }
  // Re-check containment after lstat if symlink
  if (st.isSymbolicLink()) {
    const target = resolveUnderSandbox(sandbox, relativePath)
    if (!target) return { ok: false, reason: 'symlink_escape' }
  }
  if (st.size > MAX_FILE_BYTES) return { ok: false, reason: 'too_large' }
  try {
    const text = readFileSync(real, 'utf8')
    return { ok: true, text, relativePath: relativePath.replace(/\\/g, '/') }
  } catch {
    return { ok: false, reason: 'read_failed' }
  }
}

/** Join relative segments safely for display — never absolute. */
export function relativeSourceLabel(name: string): string {
  return `manifest:${name.replace(/\\/g, '/')}`
}

export function listSafeJoin(...parts: string[]): string {
  return parts.join(sep)
}
