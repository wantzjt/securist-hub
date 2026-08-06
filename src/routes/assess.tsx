import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { assessPublicRepository } from '#/lib/activity-api'
import type {
  AssessBoundary,
  AssessEnvironment,
  PublicDecisionBrief,
} from '#/lib/public-repo-assess'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/assess')({
  validateSearch: (search: Record<string, unknown>): {
    url?: string
    artifact?: string
  } => ({
    url: typeof search.url === 'string' ? search.url : undefined,
    artifact: typeof search.artifact === 'string' ? search.artifact : undefined,
  }),
  component: AssessPage,
})

const ENVS: AssessEnvironment[] = [
  'research',
  'development',
  'staging',
  'production',
]

const BOUNDARIES: { id: AssessBoundary; label: string }[] = [
  { id: 'local_only', label: 'Local only' },
  { id: 'controlled_cloud', label: 'Controlled cloud' },
  { id: 'external_service', label: 'External service' },
]

function AssessPage() {
  const search = Route.useSearch()
  const [repositoryUrl, setRepositoryUrl] = useState(search.url ?? '')
  const [intendedUse, setIntendedUse] = useState(
    search.artifact
      ? `Decision for catalog artifact ${search.artifact}`
      : 'Evaluate for engineering / security tooling adoption',
  )
  const [environment, setEnvironment] =
    useState<AssessEnvironment>('development')
  const [deploymentBoundary, setDeploymentBoundary] =
    useState<AssessBoundary>('controlled_cloud')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brief, setBrief] = useState<PublicDecisionBrief | null>(null)

  const sampleUrl = useMemo(
    () => 'https://github.com/Securist-InfoSec/scout-daemon',
    [],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setBrief(null)
    try {
      const result = await assessPublicRepository({
        data: {
          repositoryUrl,
          intendedUse,
          environment,
          deploymentBoundary,
        },
      })
      if (!result.ok) {
        setError(result.error)
      } else {
        setBrief(result.brief)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assess failed')
    } finally {
      setBusy(false)
    }
  }

  function downloadDraft() {
    if (!brief) return
    const blob = new Blob([brief.draftJson], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `securist-decision-draft-${brief.repository.fullName.replace('/', '-')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="ops-label">Assess</div>
        <h1 className="mt-1 text-xl font-semibold tracking-[0.06em] text-white sm:text-2xl">
          Assess a public repository
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--securist-muted)]">
          Paste a public GitHub URL. Securist collects public-source facts and
          returns a share-safe Decision Brief draft immediately. No email
          required. Nothing is saved to a private workspace before R1.
        </p>
      </header>

      <form onSubmit={onSubmit} className="ops-panel space-y-4 p-4">
        <div>
          <label className="ops-label" htmlFor="repo-url">
            Public GitHub repository URL
          </label>
          <input
            id="repo-url"
            className="mt-1 w-full rounded-sm border border-[var(--securist-border)] bg-black/40 px-3 py-2 text-[13px] text-white outline-none focus:border-[var(--securist-accent)]"
            placeholder="https://github.com/owner/repo"
            value={repositoryUrl}
            onChange={(ev) => setRepositoryUrl(ev.target.value)}
            required
            autoComplete="off"
          />
          <button
            type="button"
            className="mt-1 text-[10px] text-[var(--securist-accent)] uppercase tracking-wide"
            onClick={() => setRepositoryUrl(sampleUrl)}
          >
            Use sample public repo
          </button>
        </div>

        <div>
          <label className="ops-label" htmlFor="intended-use">
            Intended use
          </label>
          <textarea
            id="intended-use"
            className="mt-1 w-full rounded-sm border border-[var(--securist-border)] bg-black/40 px-3 py-2 text-[13px] text-white outline-none focus:border-[var(--securist-accent)]"
            rows={2}
            value={intendedUse}
            onChange={(ev) => setIntendedUse(ev.target.value)}
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="ops-label" htmlFor="environment">
              Environment
            </label>
            <select
              id="environment"
              className="mt-1 w-full rounded-sm border border-[var(--securist-border)] bg-black/40 px-3 py-2 text-[13px] text-white"
              value={environment}
              onChange={(ev) =>
                setEnvironment(ev.target.value as AssessEnvironment)
              }
            >
              {ENVS.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ops-label" htmlFor="boundary">
              Deployment boundary
            </label>
            <select
              id="boundary"
              className="mt-1 w-full rounded-sm border border-[var(--securist-border)] bg-black/40 px-3 py-2 text-[13px] text-white"
              value={deploymentBoundary}
              onChange={(ev) =>
                setDeploymentBoundary(ev.target.value as AssessBoundary)
              }
            >
              {BOUNDARIES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-[var(--securist-muted)]">
          Rejects private URLs, secrets, local paths, and non-GitHub providers.
          Does not perform a pentest or invent vulnerabilities.
        </p>

        <button
          type="submit"
          disabled={busy}
          className="ops-btn ops-btn-primary disabled:opacity-50"
        >
          {busy ? 'Assessing…' : 'Assess repository'}
        </button>
      </form>

      {error ? (
        <div className="ops-panel border-[var(--securist-accent)] p-4 text-[13px] text-white">
          {error}
        </div>
      ) : null}

      {brief ? <BriefResult brief={brief} onDownload={downloadDraft} /> : null}

      <p className="text-[11px] text-[var(--securist-muted)]">
        Prefer a curated seed profile?{' '}
        <Link
          to="/artifacts/$artifactId"
          params={{ artifactId: 'art-scout-daemon' }}
          className="ops-accent no-underline"
        >
          Sample Decision Brief
        </Link>
        .
      </p>
    </div>
  )
}

function BriefResult({
  brief,
  onDownload,
}: {
  brief: PublicDecisionBrief
  onDownload: () => void
}) {
  return (
    <div className="space-y-4" id="decision-brief-result">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Decision Brief · ephemeral</div>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {brief.repository.fullName}
          </h2>
          <p className="mt-1 text-[11px] text-[var(--securist-muted)]">
            Status: <span className="ops-accent">{brief.decisionStatus}</span>
            {' · '}
            Data: <span className="ops-chip ops-chip-live">{brief.label}</span>
            {' · '}
            Not durable · Not a production approval
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyPage
            title={`Decision Brief · ${brief.repository.fullName}`}
            body={brief.draftJson}
          />
          <button type="button" className="ops-btn" onClick={onDownload}>
            Download draft JSON
          </button>
        </div>
      </header>

      <section className="ops-panel space-y-3 p-4">
        <div className="ops-label">Scope (stated)</div>
        <dl className="grid gap-2 text-[12px] sm:grid-cols-3">
          <div>
            <dt className="ops-label">Intended use</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.scope.intendedUse}
            </dd>
          </div>
          <div>
            <dt className="ops-label">Environment</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.scope.environment}
            </dd>
          </div>
          <div>
            <dt className="ops-label">Boundary</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.scope.deploymentBoundary}
            </dd>
          </div>
        </dl>
      </section>

      <section className="ops-panel space-y-3 p-4">
        <div className="ops-label">Repository (observed)</div>
        <dl className="grid gap-2 text-[12px] sm:grid-cols-2">
          <div>
            <dt className="ops-label">Canonical URL</dt>
            <dd>
              <a
                href={brief.repository.htmlUrl}
                className="ops-accent break-all no-underline"
                target="_blank"
                rel="noreferrer"
              >
                {brief.repository.htmlUrl}
              </a>
            </dd>
          </div>
          <div>
            <dt className="ops-label">Default branch / HEAD</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.repository.defaultBranch}
              {brief.repository.headSha
                ? ` · ${brief.repository.headSha.slice(0, 12)}`
                : ''}
            </dd>
          </div>
          <div>
            <dt className="ops-label">License</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.repository.licenseSpdx ||
                brief.repository.licenseName ||
                'Unknown / not asserted'}
            </dd>
          </div>
          <div>
            <dt className="ops-label">Latest release</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.repository.latestReleaseTag || 'None observed'}
            </dd>
          </div>
          <div>
            <dt className="ops-label">Language</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.repository.language || '—'}
            </dd>
          </div>
          <div>
            <dt className="ops-label">Package.json</dt>
            <dd className="text-[var(--securist-muted)]">
              {brief.repository.packageName || brief.repository.packageVersion
                ? `${brief.repository.packageName || '—'}@${brief.repository.packageVersion || '—'}`
                : 'Not at repo root / not observed'}
            </dd>
          </div>
        </dl>
        {brief.repository.description ? (
          <p className="text-[12px] text-[var(--securist-muted)]">
            {brief.repository.description}
          </p>
        ) : null}
      </section>

      <section className="ops-panel space-y-2 p-4">
        <div className="ops-label">Observed facts (LIVE)</div>
        <ul className="space-y-2">
          {brief.observed.map((o, i) => (
            <li
              key={`${o.domain}-${i}`}
              className="border-l-2 border-[var(--securist-accent)] pl-2 text-[12px]"
            >
              <span className="ops-chip">{o.domain}</span>{' '}
              <span className="ops-chip ops-chip-live">{o.verification}</span>
              <p className="mt-1 text-[var(--securist-muted)]">{o.assertion}</p>
              <p className="text-[10px] text-[var(--securist-muted)]">
                {o.source}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="ops-panel p-4">
          <div className="ops-label">Evidence gaps</div>
          <ul className="mt-2 list-inside list-disc text-[12px] text-[var(--securist-muted)]">
            {brief.evidenceGaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div className="ops-panel p-4">
          <div className="ops-label">What would force re-review</div>
          <ul className="mt-2 list-inside list-disc text-[12px] text-[var(--securist-muted)]">
            {brief.reReviewTriggers.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ops-panel space-y-2 p-4">
        <div className="ops-label">Unknowns (explicit)</div>
        <ul className="list-inside list-disc text-[12px] text-[var(--securist-muted)]">
          {brief.unknowns.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </section>

      <section className="ops-panel space-y-2 p-4">
        <div className="ops-label">Policy hints (not a decision)</div>
        <ul className="list-inside list-disc text-[12px] text-[var(--securist-muted)]">
          {brief.policyHints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="ops-panel space-y-2 p-4">
        <div className="ops-label">Disclaimers</div>
        <ul className="list-inside list-disc text-[11px] text-[var(--securist-muted)]">
          {brief.disclaimers.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="ops-btn opacity-60"
            title="Requires R1 durable workspace"
            disabled
          >
            Save and monitor (post-R1)
          </button>
          <span className="self-center text-[10px] text-[var(--securist-muted)]">
            Future paid hinge: persist and watch this decision when durable graph
            is active.
          </span>
        </div>
      </section>
    </div>
  )
}
