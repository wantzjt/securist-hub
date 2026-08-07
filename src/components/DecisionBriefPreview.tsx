import { Link } from '@tanstack/react-router'
import { SAMPLE_BRIEF_PREVIEW } from '#/lib/product-surface'

/**
 * Homepage Decision Brief illustration (WO-017).
 * Static seed-shaped preview — never claims approval or live scan results.
 */
export function DecisionBriefPreview() {
  const b = SAMPLE_BRIEF_PREVIEW

  return (
    <section
      className="ops-panel overflow-hidden"
      aria-labelledby="brief-preview-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--securist-border)] bg-black/25 px-4 py-3 sm:px-5">
        <div>
          <div className="ops-label">Decision Brief · format proof</div>
          <h2
            id="brief-preview-heading"
            className="mt-1 text-base font-semibold tracking-[0.06em] text-white sm:text-lg"
          >
            {b.artifactName}
          </h2>
          <p className="mt-1 text-[11px] text-[var(--securist-muted)]">
            Status:{' '}
            <span className="ops-accent">{b.decisionStatusLabel}</span>
            {' · '}
            <span className="ops-chip">{b.label}</span>
            {' · '}
            Not an approval
          </p>
        </div>
        <Link
          to="/artifacts/$artifactId"
          params={{ artifactId: b.artifactId }}
          className="ops-btn no-underline"
        >
          Open full sample
        </Link>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="space-y-3 border-b border-[var(--securist-border)] p-4 sm:p-5 lg:border-r lg:border-b-0">
          <div className="ops-label">Scope (stated)</div>
          <dl className="space-y-2 text-[12px]">
            <div>
              <dt className="ops-label">Intended use</dt>
              <dd className="mt-0.5 text-[var(--securist-muted)]">
                {b.scope.intendedUse}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <dt className="ops-label">Environment</dt>
                <dd className="mt-0.5 text-[var(--securist-muted)]">
                  {b.scope.environment}
                </dd>
              </div>
              <div>
                <dt className="ops-label">Boundary</dt>
                <dd className="mt-0.5 text-[var(--securist-muted)]">
                  {b.scope.deploymentBoundary}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div className="ops-label">Observed facts</div>
          <ul className="space-y-2">
            {b.observed.map((o) => (
              <li
                key={o.domain}
                className="border-l-2 border-[var(--securist-accent)] pl-2 text-[12px]"
              >
                <span className="ops-chip ops-chip-live">{o.domain}</span>
                <p className="mt-1 text-[var(--securist-muted)]">{o.assertion}</p>
              </li>
            ))}
          </ul>
          <div className="ops-label pt-1">Evidence gaps</div>
          <div className="flex flex-wrap gap-1.5">
            {b.evidenceGaps.map((g) => (
              <span key={g} className="ops-chip">
                {g} · gap
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="border-t border-[var(--securist-border)] px-4 py-3 text-[11px] leading-relaxed text-[var(--securist-muted)] sm:px-5">
        {b.disclaimer} Not a vulnerability scan, pentest, or autonomous agent.
      </p>
    </section>
  )
}
