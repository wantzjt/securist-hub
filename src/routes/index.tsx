import { createFileRoute, Link } from '@tanstack/react-router'
import { DecisionBriefPreview } from '#/components/DecisionBriefPreview'
import {
  BUYER_OUTCOME,
  HERO,
  LADDER,
  OPEN_BUILD_REPO_URL,
  PRODUCT_SENTENCE,
  RESEARCH_LINKS,
} from '#/lib/product-surface'

export const Route = createFileRoute('/')({
  component: Home,
})

function statusChipClass(status: 'live' | 'local' | 'next') {
  if (status === 'live') return 'ops-chip ops-chip-live'
  if (status === 'local') return 'ops-chip ops-chip-local'
  return 'ops-chip ops-chip-next'
}

function Home() {
  return (
    <div className="space-y-10">
      {/* 1. Hero — one primary CTA */}
      <section className="space-y-5" aria-labelledby="hero-title">
        <div className="ops-label">{HERO.label}</div>
        <h1
          id="hero-title"
          className="max-w-2xl text-2xl font-semibold tracking-[0.04em] text-white sm:text-3xl"
        >
          {HERO.title}
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-white/90">
          {HERO.subtitle}
        </p>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--securist-muted)]">
          {PRODUCT_SENTENCE}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/assess"
            className="ops-btn ops-btn-solid no-underline"
          >
            {HERO.primaryCta}
          </Link>
          <Link
            to="/artifacts/$artifactId"
            params={{ artifactId: 'art-scout-daemon' }}
            className="ops-btn no-underline"
          >
            {HERO.secondaryCta}
          </Link>
        </div>
        <p className="text-[11px] text-[var(--securist-muted)]">
          Public assess is free and account-free. No private data entry. Not a
          scan, pentest, or production approval.
        </p>
      </section>

      {/* 2. Product ladder */}
      <section className="space-y-3" aria-labelledby="ladder-heading">
        <div>
          <div className="ops-label">Product ladder</div>
          <h2
            id="ladder-heading"
            className="mt-1 text-sm font-semibold tracking-[0.1em] text-white uppercase"
          >
            Public → private → team
          </h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {LADDER.map((step, i) => (
            <article
              key={step.id}
              className="ops-panel flex flex-col p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="ops-label">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={statusChipClass(step.status)}>
                  {step.statusLabel}
                </span>
              </div>
              <h3 className="mt-3 text-[13px] font-semibold tracking-[0.08em] text-white uppercase">
                {step.title}
              </h3>
              <p className="mt-2 flex-1 text-[12px] leading-relaxed text-[var(--securist-muted)]">
                {step.body}
              </p>
              {step.id === 'private' ? (
                <a
                  href={step.href}
                  className="ops-btn mt-4 inline-flex no-underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {step.cta}
                </a>
              ) : step.id === 'public' ? (
                <Link
                  to="/assess"
                  className="ops-btn mt-4 inline-flex no-underline"
                >
                  {step.cta}
                </Link>
              ) : (
                <Link
                  to="/services"
                  className="ops-btn mt-4 inline-flex no-underline"
                >
                  {step.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 3. Decision Brief preview */}
      <div className="space-y-3">
        <div>
          <div className="ops-label">The operating object</div>
          <h2 className="mt-1 text-sm font-semibold tracking-[0.1em] text-white uppercase">
            What a Decision Brief looks like
          </h2>
        </div>
        <DecisionBriefPreview />
      </div>

      {/* 4. Buyer outcome */}
      <section className="ops-panel bg-[var(--securist-accent-dim)] p-4 sm:p-5">
        <div className="ops-label text-[var(--securist-accent)]">
          Why this exists
        </div>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white">
          {BUYER_OUTCOME}
        </p>
        <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-[var(--securist-muted)]">
          Permission is version-bound, scope-bound, and evidence-bound. Material
          change reopens the decision—humans stay accountable.
        </p>
      </section>

      {/* 5. Built in the open */}
      <section
        className="ops-panel flex flex-wrap items-center justify-between gap-3 p-4"
        aria-label="Built in the open"
      >
        <div>
          <div className="ops-label">Built in the open</div>
          <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Code, changelog, and security policy are public. No personal handles
            on this surface.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={OPEN_BUILD_REPO_URL}
            className="ops-btn no-underline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub repository
          </a>
          <a
            href={`${OPEN_BUILD_REPO_URL}/blob/main/CHANGELOG.md`}
            className="ops-btn no-underline"
            target="_blank"
            rel="noreferrer"
          >
            Changelog
          </a>
          <a
            href={`${OPEN_BUILD_REPO_URL}/blob/main/SECURITY.md`}
            className="ops-btn no-underline"
            target="_blank"
            rel="noreferrer"
          >
            Security policy
          </a>
        </div>
      </section>

      {/* 6. Research demoted */}
      <section className="space-y-3" aria-labelledby="research-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="ops-label">Research</div>
            <h2
              id="research-heading"
              className="text-sm font-semibold tracking-[0.1em] text-white uppercase"
            >
              Supporting intelligence — not the product path
            </h2>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {RESEARCH_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="ops-panel block p-3 no-underline transition hover:border-[var(--securist-accent)]"
            >
              <div className="text-[11px] font-semibold tracking-[0.1em] text-white uppercase">
                {item.label}
              </div>
              <div className="mt-0.5 text-[10px] text-[var(--securist-muted)]">
                {item.hint}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
