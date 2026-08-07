import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'
import { BUYER_OUTCOME, PRODUCT_SENTENCE } from '#/lib/product-surface'

export const Route = createFileRoute('/team')({
  component: TeamGraphPage,
})

function TeamGraphPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="ops-label">Product · Team Graph</div>
          <span className="ops-chip ops-chip-next">Coming next</span>
        </div>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-[0.04em] text-white sm:text-3xl">
          Shared permission under drift.
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--securist-muted)]">
          {PRODUCT_SENTENCE}
        </p>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--securist-muted)]">
          Team Graph is the paid control plane: durable shared decisions with a
          named owner, policy binding, evidence set, and forced re-review when
          reality changes. It is <strong className="text-white">not live</strong>{' '}
          until R1 human provision completes.
        </p>
      </header>

      <section className="ops-panel border-[var(--securist-border)] bg-[var(--securist-accent-dim)] p-4 sm:p-5">
        <div className="ops-label text-[var(--securist-accent)]">Why pay</div>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white">
          {BUYER_OUTCOME}
        </p>
        <p className="mt-2 text-[12px] text-[var(--securist-muted)]">
          Free path: assess publicly or keep private code local. Paid path:
          shared organizational memory—not AI token meters.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {[
          {
            t: 'Owner + policy',
            d: 'A named human owns the decision under an explicit policy version.',
          },
          {
            t: 'Evidence bound',
            d: 'Permission is bound to the evidence set that justified it—not a wiki memory.',
          },
          {
            t: 'Re-review on change',
            d: 'Material version, license, boundary, or policy change reopens trust.',
          },
        ].map((c) => (
          <article key={c.t} className="ops-panel p-4">
            <div className="ops-label">Coming next</div>
            <h2 className="mt-2 text-[13px] font-semibold tracking-[0.08em] text-white uppercase">
              {c.t}
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
              {c.d}
            </p>
          </article>
        ))}
      </section>

      <section className="ops-panel space-y-3 p-4">
        <div className="ops-label">What you can do now</div>
        <div className="flex flex-wrap gap-2">
          <Link to="/assess" className="ops-btn ops-btn-solid no-underline">
            Assess a public repository
          </Link>
          <Link to="/operator" className="ops-btn no-underline">
            Local Operator guide
          </Link>
          <Link to="/services" className="ops-btn no-underline">
            Adoption Assurance (secondary)
          </Link>
        </div>
        <p className="text-[11px] text-[var(--securist-muted)]">
          Design partners:{' '}
          <a className="ops-accent" href={`mailto:${BRAND.email}`}>
            {BRAND.email}
          </a>{' '}
          with subject <span className="text-white">design partner</span>—no
          unsolicited private data.
        </p>
      </section>
    </div>
  )
}
