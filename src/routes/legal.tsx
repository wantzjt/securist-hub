import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'

export const Route = createFileRoute('/legal')({
  component: LegalPage,
})

function LegalPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="ops-label">Acceptable use</div>
        <h1 className="text-2xl font-semibold tracking-[0.06em] text-white uppercase">
          Legal
        </h1>
        <p className="text-sm text-[var(--securist-muted)]">{BRAND.posture}</p>
      </header>

      <section className="ops-panel p-4">
        <h2 className="ops-label">AUP</h2>
        <ul className="mt-2 list-disc space-y-2 pl-4 text-[12px] text-[var(--securist-muted)]">
          <li>Public sources and systems you are authorized to use only</li>
          <li>No unauthorized access, malware, or exploit weaponization</li>
          <li>Respect Hugging Face model card licenses; no illegal rehost</li>
          <li>
            MaxMind GeoLite2: city/ASN honesty — no household GeoIP claims
          </li>
          <li>
            TARX: upstream integration only — do not vendor proprietary surfaces
          </li>
        </ul>
      </section>

      <section className="ops-panel p-4">
        <h2 className="ops-label">Contact</h2>
        <p className="mt-2 text-[12px] text-[var(--securist-muted)]">
          Ops:{' '}
          <a className="ops-accent" href={`mailto:${BRAND.email}`}>
            {BRAND.email}
          </a>
        </p>
        <p className="mt-2 text-[12px]">
          <Link to="/security" className="ops-accent">
            Security policy →
          </Link>
        </p>
      </section>
    </article>
  )
}
