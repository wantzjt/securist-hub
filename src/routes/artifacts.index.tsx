import { useMemo, useState } from 'react'
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
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [status, setStatus] = useState('all')
  const [domain, setDomain] = useState('all')

  const kinds = useMemo(
    () => [...new Set(data.artifacts.map((artifact) => artifact.kind))].sort(),
    [data.artifacts],
  )
  const statuses = useMemo(
    () =>
      [...new Set(data.artifacts.map((artifact) => artifact.status))].sort(),
    [data.artifacts],
  )
  const domains = useMemo(
    () =>
      [
        ...new Set(data.artifacts.flatMap((artifact) => artifact.domains)),
      ].sort(),
    [data.artifacts],
  )
  const artifacts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.artifacts.filter((artifact) => {
      if (kind !== 'all' && artifact.kind !== kind) return false
      if (status !== 'all' && artifact.status !== status) return false
      if (domain !== 'all' && !artifact.domains.includes(domain as never))
        return false
      if (!needle) return true
      return `${artifact.name} ${artifact.purpose} ${artifact.provider} ${artifact.domains.join(' ')}`
        .toLowerCase()
        .includes(needle)
    })
  }, [data.artifacts, domain, kind, query, status])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Decision Graph</div>
          <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase">
            Artifact Profiles
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] text-[var(--securist-muted)]">
            Why an organization trusted a repository, model, dataset, or crypto
            component—and whether that decision is still valid. Seed rows are
            marked explicitly; they are not LIVE org telemetry.
          </p>
        </div>
        <CopyPage title="Artifact Profiles" />
      </header>

      <p className="text-[11px] text-[var(--securist-muted)]">{data.note}</p>

      <section className="ops-panel space-y-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="ops-label">Decision filters</span>
          <span className="font-mono text-[11px] text-[var(--securist-accent)]">
            {artifacts.length} shown
          </span>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search purpose, provider, or domain…"
          className="w-full border border-[var(--securist-border)] bg-black/20 px-3 py-2 font-mono text-[12px] text-white outline-none focus:border-[var(--securist-accent)]"
          aria-label="Search artifact profiles"
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="ops-label space-y-1">
            <span>Artifact type</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              className="w-full border border-[var(--securist-border)] bg-[var(--securist-panel)] px-2 py-2 text-[11px] text-white"
            >
              <option value="all">All types</option>
              {kinds.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="ops-label space-y-1">
            <span>Decision</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full border border-[var(--securist-border)] bg-[var(--securist-panel)] px-2 py-2 text-[11px] text-white"
            >
              <option value="all">All decisions</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABEL[item] || item}
                </option>
              ))}
            </select>
          </label>
          <label className="ops-label space-y-1">
            <span>Security domain</span>
            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              className="w-full border border-[var(--securist-border)] bg-[var(--securist-panel)] px-2 py-2 text-[11px] text-white"
            >
              <option value="all">All domains</option>
              {domains.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="ops-panel overflow-hidden p-0">
        <div className="border-b border-[var(--securist-border)] px-3 py-2 ops-label">
          Catalog · {artifacts.length}
        </div>
        <ul className="divide-y divide-[var(--securist-border)]">
          {artifacts.map((a) => (
            <li key={a.id} className="px-3 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  to="/artifacts/$artifactId"
                  params={{ artifactId: a.id }}
                  className="text-[14px] text-white no-underline hover:text-[var(--securist-accent)]"
                >
                  {a.name}
                </Link>
                <span className="ops-chip">
                  {STATUS_LABEL[a.status] || a.status}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[var(--securist-muted)]">
                {a.purpose}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-[var(--securist-muted)]">
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
          {artifacts.length === 0 ? (
            <li className="px-3 py-6 text-center text-[12px] text-[var(--securist-muted)]">
              No profiles match these filters.
            </li>
          ) : null}
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
