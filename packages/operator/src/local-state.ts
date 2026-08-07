/**
 * Secure local state outside the target repository.
 * Default: ~/.securist/operator (or SECURIST_HOME/operator)
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { LocalDecisionBriefV1 } from '../../contracts/src/local-assess'

export function operatorStateRoot(): string {
  const base =
    process.env.SECURIST_HOME?.trim() || join(homedir(), '.securist')
  return join(base, 'operator')
}

export function ensureOperatorState(): string {
  const root = operatorStateRoot()
  mkdirSync(join(root, 'briefs'), { recursive: true })
  mkdirSync(join(root, 'runs'), { recursive: true })
  return root
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
  writeFileSync(path, JSON.stringify(brief, null, 2), 'utf8')
  writeFileSync(
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
    'utf8',
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

export function stateIsOutsideTarget(
  stateRoot: string,
  targetReal: string,
): boolean {
  const s = stateRoot.replace(/\\/g, '/').toLowerCase()
  const t = targetReal.replace(/\\/g, '/').toLowerCase()
  return !s.startsWith(t + '/') && s !== t
}

export function listStoredBriefs(): string[] {
  const dir = join(ensureOperatorState(), 'briefs')
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((f) => f.endsWith('.json'))
}
