/**
 * Seed / demo Decision Graph data — always marked isSeed / verification seed.
 * Never render as LIVE org signal.
 */
import { contentHash } from './hash'
import { evaluatePolicy } from './policy'
import type { Artifact, DecisionGraphSnapshot, DecisionStatus } from './types'

const TENANT = 'public-demo'
const now = () => new Date().toISOString()
const days = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

export function buildSeedSnapshot(): DecisionGraphSnapshot {
  const artifacts: Artifact[] = [
    {
      id: 'art-scout-daemon',
      tenantId: TENANT,
      kind: 'package',
      name: 'scout-daemon',
      purpose:
        'Security engineers use GH Scout to inventory public packages and surface legal-risk tags without bulk-forking the internet.',
      recommendedBoundary:
        'Public repositories only; rate-limited; operator-owned GitHub credentials.',
      domains: ['supply_chain', 'appsec'],
      canonicalUrl: 'https://github.com/Securist-InfoSec/scout-daemon',
      provider: 'github',
      status: 'watching',
      reviewOwner: 'Securist operators',
      nextReviewAt: days(45),
      isSeed: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'art-securebert',
      tenantId: TENANT,
      kind: 'model',
      name: 'SecureBERT (curated reference)',
      purpose:
        'CTI and security-language research teams evaluate domain-adapted language models under explicit license and model-card limits.',
      recommendedBoundary:
        'Research/dev; local or controlled pull; no rehost of weights; honor upstream license.',
      domains: ['ai_security', 'cti'],
      canonicalUrl: 'https://huggingface.co/ehsanaghaei/SecureBERT',
      provider: 'huggingface',
      status: 'not_reviewed',
      reviewOwner: 'Model governance',
      nextReviewAt: days(30),
      isSeed: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'art-geolite2-bridge',
      tenantId: TENANT,
      kind: 'package',
      name: 'geolite2-bridge',
      purpose:
        'Operators attach city/ASN GeoIP honestly (MaxMind GeoLite2) without claiming household-level precision or compliance theater.',
      recommendedBoundary:
        'Authorized local databases; MaxMind license honesty; no unauthorized scanning.',
      domains: ['cloud', 'appsec'],
      canonicalUrl: 'https://github.com/Securist-InfoSec/geolite2-bridge',
      provider: 'github',
      status: 'conditional',
      reviewOwner: 'Geo/platform',
      nextReviewAt: days(60),
      isSeed: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'art-pq-inventory',
      tenantId: TENANT,
      kind: 'crypto_component',
      name: 'TLS/crypto inventory placeholder',
      purpose:
        'Platform teams track algorithms and migration implications for crypto-agility—not fear marketing.',
      recommendedBoundary:
        'Internal inventory; map to migration plan; no quantum-safe product claims without evidence.',
      domains: ['post_quantum', 'cloud'],
      canonicalUrl: 'https://secur.ist/use-cases',
      provider: 'manual',
      status: 'watching',
      reviewOwner: 'Crypto agility',
      nextReviewAt: days(14),
      isSeed: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ]

  const versions = artifacts.map((a, i) => ({
    id: `ver-${a.id}`,
    artifactId: a.id,
    versionLabel: i === 1 ? 'upstream-hub' : 'main',
    commitOrDigest: undefined as string | undefined,
    isSeed: true,
  }))

  const sources: DecisionGraphSnapshot['sources'] = artifacts.map((a) => ({
    id: `src-${a.id}`,
    artifactId: a.id,
    sourceType:
      a.provider === 'huggingface'
        ? 'huggingface'
        : a.provider === 'github'
          ? 'github'
          : 'manual',
    url: a.canonicalUrl,
    lastSnapshotAt: now(),
  }))

  const evidence = [
    {
      id: 'ev-scout-license',
      tenantId: TENANT,
      artifactId: 'art-scout-daemon',
      domain: 'license' as const,
      assertion: 'MIT license observed on public repository (seed catalog).',
      source: 'seed:packages.ts',
      observedAt: now(),
      verification: 'seed' as const,
      contentHash: contentHash('scout-daemon-mit'),
      isSeed: true,
    },
    {
      id: 'ev-scout-prov',
      tenantId: TENANT,
      artifactId: 'art-scout-daemon',
      domain: 'provenance' as const,
      assertion: 'Public GitHub path Securist-InfoSec/scout-daemon (seed).',
      source: 'seed:packages.ts',
      observedAt: now(),
      verification: 'seed' as const,
      contentHash: contentHash('scout-daemon-path'),
      isSeed: true,
    },
    {
      id: 'ev-geo-license',
      tenantId: TENANT,
      artifactId: 'art-geolite2-bridge',
      domain: 'license' as const,
      assertion:
        'Bridge package is open-source; GeoLite2 data remains under MaxMind terms (seed).',
      source: 'seed:packages.ts',
      observedAt: now(),
      verification: 'seed' as const,
      contentHash: contentHash('geo-maxmind'),
      frameworkHint: 'MaxMind GeoLite2 license',
      isSeed: true,
    },
    {
      id: 'ev-geo-prov',
      tenantId: TENANT,
      artifactId: 'art-geolite2-bridge',
      domain: 'provenance' as const,
      assertion:
        'Operator-controlled local DB path; no household-level claim (seed).',
      source: 'seed:packages.ts',
      observedAt: now(),
      verification: 'seed' as const,
      contentHash: contentHash('geo-local'),
      isSeed: true,
    },
    {
      id: 'ev-model-card-gap',
      tenantId: TENANT,
      artifactId: 'art-securebert',
      domain: 'model_governance' as const,
      assertion:
        'Model-card review not completed in Securist (seed — not verified).',
      source: 'seed:hf-catalog',
      observedAt: now(),
      verification: 'seed' as const,
      contentHash: contentHash('securebert-card-gap'),
      isSeed: true,
    },
    {
      id: 'ev-pq-gap',
      tenantId: TENANT,
      artifactId: 'art-pq-inventory',
      domain: 'crypto_agility' as const,
      assertion:
        'Crypto inventory incomplete; migration implication not yet recorded (seed).',
      source: 'seed:use-cases',
      observedAt: now(),
      verification: 'seed' as const,
      contentHash: contentHash('pq-gap'),
      isSeed: true,
    },
  ]

  const policies = [
    {
      id: 'securist-baseline',
      version: '1.0.0',
      name: 'Securist baseline',
      description:
        'Deterministic license, provenance, model-governance, security, and crypto-agility gates.',
      isSeed: true,
    },
  ]

  const evaluations = artifacts.map((artifact) => {
    const evaluation = evaluatePolicy({
      artifact,
      evidence: evidence.filter((e) => e.artifactId === artifact.id),
      tenantId: TENANT,
      environment: artifact.kind === 'model' ? 'research' : 'development',
      dataClassification: 'public',
      deploymentBoundary:
        artifact.kind === 'model' ? 'local_only' : 'controlled_cloud',
      intendedUse: artifact.purpose.slice(0, 120),
    })
    evaluation.isSeed = true
    return evaluation
  })

  const statusMap: Record<string, DecisionStatus> = {
    approve: 'approved',
    conditional: 'conditional',
    review_required: 'review_required',
    deny: 'paused',
  }

  const decisions = evaluations.map((ev, i) => {
    const art = artifacts[i]
    return {
      id: `dec-${art.id}`,
      tenantId: TENANT,
      artifactId: art.id,
      status: statusMap[ev.verdict],
      summary: ev.explanation,
      riskPlain:
        ev.verdict === 'approve'
          ? 'Residual risk is within baseline seed demo scope; re-check on material change.'
          : 'Open evidence or boundary gaps; do not treat seed status as production approval.',
      actionPlain:
        ev.verdict === 'approve'
          ? 'Continue watchlist monitoring and schedule next review.'
          : 'Complete missing evidence and re-run baseline policy before expanding use.',
      evaluationId: ev.id,
      decidedAt: now(),
      decidedBy: 'seed-policy-engine',
      expiresAt: art.nextReviewAt,
      isSeed: true,
    }
  })

  for (const d of decisions) {
    const a = artifacts.find((x) => x.id === d.artifactId)
    if (a) a.status = d.status
  }

  const changes = [
    {
      id: 'chg-seed-graph-online',
      tenantId: TENANT,
      artifactId: 'art-scout-daemon',
      changeType: 'decision_graph_seed',
      whatHappened: 'Decision Graph seed catalog loaded (explicitly seed).',
      whyItMatters:
        'Operators can demo artifact → evidence → policy → decision without claiming LIVE org telemetry.',
      securistAction:
        'Review seed profiles; replace with observed evidence when ready.',
      verification: 'seed' as const,
      visibility: 'public' as const,
      occurredAt: now(),
      isSeed: true,
    },
  ]

  const activity = [
    {
      id: 'act-seed-graph',
      tenantId: TENANT,
      source: 'decision_graph',
      verification: 'seed' as const,
      artifactId: 'art-scout-daemon',
      whatHappened:
        'Seed Decision Graph online with four demo Artifact Profiles.',
      whyItMatters:
        'Shows how Securist records why an artifact is trusted—without fake LIVE signals.',
      securistAction: 'Open /artifacts and inspect decision briefs.',
      visibility: 'public' as const,
      occurredAt: now(),
      isSeed: true,
    },
    {
      id: 'act-seed-policy-securebert',
      tenantId: TENANT,
      source: 'policy',
      verification: 'seed' as const,
      artifactId: 'art-securebert',
      whatHappened:
        'Baseline policy requires review for SecureBERT seed profile.',
      whyItMatters:
        'Missing model-governance evidence blocks production-style approval.',
      securistAction:
        'Attach model-card limits and re-evaluate under research boundary.',
      visibility: 'public' as const,
      occurredAt: now(),
      isSeed: true,
    },
  ]

  const validations = [
    {
      id: 'val-seed-local',
      tenantId: TENANT,
      artifactId: 'art-scout-daemon',
      operatorId: 'op-seed',
      runtime: 'local-deterministic',
      toolVersions: { node: 'seed', policy: '1.0.0' },
      resultSummary:
        'Seed validation placeholder — not a proof of global security (seed).',
      dataClassification: 'public' as const,
      boundary: 'local_only' as const,
      ranAt: now(),
      isSeed: true,
    },
  ]

  const contributions: DecisionGraphSnapshot['contributions'] = []

  const operators = [
    {
      id: 'op-seed',
      tenantId: TENANT,
      label: 'Seed operator (demo)',
      publicOnly: true,
      createdAt: now(),
    },
  ]

  return {
    artifacts,
    versions,
    sources,
    evidence,
    policies,
    evaluations,
    decisions,
    validations,
    contributions,
    changes,
    activity,
    operators,
  }
}
