/**
 * securist doctor — capability gate without verification theater.
 */
import type { LocalCapabilityStateV1 } from '../../contracts/src/local-assess'
import { isTarxModelPackPresent, verifyOperatorRuntime } from './runtime-identity'
import type { RuntimeCheck } from './runtime-identity'
import { ensureOperatorState, operatorStateRoot } from './local-state'

export type DoctorReport = {
  capability: LocalCapabilityStateV1
  runtimeOk: boolean
  synthesisAvailable: boolean
  modelPackPresent: boolean
  stateRoot: string
  lines: string[]
  runtime: RuntimeCheck
}

export function runDoctor(): DoctorReport {
  const stateRoot = ensureOperatorState()
  const runtime = verifyOperatorRuntime()
  const modelPackPresent = isTarxModelPackPresent()
  const runtimeOk = runtime.ok
  const synthesisAvailable = false // until real signed TARX pack verification

  let capability: LocalCapabilityStateV1
  if (!runtimeOk) {
    capability =
      runtime.code === 'signature_invalid'
        ? 'signature_invalid'
        : 'runtime_unavailable'
  } else {
    // Runtime trust ok; model synthesis still unavailable in WO-012
    capability = 'synthesis_unavailable'
  }

  const lines: string[] = []
  if (runtimeOk) {
    lines.push(
      'Runtime verified (release-signed operator identity against public trust root)',
    )
    lines.push('Synthesis unavailable — deterministic assess ready')
  } else {
    lines.push(`Runtime unavailable: ${runtime.error}`)
    lines.push('Deterministic assess blocked until a release-signed identity is present')
    if (runtime.code === 'signature_invalid') {
      lines.push('Signature invalid against Ed25519 trust root — do not treat this build as verified')
      lines.push('Wrong or tampered Release artifact; re-fetch the signed GitHub Release tarball')
    }
  }
  lines.push(`Local state: ${operatorStateRoot()}`)
  lines.push('Model pack: not installed / not verified (no pretend synthesis)')
  lines.push(`Capability: ${capability}`)

  return {
    capability,
    runtimeOk,
    synthesisAvailable,
    modelPackPresent,
    stateRoot,
    lines,
    runtime,
  }
}

export function formatDoctorReport(r: DoctorReport): string {
  return ['securist doctor', ...r.lines.map((l) => `  · ${l}`)].join('\n')
}
