import { createFileRoute, Link } from '@tanstack/react-router'
import { getActivity } from '#/lib/activity-api'
import { CopyPage } from '#/components/CopyPage'

const SOURCE_LABEL: Record<string, string> = {
  gh_scout: 'GH Scout',
  hf_scout: 'HF Scout',
  model_pull: 'model_pull',
  org: 'org',
  implementer: 'implementer',
  package: 'package',
  seed: 'seed',
}

export const Route = createFileRoute('/activity')({
  loader: () => getActivity(),
  component: ActivityPage,
})

function ActivityPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Sources · operations pulse</div>
          <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase">
            Activity
          </h1>
          <p className="mt-1 text-[11px] text-[var(--securist-muted)]">
            Merged pulse · mode <span className="ops-accent">{data.mode}</span>{' '}
            · not a social feed ·{' '}
            {data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : '—'}
          </p>
          <p className="mt-1 max-w-2xl text-[10px] text-[var(--securist-muted)]">
            {data.decisionNote}
          </p>
        </div>
        <CopyPage title="Activity / Sources" />
      </header>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.sourceCards.map((c) => (
          <div key={c.id} className="ops-panel p-3">
            <div className="ops-label">{c.label}</div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span
                className={`ops-chip ${c.status === 'live' ? 'ops-chip-live' : ''}`}
              >
                {c.status}
              </span>
              <span className="font-mono text-lg text-white">{c.count}</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--securist-muted)] break-all">
              {c.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Link to="/artifacts" className="ops-btn no-underline">
          Artifact Profiles
        </Link>
        <Link to="/daemon" className="ops-btn no-underline">
          Scout / operator
        </Link>
        <Link to="/models" className="ops-btn no-underline">
          Models
        </Link>
        <Link to="/links" className="ops-btn no-underline">
          Links
        </Link>
      </div>

      <section className="ops-panel overflow-hidden p-0">
        <div className="border-b border-[var(--securist-border)] px-3 py-2 ops-label">
          Event stream · {data.events.length}
        </div>
        <ul className="divide-y divide-[var(--securist-border)]">
          {data.events.map((e) => (
            <li key={e.id} className="px-3 py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-[13px] text-white break-words">
                  {e.title}
                </div>
                <time className="text-[10px] text-[var(--securist-muted)] shrink-0">
                  {new Date(e.createdAt).toLocaleString()}
                </time>
              </div>
              {e.detail ? (
                <p className="mt-0.5 text-[11px] text-[var(--securist-muted)] break-words">
                  {e.detail}
                </p>
              ) : null}
              {'whyItMatters' in e && e.whyItMatters ? (
                <p className="mt-0.5 text-[11px] text-[var(--securist-muted)]">
                  Why it matters: {e.whyItMatters}
                </p>
              ) : null}
              {'securistAction' in e && e.securistAction ? (
                <p className="mt-0.5 text-[11px] text-[var(--securist-accent)]">
                  Action: {e.securistAction}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-[var(--securist-muted)]">
                <span
                  className={`ops-chip ${e.source === 'seed' || ('isSeed' in e && e.isSeed) ? '' : 'ops-chip-live'}`}
                >
                  {SOURCE_LABEL[e.source] || e.source}
                </span>
                <span className="ops-chip">{e.stage}</span>
                {'verification' in e && e.verification ? (
                  <span className="ops-chip">{String(e.verification)}</span>
                ) : null}
                {e.repo ? (
                  e.repo.startsWith('art-') ? (
                    <Link
                      to="/artifacts/$artifactId"
                      params={{ artifactId: e.repo }}
                      className="break-all ops-accent no-underline"
                    >
                      {e.repo}
                    </Link>
                  ) : (
                    <span className="break-all">{e.repo}</span>
                  )
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
