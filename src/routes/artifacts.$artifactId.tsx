import { createFileRoute, Link } from '@tanstack/react-router'
import { getArtifactProfile } from '#/lib/activity-api'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/artifacts/$artifactId')({
  loader: ({ params }) =>
    getArtifactProfile({ data: { artifactId: params.artifactId } }),
  component: ArtifactProfilePage,
})

const STATUS_LABEL: Record<string, string> = {
  not_reviewed: 'Not reviewed',
  watching: 'Watching',
  conditional: 'Conditional',
  conditionally_approved: 'Conditional',
  approved: 'Approved',
  review_required: 'Review required',
  paused: 'Paused',
  retired: 'Retired',
}

const VERDICT_LABEL: Record<string, string> = {
  approve: 'Approve',
  conditional: 'Conditional',
  review_required: 'Review required',
  deny: 'Deny',
}

const COVERAGE_LABEL: Record<string, string> = {
  provenance: 'Provenance',
  license: 'License',
  security: 'Security',
  model_governance: 'Model / use limits',
  crypto_agility: 'Crypto-agility',
}

function ArtifactProfilePage() {
  const data = Route.useLoaderData()
  if (!data.ok) {
    return (
      <div className="ops-panel p-6">
        <p className="text-sm text-white">Artifact not found.</p>
        <Link to="/artifacts" className="ops-btn mt-3 inline-block no-underline">
          All profiles
        </Link>
      </div>
    )
  }

  const { profile, evidence, evaluations, changes, validations } = data
  const a = profile.artifact
  const d = profile.decision
  const ev = profile.latestEvaluation

  const copyBody = [
    `Status: ${STATUS_LABEL[a.status] || a.status}`,
    `Purpose: ${a.purpose}`,
    `Boundary: ${a.recommendedBoundary}`,
    d ? `Risk: ${d.riskPlain}` : '',
    d ? `Action: ${d.actionPlain}` : '',
    a.isSeed ? 'SEED demo profile — not production approval.' : '',
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Artifact Profile</div>
          <h1 className="mt-1 text-xl font-semibold tracking-[0.06em] text-white">
            {a.name}
          </h1>
          <p className="mt-1 text-[11px] text-[var(--ftw-muted)]">
            {a.kind} · {a.provider} ·{' '}
            {a.isSeed ? (
              <span className="ops-accent">SEED</span>
            ) : (
              'tracked'
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyPage title={`Artifact · ${a.name}`} body={copyBody} />
          <Link
            to="/artifacts/$artifactId/activity"
            params={{ artifactId: a.id }}
            className="ops-btn no-underline"
          >
            Activity
          </Link>
          <Link
            to="/artifacts/$artifactId/evidence"
            params={{ artifactId: a.id }}
            className="ops-btn no-underline"
          >
            Evidence
          </Link>
        </div>
      </header>

      {/* 1. Decision at a glance */}
      <section className="ops-panel space-y-3 p-4">
        <div className="ops-label">Decision at a glance</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="ops-chip ops-chip-live">
            {STATUS_LABEL[a.status] || a.status}
          </span>
          {ev ? (
            <span className="ops-chip">
              Policy: {VERDICT_LABEL[ev.verdict] || ev.verdict}
            </span>
          ) : null}
        </div>
        <p className="text-[13px] leading-relaxed text-white">{a.purpose}</p>
        <dl className="grid gap-2 text-[12px] sm:grid-cols-2">
          <div>
            <dt className="ops-label">Recommended use boundary</dt>
            <dd className="mt-0.5 text-[var(--ftw-muted)]">
              {a.recommendedBoundary}
            </dd>
          </div>
          <div>
            <dt className="ops-label">What changed since approval</dt>
            <dd className="mt-0.5 text-[var(--ftw-muted)]">
              {profile.whatChangedSinceApproval}
            </dd>
          </div>
          <div>
            <dt className="ops-label">Review owner</dt>
            <dd className="mt-0.5 text-[var(--ftw-muted)]">{a.reviewOwner}</dd>
          </div>
          <div>
            <dt className="ops-label">Next review</dt>
            <dd className="mt-0.5 text-[var(--ftw-muted)]">
              {a.nextReviewAt || '—'}
            </dd>
          </div>
        </dl>
        <div>
          <div className="ops-label mb-1">Evidence coverage</div>
          <p className="mb-2 text-[10px] text-[var(--ftw-muted)]">
            Coverage chips show presence of domain evidence. Seed evidence does
            not imply compliance or verified production approval.
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(profile.evidenceCoverage).map(([k, covered]) => (
              <span
                key={k}
                className={`ops-chip ${covered ? 'ops-chip-live' : ''}`}
              >
                {COVERAGE_LABEL[k] || k}
                {covered ? '' : ' · gap'}
              </span>
            ))}
          </div>
        </div>
        {d ? (
          <div className="grid gap-2 border-t border-[var(--ftw-border)] pt-3 text-[12px] sm:grid-cols-2">
            <div>
              <div className="ops-label">Plain-language risk</div>
              <p className="mt-0.5 text-[var(--ftw-muted)]">{d.riskPlain}</p>
            </div>
            <div>
              <div className="ops-label">Securist action</div>
              <p className="mt-0.5 text-[var(--ftw-muted)]">{d.actionPlain}</p>
            </div>
          </div>
        ) : null}
      </section>

      {/* 2. Technical evidence and action */}
      <section className="ops-panel space-y-3 p-4">
        <div className="ops-label">Technical evidence & action</div>
        <dl className="grid gap-2 text-[12px] sm:grid-cols-2">
          <div>
            <dt className="ops-label">Canonical source</dt>
            <dd className="mt-0.5 break-all text-[var(--ftw-muted)]">
              <a
                href={a.canonicalUrl}
                className="ops-accent no-underline"
                rel="noreferrer"
                target="_blank"
              >
                {a.canonicalUrl}
              </a>
            </dd>
          </div>
          <div>
            <dt className="ops-label">Provider / kind</dt>
            <dd className="mt-0.5 text-[var(--ftw-muted)]">
              {a.provider} · {a.kind}
            </dd>
          </div>
        </dl>

        {ev ? (
          <div className="rounded-sm border border-[var(--ftw-border)] p-3">
            <div className="ops-label">
              Policy {ev.policyId} · v{ev.policyVersion} · {ev.verdict}
            </div>
            <p className="mt-1 text-[12px] text-white">{ev.explanation}</p>
            {ev.failingChecks.length > 0 ? (
              <ul className="mt-2 list-inside list-disc text-[11px] text-[var(--ftw-muted)]">
                {ev.failingChecks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : null}
            {ev.requiredMitigation.length > 0 ? (
              <div className="mt-2">
                <div className="ops-label">Required mitigation</div>
                <ul className="mt-1 list-inside list-disc text-[11px] text-[var(--ftw-muted)]">
                  {ev.requiredMitigation.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div>
          <div className="ops-label mb-1">
            Evidence records · {evidence.length}
          </div>
          <ul className="divide-y divide-[var(--ftw-border)] rounded-sm border border-[var(--ftw-border)]">
            {evidence.map((e) => (
              <li key={e.id} className="px-3 py-2 text-[11px]">
                <div className="flex flex-wrap gap-2">
                  <span className="ops-chip">{e.domain}</span>
                  <span className="ops-chip">{e.verification}</span>
                  {e.isSeed ? <span className="ops-chip">SEED</span> : null}
                </div>
                <p className="mt-1 text-[var(--ftw-muted)]">{e.assertion}</p>
              </li>
            ))}
          </ul>
        </div>

        {validations.length > 0 ? (
          <div>
            <div className="ops-label mb-1">Local validation (share-safe)</div>
            <ul className="space-y-2 text-[11px] text-[var(--ftw-muted)]">
              {validations.map((v) => (
                <li key={v.id} className="ops-panel p-2">
                  {v.resultSummary} · {v.runtime} · {v.boundary}
                  {v.isSeed ? ' · SEED' : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {changes.length > 0 ? (
          <div>
            <div className="ops-label mb-1">Material-change timeline</div>
            <ul className="space-y-2 text-[11px]">
              {changes.map((c) => (
                <li key={c.id} className="border-l-2 border-[var(--ftw-accent)] pl-2">
                  <div className="text-white">{c.whatHappened}</div>
                  <div className="text-[var(--ftw-muted)]">{c.whyItMatters}</div>
                  <div className="ops-accent">{c.securistAction}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 text-[11px]">
          <Link to="/tools" className="ops-btn no-underline">
            Packages
          </Link>
          <Link to="/daemon" className="ops-btn no-underline">
            Scout / operator
          </Link>
          <Link to="/artifacts" className="ops-btn no-underline">
            All profiles
          </Link>
        </div>
        {evaluations.length > 1 ? (
          <p className="text-[10px] text-[var(--ftw-muted)]">
            {evaluations.length} evaluations on record (latest shown).
          </p>
        ) : null}
      </section>
    </div>
  )
}
