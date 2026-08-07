/**
 * Secure local state outside the target repository.
 * Default: ~/.securist/operator (or SECURIST_HOME/operator)
 * Directories 0700 · files 0600 · realpath containment checks.
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  chmodSync,
  realpathSync,
  lstatSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import type { LocalDecisionBriefV1 } from '../../contracts/src/local-assess'

const DIR_MODE = 0o700
const FILE_MODE = 0o600

export function operatorStateRootConfigured(): string {
  const base =
    process.env.SECURIST_HOME?.trim() || join(homedir(), '.securist')
  return join(resolve(base), 'operator')
}

function secureMkdir(path: string): void {
  mkdirSync(path, { recursive: true, mode: DIR_MODE })
  try {
    chmodSync(path, DIR_MODE)
  } catch {
    /* best effort on platforms that ignore mode */
  }
}

function secureWriteFile(path: string, data: string): void {
  writeFileSync(path, data, { encoding: 'utf8', mode: FILE_MODE })
  try {
    chmodSync(path, FILE_MODE)
  } catch {
    /* best effort */
  }
}

/**
 * Ensure state tree exists with restrictive permissions.
 * Returns the realpath of the operator state root after creation.
 */
export function ensureOperatorState(): string {
  const root = operatorStateRootConfigured()
  secureMkdir(root)
  secureMkdir(join(root, 'briefs'))
  secureMkdir(join(root, 'runs'))
  // Resolve real path (follows SECURIST_HOME symlink)
  return realpathSync(root)
}

/** Realpath of state root; creates dirs first. */
export function operatorStateRoot(): string {
  return ensureOperatorState()
}

export function briefStorePath(fingerprint: string): string {
  const safe = fingerprint.replace(/[^a-f0-9]/gi, '').slice(0, 64) || 'unknown'
  return join(ensureOperatorState(), 'briefs', `${safe}.json`)
}

export function saveLocalBrief(
  fingerprint: string,
  brief: LocalDecisionBriefV1,
): string {
  const path = briefStorePath(fingerprint)
  secureWriteFile(path, JSON.stringify(brief, null, 2))
  secureWriteFile(
    join(ensureOperatorState(), 'runs', 'latest.json'),
    JSON.stringify(
      {
        fingerprint,
        assessedAt: brief.assessedAt,
        capability: brief.capability,
        synthesis: brief.synthesis,
        path,
      },
      null,
      2,
    ),
  )
  return path
}

export function loadLatestBrief(): LocalDecisionBriefV1 | null {
  const latest = join(ensureOperatorState(), 'runs', 'latest.json')
  if (!existsSync(latest)) return null
  try {
    const meta = JSON.parse(readFileSync(latest, 'utf8')) as { path?: string }
    if (!meta.path || !existsSync(meta.path)) return null
    return JSON.parse(readFileSync(meta.path, 'utf8')) as LocalDecisionBriefV1
  } catch {
    return null
  }
}

/**
 * Reject state roots that resolve inside the assessed target
 * (including when SECURIST_HOME is a symlink into the target).
 */
export function assertStateOutsideTarget(targetReal: string): {
  ok: true
  stateReal: string
} | { ok: false; code: string; error: string } {
  let stateReal: string
  try {
    stateReal = ensureOperatorState()
  } catch (e) {
    return {
      ok: false,
      code: 'state_path',
      error: `Cannot create operator state: ${e instanceof Error ? e.message : String(e)}`,
    }
  }

  const t = targetReal.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase()
  const s = stateReal.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase()
  if (s === t || s.startsWith(t + '/')) {
    return {
      ok: false,
      code: 'state_path',
      error:
        'SECURIST_HOME/operator resolves inside the assessed repository (including via symlink). Use a state path outside the target.',
    }
  }
  return { ok: true, stateReal }
}

/** @deprecated use assertStateOutsideTarget */
export function stateIsOutsideTarget(
  stateRoot: string,
  targetReal: string,
): boolean {
  let s = stateRoot
  let t = targetReal
  try {
    if (existsSync(stateRoot)) s = realpathSync(stateRoot)
  } catch {
    /* keep */
  }
  try {
    if (existsSync(targetReal)) t = realpathSync(targetReal)
  } catch {
    /* keep */
  }
  const sn = s.replace(/\\/g, '/').toLowerCase()
  const tn = t.replace(/\\/g, '/').toLowerCase()
  return !sn.startsWith(tn + '/') && sn !== tn
}

export function listStoredBriefs(): string[] {
  const dir = join(ensureOperatorState(), 'briefs')
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((f) => f.endsWith('.json'))
}

export function modeOf(path: string): number {
  return lstatSync(path).mode & 0o777
}
