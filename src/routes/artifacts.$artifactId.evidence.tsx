import { createFileRoute, Link } from '@tanstack/react-router'
import { getArtifactProfile } from '#/lib/activity-api'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/artifacts/$artifactId/evidence')({
  loader: ({ params }) =>
    getArtifactProfile({ data: { artifactId: params.artifactId } }),
  component: ArtifactEvidencePage,
})

function ArtifactEvidencePage() {
  const data = Route.useLoaderData()
  if (!data.ok) {
    return (
      <div className="ops-panel p-6 text-sm text-white">
        Artifact not found.
      </div>
    )
  }
  const { profile, evidence } = data
  const a = profile.artifact

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Artifact · evidence</div>
          <h1 className="mt-1 text-xl font-semibold text-white">{a.name}</h1>
          <p className="mt-1 max-w-xl text-[11px] text-[var(--securist-muted)]">
            Append-only evidence records. LLM summaries are never treated as
            verified by themselves. Framework hints are not compliance claims.
          </p>
        </div>
        <div className="flex gap-2">
          <CopyPage title={`Evidence · ${a.name}`} />
          <Link
            to="/artifacts/$artifactId"
            params={{ artifactId: a.id }}
            className="ops-btn no-underline"
          >
            Profile
          </Link>
        </div>
      </header>

      <ul className="ops-panel divide-y divide-[var(--securist-border)] overflow-hidden p-0">
        {evidence.map((e) => (
          <li key={e.id} className="px-3 py-3 text-[12px]">
            <div className="flex flex-wrap gap-2">
              <span className="ops-chip">{e.domain}</span>
              <span className="ops-chip">{e.verification}</span>
              {e.isSeed ? <span className="ops-chip">SEED</span> : null}
              <span className="font-mono text-[10px] text-[var(--securist-muted)]">
                {e.contentHash}
              </span>
            </div>
            <p className="mt-1 text-white">{e.assertion}</p>
            <p className="mt-1 text-[10px] text-[var(--securist-muted)]">
              source {e.source} · {new Date(e.observedAt).toLocaleString()}
              {e.frameworkHint ? ` · hint: ${e.frameworkHint}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
