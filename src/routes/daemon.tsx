import { createFileRoute, Link } from '@tanstack/react-router'
import { getDaemonPage } from '#/lib/activity-api'
import { AgentPrompt } from '#/components/AgentPrompt'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/daemon')({
  loader: () => getDaemonPage(),
  component: DaemonPage,
})

const SCOUT_PROMPT = `You are an Securist fielding agent running GitHub Scout (org securist).
Rules: public repositories only; rate-limited; tag legal_risk; no private access; no credential stuffing.
1) Inventory public org packages under securist.
2) Emit gh_scout events with repo + legal_risk + summary.
3) Pair with HF Model Scout on /models.
Ethics gate: refuse unauthorized access. MaxMind honesty for geo (city/ASN only).`

function DaemonPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Discover · scout</div>
          <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase">
            Scout
          </h1>
          <p className="mt-1 text-[11px] text-[var(--securistel)]">
            Auto inventory on load · pulse{' '}
            <span className="ops-accent">{data.pulseMode}</span> · org{' '}
            {data.brand.githubOrg}
          </p>
        </div>
        <CopyPage title="Scout" body={SCOUT_PROMPT} />
      </header>

      <section className="ops-panel overflow-x-auto p-0">
        <div className="border-b border-[var(--ftw-border)] px-3 py-2 ops-label">
          Packages · {data.packages.length}
        </div>
        <table className="w-full min-w-[480px] text-left text-[11px]">
          <tbody>
            {data.packages.map((p) => (
              <tr key={p.id} className="border-t border-[var(--ftw-border)]">
                <td className="px-3 py-2 font-mono text-white">{p.label}</td>
                <td className="px-3 py-2 text-[var(--ftw-muted)]">{p.opsRole}</td>
                <td className="px-3 py-2 text-[var(--ftw-muted)]">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="ops-panel p-0 overflow-hidden">
        <div className="border-b border-[var(--ftw-border)] px-3 py-2 ops-label">
          Org pulse slice · auto
        </div>
        {(data.pulseSlice || []).length === 0 ? (
          <p className="px-3 py-3 text-[12px] text-[var(--ftw-muted)]">
            No live org events in slice — seed/activity still available on{' '}
            <Link to="/activity" className="ops-accent">
              Activity
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-[var(--ftw-border)]">
            {data.pulseSlice.map((e) => (
              <li key={e.id} className="px-3 py-2 text-[11px]">
                <span className="ops-accent">{e.source}</span>{' '}
                <span className="text-white">{e.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ops-panel space-y-2 p-4 text-[12px] text-[var(--ftw-muted)]">
        <div className="ops-label">Operator ingest</div>
        <p>
          Local operators may POST share-safe metadata via server function{' '}
          <span className="font-mono text-white">postDaemonIngest</span>. Optional
          env <span className="font-mono">SECURIST_DAEMON_SECRET</span> (dev
          only). Nonce + timestamp skew rejection. Never send secrets, private
          paths, or raw source. TARX is optional local runtime—not the public
          brand and never vendored here.
        </p>
        <p>
          Sibling package path (outside this hub when monorepo):{' '}
          <span className="font-mono">scout-daemon</span> · Decision Graph:{' '}
          <Link to="/artifacts" className="ops-accent no-underline">
            Artifact Profiles
          </Link>
          .
        </p>
      </section>

      <AgentPrompt title="Scout agent prompt" prompt={SCOUT_PROMPT} />
    </div>
  )
}
