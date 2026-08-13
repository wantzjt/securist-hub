import { Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'
import { DispatchTape } from '#/components/DispatchTape'
import { PRODUCT_NAV, RESEARCH_LINKS } from '#/lib/product-surface'

const linkClass =
  'rounded-sm px-2 py-1 text-[11px] tracking-[0.1em] text-[var(--securist-muted)] uppercase no-underline hover:bg-white/5 hover:text-white [&.active]:bg-[var(--securist-accent-dim)] [&.active]:text-[var(--securist-accent)]'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-shell min-h-screen bg-[var(--securist-void)] text-[#e8e8ec]">
      <div className="no-print border-b border-[var(--securist-border)] bg-black/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-[10px] tracking-[0.12em] text-[var(--securist-muted)] uppercase sm:px-4">
          <span className="ops-accent">Permission system</span>
          <span className="truncate">{BRAND.stack}</span>
        </div>
      </div>
      <header className="no-print sticky top-0 z-40 border-b border-[var(--securist-border)] bg-[rgba(5,5,6,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 no-underline"
          >
            <img
              src={BRAND.logoPath}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-sm"
            />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-semibold tracking-[0.14em] text-white uppercase">
                SECURIST
              </div>
              <div className="ops-label truncate">
                Web · terminal · team (next)
              </div>
            </div>
          </Link>
          <nav
            className="flex max-w-full flex-wrap items-center gap-x-1 gap-y-2 sm:gap-x-2"
            aria-label="Primary"
          >
            {PRODUCT_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${linkClass} inline-flex items-center gap-1.5`}
              >
                {item.label}
                {item.to === '/team' ? (
                  <span className="ops-chip ops-chip-next normal-case tracking-normal">
                    Coming next
                  </span>
                ) : null}
              </Link>
            ))}
            <details className="relative">
              <summary
                className={`${linkClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
              >
                Research
                <span className="ml-1 text-[9px] opacity-70" aria-hidden>
                  ▾
                </span>
              </summary>
              <div
                className="absolute right-0 z-50 mt-1 min-w-[11rem] border border-[var(--securist-border)] bg-[var(--securist-panel)] p-1 shadow-lg sm:left-0 sm:right-auto"
                role="menu"
              >
                {RESEARCH_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    className="block rounded-sm px-2 py-1.5 text-[11px] tracking-[0.08em] text-[var(--securist-muted)] uppercase no-underline hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                    <span className="mt-0.5 block text-[9px] normal-case tracking-normal opacity-70">
                      {item.hint}
                    </span>
                  </Link>
                ))}
              </div>
            </details>
          </nav>
        </div>
      </header>

      <div className="no-print">
        <DispatchTape />
      </div>

      <main id="main" className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </main>

      <footer className="no-print border-t border-[var(--securist-border)] py-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-3 text-[10px] text-[var(--securistel)] sm:px-4">
          <p className="flex flex-wrap gap-x-2 gap-y-1 tracking-wide uppercase">
            <span>{BRAND.productHouse}</span>
            <Link to="/about" className="ops-accent no-underline">
              About
            </Link>
            <Link to="/security" className="ops-accent no-underline">
              Security
            </Link>
            <Link to="/services" className="ops-accent no-underline">
              Services
            </Link>
            <Link to="/terms" className="ops-accent no-underline">
              Terms
            </Link>
            <a
              href={BRAND.hubRepoUrl}
              className="ops-accent no-underline"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </p>
          <p className="max-w-xl leading-relaxed">{BRAND.posture}</p>
          <p className="leading-relaxed">
            Contact:{' '}
            <a
              className="ops-accent normal-case tracking-normal no-underline"
              href={`mailto:${BRAND.email}`}
            >
              {BRAND.email}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
