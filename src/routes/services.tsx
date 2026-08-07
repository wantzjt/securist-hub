import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'

export const Route = createFileRoute('/services')({
  component: ServicesPage,
})

const offers = [
  {
    number: '01',
    title: 'Adoption baseline',
    trigger: 'Your approved-tools list lives in tickets, wikis, and memory.',
    outcome:
      'Turn the security-relevant packages you already use into version-bound, scoped decision records with named evidence and policy context.',
    proves: 'A real allowlist can become a durable system of record.',
  },
  {
    number: '02',
    title: 'Decision readiness sprint',
    trigger:
      'A team needs a defensible answer before a security package enters a defined environment.',
    outcome:
      'Apply a policy, record the human decision, and capture a share-safe local validation summary—without making a PDF the source of truth.',
    proves: 'Evidence → policy → human decision can move as one workflow.',
  },
  {
    number: '03',
    title: 'Re-review response',
    trigger:
      'An artifact changed after an earlier allow, and nobody can honestly say whether it is still approved.',
    outcome:
      'Record the material change, reopen the decision, and close an explicit re-review against the new version and evidence set.',
    proves: 'Permission stays honest under drift instead of silently inheriting.',
  },
] as const

function ServicesPage() {
  return (
    <div className="space-y-8">
      <header className="grid gap-5 border-b border-[var(--securist-border)] pb-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="ops-label">Adoption assurance · fixed scope</div>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[0.04em] text-white uppercase sm:text-4xl">
            Re-review response
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--securist-muted)]">
            When an approved artifact changes, Securist helps your team reopen
            the decision against the new version, evidence, and policy. Your
            team owns the decision and the record that keeps it honest.
          </p>
        </div>
        <aside className="ops-panel self-start p-4">
          <div className="ops-label">Bring one real decision</div>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Bring one package, one intended boundary, and the question that is
            currently stuck. We will determine whether the work is a fit before
            any engagement begins.
          </p>
          <a
            className="ops-btn mt-4 no-underline"
            href={`mailto:${BRAND.email}?subject=${encodeURIComponent('Securist Adoption Assurance')}`}
          >
            Start a conversation
          </a>
        </aside>
      </header>

      <section className="grid gap-3 lg:grid-cols-3">
        {offers.map((offer) => (
          <article key={offer.number} className="ops-panel flex flex-col p-4">
            <div className="flex items-center justify-between">
              <span className="ops-label">{offer.number}</span>
              <span className="ops-chip ops-chip-live">Fixed outcome</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-wide text-white uppercase">
              {offer.title}
            </h2>
            <div className="mt-4 space-y-3 text-[12px] leading-relaxed text-[var(--securist-muted)]">
              <p>
                <span className="ops-label mr-2">Signal</span>
                {offer.trigger}
              </p>
              <p>
                <span className="ops-label mr-2">Outcome</span>
                {offer.outcome}
              </p>
            </div>
            <p className="mt-auto border-t border-[var(--securist-border)] pt-3 text-[11px] leading-relaxed ops-accent">
              {offer.proves}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="ops-panel p-4">
          <div className="ops-label">What Securist does</div>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            <li>Facilitates policy, evidence, and human decision records.</li>
            <li>Uses public signals and share-safe validation summaries.</li>
            <li>Leaves your team with Decision Graph records it owns.</li>
            <li>Reopens trust when a material change requires review.</li>
          </ul>
        </div>
        <div className="ops-panel p-4">
          <div className="ops-label">What Securist does not do</div>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            <li>Pentesting, red teaming, or managed detection and response.</li>
            <li>Operate your CI, production workloads, or remediation program.</li>
            <li>Approve artifacts on behalf of your organization.</li>
            <li>Store credentials, raw private data, or a report as your system of record.</li>
          </ul>
        </div>
      </section>

      <section className="ops-panel p-4 sm:p-5">
        <div className="ops-label">The operating object</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <div className="border border-[var(--securist-border)] bg-black/20 p-3 text-[12px] text-white">
            Artifact + version
          </div>
          <div className="hidden text-center ops-accent sm:block">→</div>
          <div className="border border-[var(--securist-border)] bg-black/20 p-3 text-[12px] text-white">
            Evidence + policy + boundary
          </div>
          <div className="hidden text-center ops-accent sm:block">→</div>
          <div className="border border-[var(--securist-border)] bg-black/20 p-3 text-[12px] text-white">
            Human decision + re-review
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-[12px] leading-relaxed text-[var(--securist-muted)]">
          This is not a consulting report. It is the decision history that lets
          a security or platform team answer what was allowed, why, under which
          policy, and what changed after the decision.
        </p>
        <Link to="/artifacts" className="ops-btn mt-4 inline-flex no-underline">
          Explore artifact profiles
        </Link>
      </section>
    </div>
  )
}
