import { createFileRoute, Link } from '@tanstack/react-router'
import { getHomeData } from '#/lib/activity-api'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <div className="ops-label">Decision system</div>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-[0.04em] text-white sm:text-3xl">
          Permission for code and models.
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--securist-muted)]">
          Know what your engineers and agents may use, what was tested, and what
          must be reconsidered when artifacts change. Securist is the chain of
          custody for permission under drift—not a feed, scanner, or pentest.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/assess" className="ops-btn ops-btn-primary no-underline">
            Assess a repository
          </Link>
          <Link
            to="/artifacts/$artifactId"
            params={{ artifactId: 'art-scout-daemon' }}
            className="ops-btn no-underline"
          >
            View a sample Decision Brief
          </Link>
        </div>
        <p className="text-[11px] text-[var(--securist-muted)]">
          Public GitHub assess returns an immediate share-safe brief. No private
          workspace until R1. No vulnerability claims from model narrative.
        </p>
      </section>

      <section className="ops-panel grid gap-4 p-4 sm:grid-cols-4">
        {[
          {
            n: '1',
            t: 'Assess',
            d: 'Public repo URL + intended boundary',
          },
          {
            n: '2',
            t: 'Evidence',
            d: 'Observed public facts · explicit gaps',
          },
          {
            n: '3',
            t: 'Human decision',
            d: 'Approve / conditional / pause (durable post-R1)',
          },
          {
            n: '4',
            t: 'Re-review',
            d: 'Material change forces re-open',
          },
        ].map((s) => (
          <div key={s.n}>
            <div className="ops-label">
              {s.n} · {s.t}
            </div>
            <p className="mt-1 text-[12px] text-[var(--securist-muted)]">
              {s.d}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="ops-label">Research</div>
            <h2 className="text-sm font-semibold tracking-[0.1em] text-white uppercase">
              Supporting public intelligence
            </h2>
          </div>
          <p className="text-[11px] text-[var(--securist-muted)]">
            {data.productHub} · dual-forge · not the primary product path
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/activity' as const, label: 'Activity', hint: 'Sources pulse' },
            { to: '/models' as const, label: 'Models', hint: 'HF research' },
            { to: '/tools' as const, label: 'Packages', hint: 'Tool catalog' },
            { to: '/artifacts' as const, label: 'Decision Briefs', hint: 'Profiles' },
            { to: '/daemon' as const, label: 'Scout', hint: 'Operator board' },
            { to: '/links' as const, label: 'Links', hint: 'Field ledger' },
            { to: '/security' as const, label: 'Security', hint: 'Policy posture' },
            { to: '/services' as const, label: 'Services', hint: 'Concierge (secondary)' },
          ].map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              className="ops-panel block p-3 no-underline transition hover:border-[var(--securist-accent)]"
            >
              <div className="text-[12px] font-semibold tracking-[0.1em] text-white uppercase">
                {item.label}
              </div>
              <div className="mt-0.5 text-[10px] text-[var(--securist-muted)]">
                {item.hint}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ops-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="ops-label">Sample</div>
          <p className="text-[13px] text-white">
            Open a curated seed Decision Brief for{' '}
            <span className="ops-accent">scout-daemon</span>.
          </p>
        </div>
        <Link
          to="/artifacts/$artifactId"
          params={{ artifactId: 'art-scout-daemon' }}
          className="ops-btn no-underline"
        >
          Open sample brief
        </Link>
      </section>
    </div>
  )
}
