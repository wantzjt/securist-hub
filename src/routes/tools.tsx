import { createFileRoute, Link } from '@tanstack/react-router'
import { REPOS, githubHttps } from '#/lib/packages'
import { AgentPrompt } from '#/components/AgentPrompt'
import { CopyPage } from '#/components/CopyPage'
import { BRAND } from '#/lib/brand'

export const Route = createFileRoute('/tools')({
  component: ToolsPage,
})

function ToolsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="ops-label">Packages · GitHub lane</div>
          <h1 className="text-2xl font-semibold tracking-[0.06em] text-white uppercase">
            Tools
          </h1>
          <p className="max-w-2xl text-sm text-[var(--securist-muted)]">
            Canonical package list for org{' '}
            <a
              href={BRAND.githubUrl}
              className="ops-accent no-underline hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              {BRAND.githubOrg}
            </a>
            . Discovery surface — decisions live on{' '}
            <Link to="/artifacts" className="ops-accent no-underline">
              Artifact Profiles
            </Link>
            .
          </p>
        </div>
        <CopyPage
          title="Tools catalog"
          body={REPOS.map((r) => `- ${r.id}: ${r.clone}`).join('\n')}
        />
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-[var(--securist-border)] ops-label">
              <th className="py-2 pr-3 font-medium">Package</th>
              <th className="py-2 pr-3 font-medium">Ops role</th>
              <th className="py-2 pr-3 font-medium">Clone</th>
              <th className="py-2 font-medium">Site</th>
            </tr>
          </thead>
          <tbody>
            {REPOS.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--securist-border)]"
              >
                <td className="py-2 pr-3">
                  <a
                    href={githubHttps(r.id)}
                    className="font-mono text-white no-underline hover:underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {r.id}
                  </a>
                </td>
                <td className="py-2 pr-3 text-[var(--securist-muted)]">
                  {r.opsRole}
                </td>
                <td className="ops-pre py-2 pr-3 text-[10px] text-[var(--securist-muted)]">
                  {r.clone}
                </td>
                <td className="py-2">
                  <Link
                    to={r.siteHref.split('#')[0]}
                    className="ops-accent text-[11px]"
                  >
                    open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {REPOS.map((r) => (
          <article key={r.id} className="ops-panel space-y-3 p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              <span className="ops-chip ops-chip-live">{r.opsRole}</span>
              <span className="ops-chip">{r.stage}</span>
            </div>
            <h2 className="font-mono text-sm text-white">{r.id}</h2>
            <p className="text-[12px] text-[var(--securist-muted)]">
              {r.summary}
            </p>
            <p className="text-[11px] text-[var(--securistel)]">
              {r.securityNote}
            </p>
            <p className="ops-pre text-[10px] text-[var(--securist-muted)]">
              {r.clone}
            </p>
            {r.hfModels?.length ? (
              <p className="text-[11px] text-[var(--securist-muted)]">
                HF bridge:{' '}
                {r.hfModels.map((m) => (
                  <a
                    key={m}
                    href={`https://huggingface.co/${m}`}
                    className="mr-2 break-all ops-accent"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {m}
                  </a>
                ))}
              </p>
            ) : null}
            <AgentPrompt
              title={`${r.id} agent prompt`}
              prompt={r.agentPrompt}
            />
          </article>
        ))}
      </div>

      <p className="text-[12px] text-[var(--securist-muted)]">
        Scouts:{' '}
        <Link to="/daemon" className="ops-accent">
          GH Scout
        </Link>{' '}
        ·{' '}
        <Link to="/models" className="ops-accent">
          HF Model Scout
        </Link>{' '}
        · joins on{' '}
        <Link to="/use-cases" className="ops-accent">
          /use-cases
        </Link>
      </p>
    </div>
  )
}
