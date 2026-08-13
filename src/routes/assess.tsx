import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { assessPublicRepository } from '#/lib/activity-api'
import type {
  PublicAssessBoundaryV1,
  PublicAssessEnvironmentV1,
  PublicDecisionBriefV1,
} from '#/lib/decision-graph/surface-contracts'
import { CopyPage } from '#/components/CopyPage'
import { AdmissionPackPicker } from '#/components/AdmissionPackPicker'
import type { AdmissionPackIdV1, AdmissionPackV1 } from '#/lib/admission-packs'

function repoHintFromUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null
  try {
    const u = new URL(raw.trim())
    if (!/(^|\.)github\.com$/i.test(u.hostname)) return null
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`
  } catch {
    return null
  }
  return null
}

export const Route = createFileRoute('/assess')({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    url?: string
    artifact?: string
  } => ({
    url: typeof search.url === 'string' ? search.url : undefined,
    artifact: typeof search.artifact === 'string' ? search.artifact : undefined,
  }),
  loaderDeps: ({ search }) => ({ url: search.url }),
  loader: ({ deps }) => deps,
  head: ({ loaderData }) => {
    const repo = repoHintFromUrl(loaderData?.url)
    const title = repo
      ? `Public Decision Brief (ephemeral) · ${repo} · Securist`
      : 'Public Decision Brief (ephemeral) · Securist'
    const description = repo
      ? `Ephemeral Decision Brief draft for ${repo}. Re-run assess from this link — not a durable saved brief. Not a production approval.`
      : 'Paste a public GitHub URL for an ephemeral Decision Brief draft. Not durable. Not a production approval. No account required.'
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
    }
  },
  component: AssessPage,
})

const ENVS: PublicAssessEnvironmentV1[] = [
  'research',
  'development',
  'staging',
  'production',
]

const BOUNDARIES: { id: PublicAssessBoundaryV1; label: string }[] = [
  { id: 'local_only', label: 'Local only' },
  { id: 'controlled_cloud', label: 'Controlled cloud' },
  { id: 'external_service', label: 'External service' },
]

function AssessPage() {
  const search = Route.useSearch()
  const [repositoryUrl, setRepositoryUrl] = useState(search.url ?? '')
  const [packId, setPackId] = useState<AdmissionPackIdV1 | ''>('')
  const [intendedUse, setIntendedUse] = useState(
    search.artifact
      ? `Decision for catalog artifact ${search.artifact}`
      : 'Evaluate for engineering / security tooling adoption',
  )
  const [environment, setEnvironment] =
    useState<PublicAssessEnvironmentV1>('development')
  const [deploymentBoundary, setDeploymentBoundary] =
    useState<PublicAssessBoundaryV1>('controlled_cloud')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brief, setBrief] = useState<PublicDecisionBriefV1 | null>(null)

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
          ...(packId ? { admissionPackId: packId } : {}),
        },
      })
      if (!result.ok) {
        setError(result.error)
      } else {
        setBrief(result.brief)
        // PLG: put an honest re-run URL in the address bar (not a durable brief).
        if (typeof window !== 'undefined' && repositoryUrl.trim()) {
          const next = new URL(window.location.href)
          next.searchParams.set('url', repositoryUrl.trim())
          next.searchParams.delete('artifact')
          window.history.replaceState(window.history.state, '', next.toString())
        }
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
    <div className={`space-y-6${brief ? ' assess-has-brief' : ''}`}>
      <header className={brief ? 'no-print' : undefined}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="ops-label">Product · Assess</div>
          <span className="ops-chip ops-chip-live">Live</span>
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-[0.06em] text-white sm:text-2xl">
          Assess a public repository
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--securist-muted)]">
          Paste a public GitHub URL. Securist collects public-source facts and
          returns a share-safe Decision Brief draft immediately. No account. No
          email. Nothing is saved to a private workspace before R1. Do not enter
          private or sensitive information.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className={`ops-panel space-y-4 p-4${brief ? ' no-print' : ''}`}
      >
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

        <AdmissionPackPicker
          packId={packId}
          onSelect={(pack: AdmissionPackV1 | null) => {
            if (!pack) {
              setPackId('')
              return
            }
            setPackId(pack.id)
            setIntendedUse(pack.intendedUsePrompt)
            setEnvironment(pack.environmentDefault)
            setDeploymentBoundary(pack.deploymentBoundaryDefault)
            setRepositoryUrl(pack.sampleSources[0].url)
          }}
        />

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
                setEnvironment(ev.target.value as PublicAssessEnvironmentV1)
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
                setDeploymentBoundary(ev.target.value as PublicAssessBoundaryV1)
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
          Rejects private repository URLs, secret-like strings (including in
          intended use), local paths, and non-GitHub providers. Do not enter
          private or sensitive information. Does not perform a pentest or invent
          vulnerabilities.
        </p>

        <button
          type="submit"
          disabled={busy}
          className="ops-btn ops-btn-solid disabled:opacity-50"
        >
          {busy ? 'Assessing…' : 'Assess repository'}
        </button>
      </form>

      {error ? (
        <div className="ops-panel border-[var(--securist-accent)] p-4 text-[13px] text-white">
          {error}
        </div>
      ) : null}

      {brief ? (
        <BriefResult
          brief={brief}
          repositoryUrl={repositoryUrl.trim()}
          onDownload={downloadDraft}
        />
      ) : null}

      <p className="no-print text-[11px] text-[var(--securist-muted)]">
        Prefer a SEED illustrative profile?{' '}
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

function buildBriefMarkdown(
  brief: PublicDecisionBriefV1,
  repositoryUrl: string,
  rerunUrl: string,
): string {
  const stamp =
    'Ephemeral public draft · Not durable · Not a production approval · Team Graph shared memory is not live'
  const code = (s: string) => '`' + s + '`'
  const lines: string[] = [
    '# Decision Brief · ' + brief.repository.fullName,
    '',
    '> ' + stamp,
    '>',
    '> Re-run (does not save this brief): ' + rerunUrl,
    '',
    '- Status: ' + code(brief.decisionStatus),
    '- Data: ' + code(brief.label),
    '- Persistence: ' + code(brief.persistence),
    '- Fetched: ' + brief.fetchedAt,
    '',
    '## Scope (stated)',
    '',
    '- Intended use: ' + brief.scope.intendedUse,
    '- Environment: ' + brief.scope.environment,
    '- Boundary: ' + brief.scope.deploymentBoundary,
    '',
    '## Repository (observed)',
    '',
    '- Canonical URL: ' + brief.repository.htmlUrl,
    '- Default branch / HEAD: ' +
      brief.repository.defaultBranch +
      (brief.repository.headSha
        ? ' · ' + brief.repository.headSha.slice(0, 12)
        : ''),
    '- License: ' +
      (brief.repository.licenseSpdx ||
        brief.repository.licenseName ||
        'Unknown / not asserted'),
    '- Latest release: ' +
      (brief.repository.latestReleaseTag || 'None observed'),
    '- Language: ' + (brief.repository.language || '—'),
    '- Package.json: ' +
      (brief.repository.packageName || brief.repository.packageVersion
        ? (brief.repository.packageName || '—') +
          '@' +
          (brief.repository.packageVersion || '—')
        : 'Not at repo root / not observed'),
  ]
  if (brief.repository.description) {
    lines.push('', brief.repository.description)
  }
  lines.push('', '## Observed facts (LIVE)', '')
  for (const o of brief.observed) {
    lines.push(
      '- **' + o.domain + '** · ' + code(o.verification) + ' — ' + o.assertion,
      '  - Source: ' + o.source,
    )
  }
  lines.push('', '## Evidence gaps', '')
  for (const g of brief.evidenceGaps) lines.push('- ' + g)
  lines.push('', '## What would force re-review', '')
  for (const t of brief.reReviewTriggers) lines.push('- ' + t)
  lines.push('', '## Unknowns (explicit)', '')
  for (const u of brief.unknowns) lines.push('- ' + u)
  lines.push('', '## Policy hints (not a decision)', '')
  for (const h of brief.policyHints) lines.push('- ' + h)
  lines.push('', '## Disclaimers', '')
  for (const d of brief.disclaimers) lines.push('- ' + d)
  if (repositoryUrl) {
    lines.push('', '---', '', 'Assess input URL: ' + repositoryUrl)
  }
  lines.push('')
  return lines.join('\n')
}

function BriefResult({
  brief,
  repositoryUrl,
  onDownload,
}: {
  brief: PublicDecisionBriefV1
  repositoryUrl: string
  onDownload: () => void
}) {
  const [shareCopied, setShareCopied] = useState(false)
  const [mdExported, setMdExported] = useState(false)
  const rerunUrl = useMemo(() => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://secur.ist'
    const u = new URL('/assess', origin)
    if (repositoryUrl) u.searchParams.set('url', repositoryUrl)
    return u.toString()
  }, [repositoryUrl])

  async function copyRerunLink() {
    try {
      await navigator.clipboard.writeText(rerunUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 1500)
    } catch {
      setShareCopied(false)
    }
  }

  function exportMarkdown() {
    const md = buildBriefMarkdown(brief, repositoryUrl, rerunUrl)
    const slug = brief.repository.fullName.replace('/', '-')
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'decision-brief-' + slug + '.md'
    a.click()
    URL.revokeObjectURL(a.href)
    void navigator.clipboard.writeText(md).catch(() => {})
    setMdExported(true)
    setTimeout(() => setMdExported(false), 1500)
  }

  return (
    <div className="brief-print-root space-y-4" id="decision-brief-result">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Decision Brief · ephemeral</div>
          <p className="mt-1 text-[11px] font-medium tracking-wide text-[var(--securist-accent)] uppercase">
            Ephemeral · Not durable · Re-run link does not save this brief
          </p>
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
        <div className="no-print flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="ops-btn ops-btn-solid"
              onClick={copyRerunLink}
              title="Copies a link that re-runs assess for this public repo. Does not save the brief."
            >
              {shareCopied ? 'Link copied' : 'Copy re-run link'}
            </button>
            <button
              type="button"
              className="ops-btn"
              onClick={exportMarkdown}
              title="Downloads a markdown export of this on-screen Decision Brief. Ephemeral — not a durable store."
            >
              {mdExported ? 'Markdown exported' : 'Export markdown'}
            </button>
            <CopyPage
              title={`Decision Brief · ${brief.repository.fullName}`}
              body={brief.draftJson}
            />
            <button type="button" className="ops-btn" onClick={onDownload}>
              Download draft JSON
            </button>
          </div>
          <p className="max-w-md text-[10px] leading-relaxed text-[var(--securist-muted)]">
            Re-run link opens /assess for this public repo. It does not save
            this brief. Team Graph shared memory is not live. Export markdown is
            a local snapshot of this screen.
          </p>
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

      <section className="ops-panel space-y-3 p-4 no-print">
        <div>
          <div className="ops-label">What next?</div>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            This is an ephemeral public draft, not a production approval. Choose
            the next boundary that matches the work.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-[var(--securist-border)] bg-black/20 p-3">
            <div className="ops-label">Private code · local</div>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--securist-muted)]">
              Keep private repos on your machine. Free Local Operator: monorepo
              path today, or a human-signed RC tarball when you have one—not
              public npm, not Electron.
            </p>
            <Link
              to="/operator"
              className="ops-btn mt-3 inline-flex no-underline"
            >
              Local Operator guide
            </Link>
          </div>
          <div className="border border-[var(--securist-border)] bg-black/20 p-3">
            <div className="ops-label">Shared re-review · coming next</div>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--securist-muted)]">
              Team Graph will retain owner, policy, evidence, and forced
              re-review when artifacts change. Not a live workspace yet.
            </p>
            <Link to="/team" className="ops-btn mt-3 inline-flex no-underline">
              Team Graph (coming next)
            </Link>
          </div>
        </div>
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
        <div className="mt-3 flex flex-wrap gap-2 no-print">
          <button
            type="button"
            className="ops-btn opacity-60"
            title="Requires R1 durable workspace"
            disabled
          >
            Save and monitor (post-R1)
          </button>
          <span className="self-center text-[10px] text-[var(--securist-muted)]">
            Future paid hinge: persist and watch this decision when durable
            graph is active.
          </span>
        </div>
      </section>
    </div>
  )
}
