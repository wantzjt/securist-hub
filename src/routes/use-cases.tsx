import { createFileRoute, Link } from '@tanstack/react-router'
import { USE_CASES } from '#/lib/use-cases'
import { githubHttps } from '#/lib/packages'
import { CopyPage } from '#/components/CopyPage'
import { BRAND } from '#/lib/brand'

export const Route = createFileRoute('/use-cases')({
  component: UseCasesPage,
})

function UseCasesPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="ops-label">Join table · packages × models</div>
          <h1 className="text-2xl font-semibold tracking-[0.06em] text-white uppercase">
            Use-cases
          </h1>
          <p className="max-w-2xl text-sm text-[var(--securist-muted)]">
            Dual-forge bridges: every package slug is real under{' '}
            {BRAND.githubOrg}; HF models are public hub artifacts (catalogScope
            public_hub) until {BRAND.hfOrg} publishes house weights.
          </p>
        </div>
        <CopyPage
          title="Use-cases join table"
          body={USE_CASES.map(
            (u) =>
              `${u.id}: packages=[${u.packages.join(',')}] models=[${u.models.join(',')}]`,
          ).join('\n')}
        />
      </header>

      <div className="grid gap-3">
        {USE_CASES.map((u) => (
          <article key={u.id} className="ops-panel p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              <span className="ops-chip ops-chip-live">{u.legalRisk} risk</span>
              <span className="ops-chip">{u.modelScope}</span>
            </div>
            <h2 className="mt-2 text-sm font-semibold tracking-wide text-white">
              {u.title}
            </h2>
            <p className="mt-1 text-[12px] text-[var(--securist-muted)]">
              {u.summary}
            </p>
            <dl className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
              <div>
                <dt className="ops-label">Packages</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {u.packages.map((p) => (
                    <a
                      key={p}
                      href={githubHttps(p)}
                      className="ops-chip no-underline hover:border-[var(--securist-accent)]"
                      rel="noreferrer"
                      target="_blank"
                    >
                      {p}
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="ops-label">Models</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {u.models.length ? (
                    u.models.map((m) => (
                      <a
                        key={m}
                        href={`https://huggingface.co/${m}`}
                        className="ops-chip no-underline break-all hover:border-[var(--securist-accent)]"
                        rel="noreferrer"
                        target="_blank"
                      >
                        {m}
                      </a>
                    ))
                  ) : (
                    <span className="text-[var(--securistel)]">
                      none (package / geo path)
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] ops-accent">{u.opsAction}</p>
          </article>
        ))}
      </div>

      <p className="text-[12px] text-[var(--securist-muted)]">
        Field models on{' '}
        <Link to="/models" className="ops-accent">
          /models
        </Link>
        ; packages on{' '}
        <Link to="/tools" className="ops-accent">
          /tools
        </Link>
        .
      </p>
    </div>
  )
}
