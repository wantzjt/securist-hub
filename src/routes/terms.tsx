import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({ component: TermsPage })

function TermsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="ops-label">Securist · terms</div>
        <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase">
          Terms
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--securist-muted)]">
          Securist indexes public technical artifacts and provides
          decision-support material. Operators remain responsible for
          authorization, licensing, security review, and deployment decisions.
        </p>
      </header>
      <section className="ops-panel space-y-3 p-4 text-sm text-[var(--securist-muted)]">
        <div className="ops-label">Use boundaries</div>
        <p>
          Use public sources and authorized targets only. Do not treat model,
          package, or GeoIP information as a claim about an individual,
          household, or protected system.
        </p>
        <p>
          Artifact Profile status is evidence-bound decision support, not legal,
          regulatory, or security certification.
        </p>
        <Link to="/legal" className="ops-btn inline-flex no-underline">
          Read acceptable use
        </Link>
      </section>
    </div>
  )
}
