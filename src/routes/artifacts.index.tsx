import { createFileRoute, Link } from '@tanstack/react-router'
import { listArtifactProfiles } from '#/lib/activity-api'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/artifacts/')({
  loader: () => listArtifactProfiles(),
  component: ArtifactsIndexPage,
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

function ArtifactsIndexPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Decision Graph</div>
          <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase">
            Artifact Profiles
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] text-[var(--ftw-muted)]">
            Why an organization trusted a repository, model, dataset, or crypto
            component—and whether that decision is still valid. Seed rows are
            marked explicitly; they are not LIVE org telemetry.
          </p>
        </div>
        <CopyPage title="Artifact Profiles" />
      </header>

      <p className="text-[11px] text-[var(--ftw-muted)]">{data.note}</p>

      <section className="ops-panel overflow-hidden p-0">
        <div className="border-b border-[var(--ftw-border)] px-3 py-2 ops-label">
          Catalog · {data.artifacts.length}
        </div>
        <ul className="divide-y divide-[var(--ftw-border)]">
          {data.artifacts.map((a) => (
            <li key={a.id} className="px-3 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  to="/artifacts/$artifactId"
                  params={{ artifactId: a.id }}
                  className="text-[14px] text-white no-underline hover:text-[var(--ftw-accent)]"
                >
                  {a.name}
                </Link>
                <span className="ops-chip">
                  {STATUS_LABEL[a.status] || a.status}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[var(--ftw-muted)]">
                {a.purpose}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-[var(--ftw-muted)]">
                <span className="ops-chip">{a.kind}</span>
                {a.isSeed ? (
                  <span className="ops-chip">SEED</span>
                ) : (
                  <span className="ops-chip ops-chip-live">tracked</span>
                )}
                {a.domains.map((d) => (
                  <span key={d} className="ops-chip">
                    {d}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Link to="/tools" className="ops-btn no-underline">
          Packages
        </Link>
        <Link to="/models" className="ops-btn no-underline">
          Models
        </Link>
        <Link to="/activity" className="ops-btn no-underline">
          Activity
        </Link>
      </div>
    </div>
  )
}
