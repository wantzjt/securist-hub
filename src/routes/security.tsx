import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'

export const Route = createFileRoute('/security')({
  component: SecurityPage,
})

function SecurityPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="ops-label">Security policy</div>
        <h1 className="text-2xl font-semibold tracking-[0.06em] text-white uppercase">
          Security
        </h1>
        <p className="max-w-2xl text-sm text-[var(--securist-muted)]">
          Public assess, monorepo Operator, and open-source surfaces. Legal
          public-source / authorized testing only.
        </p>
      </header>

      <section className="ops-panel p-4">
        <h2 className="ops-label">Reporting</h2>
        <p className="mt-2 text-[12px] text-[var(--securist-muted)]">
          Email{' '}
          <a className="ops-accent" href={`mailto:${BRAND.securityEmail}`}>
            {BRAND.securityEmail}
          </a>{' '}
          with affected surface, impact, and legal reproduction steps. Do not
          open public issues for unfixed security problems.
        </p>
      </section>

      <section className="ops-panel p-4">
        <h2 className="ops-label">Dual-forge supply chain</h2>
        <ul className="mt-2 list-disc space-y-2 pl-4 text-[12px] text-[var(--securist-muted)]">
          <li>
            <strong className="text-white">GitHub lane:</strong> public org
            packages only; Scout is rate-limited; legal_risk tags; no private
            repo access.
          </li>
          <li>
            <strong className="text-white">Hugging Face lane:</strong> public
            hub APIs via User-Agent securist-scout; model card license review
            required before fielding; operator-controlled cache only — never
            illegal rehost.
          </li>
          <li>
            <strong className="text-white">TARX:</strong> upstream local private
            runtime. Integrate; do not vendor. Model fielding = offline pull +
            docs; no dark phone-home on weights.
          </li>
          <li>
            <strong className="text-white">Geo:</strong> MaxMind GeoLite2
            honesty — city/ASN class signals only. No household GeoIP claims.
          </li>
          <li>
            <strong className="text-white">Telemetry:</strong> implementer
            package telemetry only. Weights stay offline on operator metal.
          </li>
        </ul>
      </section>

      <section className="ops-panel p-4">
        <h2 className="ops-label">License review</h2>
        <p className="mt-2 text-[12px] text-[var(--securist-muted)]">
          Every HF catalog row and Scout prompt requires license / card review
          before pull. Prefer explicit OSS licenses. When uncertain, legalRisk =
          review and stop.
        </p>
      </section>

      <section className="ops-panel p-4">
        <h2 className="ops-label">Crypto-agility inventory (posture)</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
          Where TLS / transport applies, Securist inventory prefers hybrid
          post-quantum / traditional key agreement{' '}
          <strong className="text-white">X25519MLKEM768</strong> (ML-KEM-768
          combined with X25519; hybrid KEM design in the class documented by{' '}
          <span className="text-white">RFC 10024</span>
          -family hybrid TLS work). This is an{' '}
          <strong className="text-white">inventory posture</strong> for what
          environments should track — not a product claim and not quantum-fear
          marketing.
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-4 text-[12px] text-[var(--securist-muted)]">
          <li>
            <strong className="text-white">Operator does not negotiate ML-KEM:</strong>{' '}
            the free Local Operator does{' '}
            <em className="text-white">not</em> currently perform hybrid PQ/T
            key agreement or advertise X25519MLKEM768 as a runtime capability.
          </li>
          <li>
            <strong className="text-white">Release signing remains Ed25519:</strong>{' '}
            Operator release identity is signed with Ed25519 against the packaged
            public trust root — separate from transport KEM inventory.
          </li>
          <li>
            <strong className="text-white">Public assess TLS:</strong> edge/origin
            terminate TLS as configured by the host (Vercel / CDN). Inventory
            preference does not rewrite edge cipher suites from this page.
          </li>
        </ul>
      </section>

      <section className="ops-panel p-4">
        <h2 className="ops-label">Edge + origin controls (live)</h2>
        <ul className="mt-2 list-disc space-y-2 pl-4 text-[12px] text-[var(--securist-muted)]">
          <li>
            <strong className="text-white">Transport:</strong> HSTS
            preload-class max-age, HTTPS only, TLS ≥ 1.2 at edge when Cloudflare
            is in path.
          </li>
          <li>
            <strong className="text-white">Browser isolation:</strong> CSP
            (default-src self; no frames), X-Frame-Options DENY, COOP/CORP
            same-origin, nosniff, locked Permissions-Policy.
          </li>
          <li>
            <strong className="text-white">Vercel WAF:</strong> deny common
            exploit probes (wp-admin, .env, .git, phpunit, aws creds);
            rate-limit aggressive clients; deny empty UA on write methods.
          </li>
          <li>
            <strong className="text-white">Disclosure:</strong>{' '}
            <a className="ops-accent" href="/.well-known/security.txt">
              /.well-known/security.txt
            </a>
          </li>
          <li>
            <strong className="text-white">Cloudflare:</strong> nameservers
            live; Full (strict) SSL, Always HTTPS, Rocket Loader off, security
            level high — see DEPLOY.md / scripts/cloudflare-secure-securist.sh.
          </li>
        </ul>
      </section>

      <section className="ops-panel p-4">
        <h2 className="ops-label">Out of scope</h2>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] text-[var(--securist-muted)]">
          <li>
            Unauthorized access, credential stuffing, malware distribution
          </li>
          <li>Private multiplayer spy networks</li>
          <li>Consulting marketplace or sales funnels</li>
          <li>Personal contributor marketing on public surfaces</li>
        </ul>
      </section>

      <p className="text-[12px] text-[var(--securist-muted)]">
        Ethics / AUP:{' '}
        <Link to="/legal" className="ops-accent">
          /legal
        </Link>
      </p>
    </article>
  )
}
