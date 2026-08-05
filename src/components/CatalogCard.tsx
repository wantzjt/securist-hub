import type { HfCatalogRow } from '#/lib/hf-catalog'
import { AgentPrompt } from './AgentPrompt'

export function CatalogCard({ row }: { row: HfCatalogRow }) {
  return (
    <article className="ops-panel flex flex-col gap-3 p-3 sm:p-4">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ops-chip">{row.kind}</span>
          <span className="ops-chip">{row.legalRisk} risk</span>
          <span className="ops-chip ops-chip-live">{row.opsRole}</span>
        </div>
        <h3 className="text-sm font-semibold tracking-wide text-white">
          {row.title}
        </h3>
        <a
          href={`https://huggingface.co/${row.repoId}`}
          className="break-all text-[11px] no-underline hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          {row.repoId}
        </a>
      </header>

      <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
        {row.summary}
      </p>

      <dl className="grid gap-2 text-[11px]">
        <div>
          <dt className="ops-label">Infosec use</dt>
          <dd className="mt-0.5 text-[var(--securist-muted)]">
            {row.infosecUse}
          </dd>
        </div>
        <div>
          <dt className="ops-label">License</dt>
          <dd className="mt-0.5 text-[var(--securist-muted)]">{row.license}</dd>
        </div>
        <div>
          <dt className="ops-label">GitHub bridge</dt>
          <dd className="mt-0.5 text-[var(--securist-muted)]">
            {row.githubBridge}
          </dd>
        </div>
        <div>
          <dt className="ops-label">Scope / packages</dt>
          <dd className="mt-0.5 text-[var(--securist-muted)]">
            {row.catalogScope}
            {row.packageSlugs.length ? ` · ${row.packageSlugs.join(', ')}` : ''}
          </dd>
        </div>
        <div>
          <dt className="ops-label">TARX pull</dt>
          <dd className="ops-pre mt-0.5 text-[var(--securist-muted)]">
            {row.tarxPull}
          </dd>
        </div>
        <div>
          <dt className="ops-label">Ops action</dt>
          <dd className="mt-0.5 ops-accent">{row.opsAction}</dd>
        </div>
        {row.pairings?.length ? (
          <div>
            <dt className="ops-label">Pairings</dt>
            <dd className="mt-0.5 text-[var(--securist-muted)]">
              {row.pairings.join(' · ')}
            </dd>
          </div>
        ) : null}
      </dl>

      <AgentPrompt title="Agent prompt" prompt={row.agentPrompt} />
    </article>
  )
}
