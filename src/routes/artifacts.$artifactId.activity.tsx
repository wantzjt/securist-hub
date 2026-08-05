import { createFileRoute, Link } from '@tanstack/react-router'
import { getArtifactProfile } from '#/lib/activity-api'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/artifacts/$artifactId/activity')({
  loader: ({ params }) =>
    getArtifactProfile({ data: { artifactId: params.artifactId } }),
  component: ArtifactActivityPage,
})

function ArtifactActivityPage() {
  const data = Route.useLoaderData()
  if (!data.ok) {
    return (
      <div className="ops-panel p-6 text-sm text-white">Artifact not found.</div>
    )
  }
  const { profile, changes } = data
  const a = profile.artifact

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Artifact · activity</div>
          <h1 className="mt-1 text-xl font-semibold text-white">{a.name}</h1>
          <p className="mt-1 text-[11px] text-[var(--ftw-muted)]">
            Material-change timeline — not a social feed.
          </p>
        </div>
        <div className="flex gap-2">
          <CopyPage title={`Activity · ${a.name}`} />
          <Link
            to="/artifacts/$artifactId"
            params={{ artifactId: a.id }}
            className="ops-btn no-underline"
          >
            Profile
          </Link>
        </div>
      </header>

      <ul className="ops-panel divide-y divide-[var(--ftw-border)] overflow-hidden p-0">
        {changes.length === 0 ? (
          <li className="px-3 py-4 text-[12px] text-[var(--ftw-muted)]">
            No change events yet.
          </li>
        ) : (
          changes.map((c) => (
            <li key={c.id} className="px-3 py-3">
              <div className="text-[13px] text-white">{c.whatHappened}</div>
              <p className="mt-0.5 text-[11px] text-[var(--ftw-muted)]">
                {c.whyItMatters}
              </p>
              <p className="mt-1 text-[11px] text-[var(--ftw-accent)]">
                {c.securistAction}
              </p>
              <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-[var(--ftw-muted)]">
                <span className="ops-chip">{c.verification}</span>
                {c.isSeed ? <span className="ops-chip">SEED</span> : null}
                <time>{new Date(c.occurredAt).toLocaleString()}</time>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
