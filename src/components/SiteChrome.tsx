import { Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'

type NavItem = { to: string; label: string; exact?: boolean }

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Discover',
    items: [
      { to: '/', label: 'Home', exact: true },
      { to: '/daemon', label: 'Scout' },
      { to: '/models', label: 'Models' },
      { to: '/artifacts', label: 'Profiles' },
    ],
  },
  {
    group: 'Build',
    items: [
      { to: '/tools', label: 'Packages' },
      { to: '/use-cases', label: 'Cases' },
      { to: '/security', label: 'Security' },
    ],
  },
  {
    group: 'Field',
    items: [
      { to: '/activity', label: 'Sources' },
      { to: '/links', label: 'Links' },
      { to: '/daemon', label: 'Operator' },
    ],
  },
]

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-shell min-h-screen bg-[var(--ftw-void)] text-[#e8e8ec]">
      <div className="border-b border-[var(--ftw-border)] bg-black/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-[10px] tracking-[0.12em] text-[var(--ftw-muted)] uppercase sm:px-4">
          <span className="ops-accent">INFOSEC</span>
          <span className="truncate">OSINT · CTI · GEOIP · MODELS · DECISION GRAPH</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-[var(--ftw-border)] bg-[rgba(5,5,6,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 no-underline">
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
              <div className="ops-label truncate">INFOSEC</div>
            </div>
          </Link>
          <nav className="flex max-w-full flex-wrap items-start gap-x-4 gap-y-2">
            {NAV.map((g) => (
              <div key={g.group} className="flex flex-col gap-0.5">
                <span className="ops-label px-1">{g.group}</span>
                <div className="flex flex-wrap gap-0.5">
                  {g.items.map((item) => (
                    <Link
                      key={`${g.group}-${item.to}-${item.label}`}
                      to={item.to}
                      className="rounded-sm px-2 py-1 text-[11px] tracking-[0.1em] text-[var(--ftw-muted)] uppercase no-underline hover:bg-white/5 hover:text-white [&.active]:bg-[var(--ftw-accent-dim)] [&.active]:text-[var(--ftw-accent)]"
                      activeOptions={{ exact: item.exact ?? false }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">{children}</main>

      <footer className="border-t border-[var(--ftw-border)] py-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-3 text-[10px] text-[var(--securistel)] sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="tracking-wide uppercase">
            {BRAND.productHouse} · {BRAND.productHub} ·{' '}
            <Link to="/legal" className="ops-accent no-underline">
              legal
            </Link>
          </p>
          <p className="max-w-md leading-relaxed">{BRAND.posture}</p>
        </div>
      </footer>
    </div>
  )
}
