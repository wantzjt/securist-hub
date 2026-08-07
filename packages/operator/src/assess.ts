/**
 * securist assess . — deterministic LocalDecisionBriefV1
 * Requires release-signed operator runtime; blocks on runtime_unavailable.
 */
import type {
  LocalAssessScopeV1,
  LocalDecisionBriefV1,
  LocalRepoAssessResultV1,
} from '../../contracts/src/local-assess'
import {
  assertLocalProvenanceHonesty,
  validateLocalBriefTextInput,
} from '../../contracts/src/local-assess'
import { collectManifests } from './collect-manifests'
import { runDoctor } from './doctor'
import { assertStateOutsideTarget, saveLocalBrief } from './local-state'
import { verifyOperatorRuntime } from './runtime-identity'

export type AssessOptions = {
  targetPath: string
  intendedUse: string
  environment: LocalAssessScopeV1['environment']
  deploymentBoundary: LocalAssessScopeV1['deploymentBoundary']
  dryRun?: boolean
}

export function assessLocalRepository(
  opts: AssessOptions,
): LocalRepoAssessResultV1 {
  const use = validateLocalBriefTextInput('intendedUse', opts.intendedUse)
  if (!use.ok) {
    return { ok: false, code: use.code, error: use.error }
  }

  const doctor = runDoctor()
  if (!doctor.runtimeOk) {
    return {
      ok: false,
      code:
        doctor.capability === 'signature_invalid'
          ? 'signature_invalid'
          : 'runtime_unavailable',
      error: doctor.runtime.ok
        ? 'Runtime not verified'
        : doctor.runtime.error,
    }
  }

  const runtime = verifyOperatorRuntime()
  if (!runtime.ok) {
    return {
      ok: false,
      code: runtime.code,
      error: runtime.error,
    }
  }

  if (doctor.capability === 'signature_invalid') {
    return {
      ok: false,
      code: 'signature_invalid',
      error: 'Operator integrity signature invalid; assess blocked',
    }
  }

  let collected
  try {
    collected = collectManifests(opts.targetPath)
  } catch (e) {
    const err = e as Error & { code?: string }
    return {
      ok: false,
      code: err.code || 'collect_failed',
      error: err.message,
    }
  }

  const stateCheck = assertStateOutsideTarget(collected.sandbox.rootReal)
  if (!stateCheck.ok) {
    return { ok: false, code: stateCheck.code, error: stateCheck.error }
  }

  const synthesis = 'deterministic_only' as const
  const synthesisNote =
    'Runtime verified · synthesis unavailable · deterministic assess ready. Model synthesis: not used.'

  const provenance = {
    runtime: runtime.provenance,
    baseModel: null,
    adapter: null,
    tacticPack: null,
    policyPack: null,
  }

  const honesty = assertLocalProvenanceHonesty(
    'synthesis_unavailable',
    synthesis,
    provenance,
  )
  if (!honesty.ok) {
    return { ok: false, code: honesty.code, error: honesty.error }
  }

  const scope: LocalAssessScopeV1 = {
    intendedUse: use.value,
    environment: opts.environment,
    deploymentBoundary: opts.deploymentBoundary,
  }

  const assessedAt = new Date().toISOString()
  const briefCore = {
    contractVersion: '1' as const,
    kind: 'local_decision_brief' as const,
    durable: false as const,
    persistence: 'local_only' as const,
    shareability: 'never_automatic' as const,
    visibility: 'local_only' as const,
    label: 'LIVE' as const,
    decisionStatus: 'not_reviewed' as const,
    repository: {
      displayName: collected.displayName,
      rootLabel: '.' as const,
      manifestFingerprint: collected.manifestFingerprint,
      primaryLanguage: collected.primaryLanguage,
      packageName: collected.packageName,
      packageVersion: collected.packageVersion,
      licenseSpdx: collected.licenseSpdx,
    },
    scope,
    observed: collected.observed,
    unknowns: collected.unknowns,
    evidenceGaps: collected.evidenceGaps,
    reReviewTriggers: collected.reReviewTriggers,
    policyHints: [
      `Intended use (stated): ${scope.intendedUse}`,
      `Environment: ${scope.environment}`,
      `Deployment boundary: ${scope.deploymentBoundary}`,
      'Policy hints are non-authoritative — not an approval or Decision Graph write.',
      'Human decision required before treating this as production permission.',
    ],
    disclaimers: [
      'Local private assessment only. Never automatically shareable.',
      'No customer data uploaded. No hub persistence in free Operator path.',
      'Not a pentest, SCA certification, or vulnerability claim from model narrative.',
      'Model synthesis was not used (synthesis_unavailable).',
    ],
    provenance,
    capability: 'synthesis_unavailable' as const,
    synthesis,
    synthesisNote,
    assessedAt,
  }

  const brief: LocalDecisionBriefV1 = {
    ...briefCore,
    draftJson: JSON.stringify(briefCore, null, 2),
  }

  if (!opts.dryRun) {
    saveLocalBrief(collected.manifestFingerprint, brief)
  }

  return { ok: true, brief }
}

export function formatBriefSummary(brief: LocalDecisionBriefV1): string {
  const nObs = brief.observed.length
  const nGaps = brief.evidenceGaps.length
  return [
    'Local Decision Brief',
    `  ${brief.repository.displayName} · ${brief.visibility} · ${brief.shareability}`,
    `  ${nObs} observed facts · ${nGaps} evidence gaps · ${brief.decisionStatus.replace(/_/g, ' ')}`,
    `  Model synthesis: not used (${brief.capability})`,
    `  Persistence: ${brief.persistence} · durable: ${brief.durable}`,
    `  Next: inspect gaps or connect local MCP (stdio)`,
  ].join('\n')
}
