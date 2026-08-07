/**
 * securist doctor — capability gate without model theater.
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

  let capability: LocalCapabilityStateV1
  if (!runtime.ok) {
    capability =
      runtime.code === 'signature_invalid'
        ? 'signature_invalid'
        : 'runtime_verified' // still allow messaging; assess will fail if not ok
    // If identity missing, treat as synthesis_unavailable path after fix —
    // assess requires runtime ok. Doctor reports honestly.
    if (runtime.code === 'signature_invalid') {
      capability = 'signature_invalid'
    } else {
      // runtime not verified — still not synthesis
      capability = 'synthesis_unavailable'
    }
  } else if (modelPackPresent) {
    // Pack path present but we do not claim verified without full TARX verify
    // Until real pack verification exists, never claim synthesis_verified.
    capability = 'synthesis_unavailable'
  } else {
    capability = 'synthesis_unavailable'
  }

  // If runtime verified, upgrade note: runtime ok, synthesis unavailable
  const runtimeOk = runtime.ok
  if (runtimeOk && capability !== 'signature_invalid') {
    capability = 'synthesis_unavailable'
  }

  const synthesisAvailable = false // WO-012: never until real signed TARX pack verify lands

  const lines: string[] = []
  if (runtimeOk) {
    lines.push('Runtime verified (securist-operator package integrity)')
  } else {
    lines.push(`Runtime not verified: ${runtime.error}`)
  }
  lines.push('Synthesis unavailable — deterministic assess ready')
  lines.push(`Local state: ${operatorStateRoot()}`)
  lines.push('Model pack: not installed / not verified (no pretend synthesis)')
  lines.push(
    'Capability: ' +
      (runtimeOk
        ? 'runtime integrity ok · synthesis_unavailable'
        : capability),
  )

  return {
    capability: runtimeOk ? 'synthesis_unavailable' : capability,
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
