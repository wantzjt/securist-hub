/**
 * Deterministic, read-only manifest collection.
 * No installs, builds, shell, or recursive untrusted tree walks.
 */
import { createHash } from 'node:crypto'
import {
  openSandbox,
  readTextUnderSandbox,
  relativeSourceLabel,
} from './path-sandbox'
import type { SandboxRoot } from './path-sandbox'

export type ManifestObservation = {
  domain: string
  assertion: string
  verification: 'observed'
  source: string
}

export type CollectedManifests = {
  sandbox: SandboxRoot
  displayName: string
  packageName: string | null
  packageVersion: string | null
  licenseSpdx: string | null
  primaryLanguage: string | null
  manifestFingerprint: string
  observed: ManifestObservation[]
  evidenceGaps: string[]
  unknowns: string[]
  reReviewTriggers: string[]
}

const MANIFEST_CANDIDATES = [
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'Cargo.toml',
  'go.mod',
  'pyproject.toml',
  'requirements.txt',
  'Gemfile',
  'composer.json',
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
] as const

function sha256Text(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex')
}

function parsePackageJson(text: string): {
  name: string | null
  version: string | null
  license: string | null
} {
  try {
    const j = JSON.parse(text) as {
      name?: string
      version?: string
      license?: string | { type?: string }
    }
    const license =
      typeof j.license === 'string'
        ? j.license
        : j.license && typeof j.license === 'object'
          ? j.license.type || null
          : null
    return {
      name: j.name || null,
      version: j.version || null,
      license: license,
    }
  } catch {
    return { name: null, version: null, license: null }
  }
}

function detectLanguage(present: Set<string>): string | null {
  if (present.has('package.json')) return 'JavaScript/TypeScript'
  if (present.has('Cargo.toml')) return 'Rust'
  if (present.has('go.mod')) return 'Go'
  if (present.has('pyproject.toml') || present.has('requirements.txt'))
    return 'Python'
  if (present.has('Gemfile')) return 'Ruby'
  if (present.has('composer.json')) return 'PHP'
  return null
}

export function collectManifests(targetPath: string): CollectedManifests {
  const sandbox = openSandbox(targetPath)
  const observed: ManifestObservation[] = []
  const hashParts: string[] = []
  const present = new Set<string>()

  let packageName: string | null = null
  let packageVersion: string | null = null
  let licenseSpdx: string | null = null

  for (const name of MANIFEST_CANDIDATES) {
    const read = readTextUnderSandbox(sandbox, name)
    if (!read.ok) continue
    present.add(name)
    hashParts.push(`${name}:${sha256Text(read.text)}`)

    if (name === 'package.json') {
      const pkg = parsePackageJson(read.text)
      packageName = pkg.name
      packageVersion = pkg.version
      if (pkg.license) licenseSpdx = pkg.license
      observed.push({
        domain: 'provenance',
        assertion: `Root package.json observed${pkg.name ? `: name ${pkg.name}` : ''}${pkg.version ? ` @ ${pkg.version}` : ''}.`,
        verification: 'observed',
        source: relativeSourceLabel(name),
      })
      if (pkg.license) {
        observed.push({
          domain: 'license',
          assertion: `License field observed in package.json: ${pkg.license}.`,
          verification: 'observed',
          source: relativeSourceLabel(name),
        })
      }
    } else if (name.startsWith('LICENSE')) {
      observed.push({
        domain: 'license',
        assertion: `License file present at repository root (${name}). Content not inlined.`,
        verification: 'observed',
        source: relativeSourceLabel(name),
      })
    } else if (
      name === 'package-lock.json' ||
      name === 'pnpm-lock.yaml' ||
      name === 'yarn.lock'
    ) {
      observed.push({
        domain: 'provenance',
        assertion: `Lockfile observed: ${name} (fingerprint only; not a vulnerability scan).`,
        verification: 'observed',
        source: relativeSourceLabel(name),
      })
    } else {
      observed.push({
        domain: 'provenance',
        assertion: `Manifest present: ${name}.`,
        verification: 'observed',
        source: relativeSourceLabel(name),
      })
    }
  }

  // Display name without absolute path
  const displayName =
    packageName ||
    sandbox.rootReal.split(/[/\\]/).filter(Boolean).pop() ||
    'repository'

  if (observed.length === 0) {
    observed.push({
      domain: 'provenance',
      assertion:
        'No supported root manifests observed (package.json, Cargo.toml, go.mod, etc.).',
      verification: 'observed',
      source: 'manifest:root',
    })
  }

  const evidenceGaps = ['security', 'model_governance', 'crypto_agility']
  if (!licenseSpdx && ![...present].some((p) => p.startsWith('LICENSE'))) {
    evidenceGaps.unshift('license')
  }

  const unknowns = [
    'No security advisory or SCA scan was performed.',
    'Dependency tree and transitive risk were not fully evaluated.',
    'No local validation, pentest, or model synthesis was run.',
    'Maintainer authenticity and supply-chain attestations were not verified.',
  ]

  const reReviewTriggers = [
    'Root manifest or lockfile content fingerprint change',
    'License file or SPDX field change',
    'Intended use or deployment boundary change',
    'Policy version change affecting this scope',
  ]

  return {
    sandbox,
    displayName,
    packageName,
    packageVersion,
    licenseSpdx,
    primaryLanguage: detectLanguage(present),
    manifestFingerprint: sha256Text(hashParts.sort().join('|') || 'empty'),
    observed,
    evidenceGaps,
    unknowns,
    reReviewTriggers,
  }
}
