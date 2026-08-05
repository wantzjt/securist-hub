import { createServerFn } from '@tanstack/react-start'
import { getFlywheelPulse } from './pulse-core'
import { runHfScout } from './hf-scout'
import { BRAND, GH_PACKAGES } from './brand'
import { CURATED_HF, HF_QUERY_PACKS } from './hf-catalog'
import { TOOLS } from './tools'
import { recordLedger, listLedger } from './site-ledger'
import { findLink, SHORT_LINKS } from './links'
import { REPOS } from './packages'
import { warmConsoleBoot } from './boot'
import { USE_CASES } from './use-cases'
import {
  getDecisionGraphStore,
  evaluatePolicy,
  ingestDaemonEvent,
  runE2ELifecycleFixture,
} from './decision-graph'
import type { DaemonIngestPayload } from './decision-graph'
import {
  submitCandidateEvidence,
  submitValidationPlan,
  submitContributionProposal,
  submitValidationSummary,
  listWorkflowState,
  runVerticalSliceDemo,
} from './eve-gateway/gateway'
import type {
  CandidateEvidenceV1,
  ValidationPlanV1,
  ContributionProposalV1,
  SignedValidationSummaryV1,
} from './eve-gateway/types'

function serverToken(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined
}

export const getActivity = createServerFn({ method: 'GET' }).handler(
  async () => {
    const pulse = await getFlywheelPulse({ token: serverToken() })
    const store = getDecisionGraphStore()
    const decisionActivity = store
      .listActivity({ publicOnly: true })
      .map((a) => ({
        id: a.id,
        source: a.isSeed ? 'seed' : a.source,
        stage: a.verification,
        title: a.whatHappened,
        detail: `${a.whyItMatters} · Action: ${a.securistAction}${a.isSeed ? ' · [SEED]' : ''}`,
        repo: a.artifactId,
        createdAt: a.occurredAt,
        verification: a.verification,
        isSeed: a.isSeed,
        whyItMatters: a.whyItMatters,
        securistAction: a.securistAction,
      }))
    const flywheelEvents = pulse.events.map((e) => ({
      ...e,
      verification: e.source === 'seed' ? 'seed' : 'observed',
      isSeed: e.source === 'seed',
      whyItMatters:
        e.source === 'seed'
          ? 'Seed/curated catalog signal — not LIVE org telemetry.'
          : 'Merged public scout/org pulse.',
      securistAction: 'Open related package, model, or Artifact Profile.',
    }))
    const events = [...decisionActivity, ...flywheelEvents].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )
    const sourceCards = [
      ...pulse.sources,
      {
        id: 'decision_graph',
        label: 'Decision Graph',
        status: 'seed' as const,
        count: store.listArtifacts().length,
        detail: 'Artifact profiles · policy · evidence (seed until Postgres)',
      },
      {
        id: 'operator',
        label: 'Operator',
        status: 'seed' as const,
        count: store
          .listActivity()
          .filter((a) => a.source === 'operator' && !a.isSeed).length,
        detail: 'Authenticated ingest only · organization visibility',
      },
    ]
    return {
      mode: pulse.mode,
      live: pulse.mode !== 'SEED',
      sourceCards,
      sources: sourceCards.map((s) => s.id),
      events,
      classification: pulse.classification,
      stack: pulse.stack,
      fetchedAt: pulse.fetchedAt,
      decisionNote:
        'Decision Graph events marked [SEED] are demo data. Operator ingest never appears on the public stream.',
    }
  },
)

export const getPulse = createServerFn({ method: 'GET' }).handler(async () => {
  const pulse = await getFlywheelPulse({ token: serverToken() })
  return {
    events: pulse.events.slice(0, 8),
    live: pulse.mode !== 'SEED',
    mode: pulse.mode,
    sourceCards: pulse.sources,
    classification: pulse.classification,
    stack: pulse.stack,
    fetchedAt: pulse.fetchedAt,
  }
})

export const getHfScout = createServerFn({ method: 'GET' })
  .validator((data: { packId?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    return runHfScout(data.packId)
  })

export const getModelsPage = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Auto-scout on load (no human Run CTA)
    const scout = await runHfScout('cti-ner')
    return {
      scout,
      packs: HF_QUERY_PACKS,
      curated: CURATED_HF,
      brand: {
        productHouse: BRAND.productHouse,
        hfOrg: BRAND.hfOrg,
        hfUrl: BRAND.hfUrl,
        githubOrg: BRAND.githubOrg,
        doctrine: BRAND.doctrine,
      },
    }
  },
)

export const getDaemonPage = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Auto inventory warm
    const pulse = await getFlywheelPulse({ token: serverToken() })
    return {
      packages: GH_PACKAGES,
      tools: TOOLS.filter((t) => t.lane === 'github' || t.lane === 'bridge'),
      brand: {
        productHouse: BRAND.productHouse,
        githubOrg: BRAND.githubOrg,
        doctrine: BRAND.doctrine,
      },
      pulseSlice: pulse.events
        .filter(
          (e) =>
            e.source === 'org' ||
            e.source === 'gh_scout' ||
            e.source === 'package',
        )
        .slice(0, 12),
      pulseMode: pulse.mode,
    }
  },
)

export const getHomeData = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Zero-human open: warm ledger + scouts + activity merge
    const boot = await warmConsoleBoot(serverToken())
    const pulse = boot.pulse
    return {
      pulse: {
        events: pulse.events.slice(0, 10),
        live: pulse.mode !== 'SEED',
        mode: pulse.mode,
        sourceCards: pulse.sources,
        classification: pulse.classification,
        stack: pulse.stack,
        fetchedAt: pulse.fetchedAt,
      },
      tools: TOOLS,
      packages: REPOS,
      curated: CURATED_HF,
      cases: USE_CASES,
      doctrine: BRAND.doctrine,
      tagline: BRAND.tagline,
      productHouse: BRAND.productHouse,
      productHub: BRAND.productHub,
      githubOrg: BRAND.githubOrg,
      hfOrg: BRAND.hfOrg,
      hfUrl: BRAND.hfUrl,
      classification: pulse.classification,
      stack: pulse.stack,
      boot: {
        throttled: boot.throttled,
        bootedAt: boot.bootedAt,
        hfMode: boot.hf.mode,
        hfHits: boot.hf.hits.length,
      },
    }
  },
)

export const getLinksPage = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      links: SHORT_LINKS,
      ledger: listLedger(15),
      repos: REPOS.map((r) => r.id),
    }
  },
)

export const hitShortLink = createServerFn({ method: 'POST' })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const link = findLink(data.token)
    if (!link) {
      return { ok: false as const, error: 'unknown_or_reserved' }
    }
    recordLedger(
      'redirect_hit',
      `/${link.token}`,
      `→ ${link.target} · ${link.label}`,
    )
    recordLedger('access_event', `/${link.token}`, 'field proof tick')
    return { ok: true as const, target: link.target, token: link.token }
  })

/* —— Decision Graph —— */

export const listArtifactProfiles = createServerFn({ method: 'GET' }).handler(
  async () => {
    const store = getDecisionGraphStore()
    return {
      artifacts: store.listArtifacts(),
      note: 'Seed profiles are explicitly isSeed; never treat as LIVE org telemetry.',
    }
  },
)

export const getArtifactProfile = createServerFn({ method: 'GET' })
  .validator((data: { artifactId: string }) => data)
  .handler(async ({ data }) => {
    const store = getDecisionGraphStore()
    const profile = store.getProfile(data.artifactId)
    if (!profile) return { ok: false as const, error: 'not_found' }
    const evidence = store.listEvidence(data.artifactId)
    const evaluations = store.listEvaluations(data.artifactId)
    const snap = store.getSnapshot()
    const changes = snap.changes.filter((c) => c.artifactId === data.artifactId)
    const validations = snap.validations.filter(
      (v) => v.artifactId === data.artifactId,
    )
    const contributions = snap.contributions.filter(
      (c) => c.artifactId === data.artifactId,
    )
    return {
      ok: true as const,
      profile,
      evidence,
      evaluations,
      changes,
      validations,
      contributions,
    }
  })

export const runPolicyDemo = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      artifactId: string
      environment?: 'research' | 'development' | 'staging' | 'production'
      dataClassification?: 'public' | 'internal' | 'restricted'
      deploymentBoundary?:
        'local_only' | 'controlled_cloud' | 'external_service'
    }) => data,
  )
  .handler(async ({ data }) => {
    const store = getDecisionGraphStore()
    const artifact = store.getArtifact(data.artifactId)
    if (!artifact) return { ok: false as const, error: 'not_found' }
    const evidence = store.listEvidence(data.artifactId)
    const evaluation = evaluatePolicy({
      artifact,
      evidence,
      tenantId: artifact.tenantId,
      environment: data.environment || 'development',
      dataClassification: data.dataClassification || 'public',
      deploymentBoundary: data.deploymentBoundary || 'local_only',
      intendedUse: artifact.purpose.slice(0, 160),
    })
    return { ok: true as const, evaluation }
  })

export const postDaemonIngest = createServerFn({ method: 'POST' })
  .validator((data: DaemonIngestPayload) => data)
  .handler(async ({ data }) => {
    return ingestDaemonEvent(data)
  })

/* —— Eve gateway (propose only) —— */

export const submitEveCandidateEvidence = createServerFn({ method: 'POST' })
  .validator((data: CandidateEvidenceV1) => data)
  .handler(async ({ data }) => submitCandidateEvidence(data))

export const submitEveValidationPlan = createServerFn({ method: 'POST' })
  .validator((data: ValidationPlanV1) => data)
  .handler(async ({ data }) => submitValidationPlan(data))

export const submitEveContributionProposal = createServerFn({ method: 'POST' })
  .validator((data: ContributionProposalV1) => data)
  .handler(async ({ data }) => submitContributionProposal(data))

export const submitLocalValidationSummary = createServerFn({ method: 'POST' })
  .validator((data: SignedValidationSummaryV1) => data)
  .handler(async ({ data }) => submitValidationSummary(data))

export const getEveWorkflowState = createServerFn({ method: 'GET' }).handler(
  async () => listWorkflowState(),
)

/** Deterministic demo of the safe vertical slice (no live Eve process). */
export const runEveVerticalSliceDemo = createServerFn({ method: 'POST' })
  .validator((data: { artifactId?: string } | undefined) => data ?? {})
  .handler(async ({ data }) =>
    runVerticalSliceDemo(data.artifactId || 'art-scout-daemon'),
  )

/** Prove operating contract: artifact→…→review_required→Activity */
export const runLifecycleFixture = createServerFn({ method: 'GET' }).handler(
  async () => runE2ELifecycleFixture(),
)
