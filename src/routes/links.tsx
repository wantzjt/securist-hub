import { createFileRoute, Link } from '@tanstack/react-router'
import { getLinksPage, hitShortLink } from '#/lib/activity-api'
import { CopyPage } from '#/components/CopyPage'
import { useState } from 'react'

export const Route = createFileRoute('/links')({
  loader: () => getLinksPage(),
  component: LinksPage,
})

function LinksPage() {
  const data = Route.useLoaderData()
  const [msg, setMsg] = useState<string | null>(null)

  async function fire(token: string, target: string) {
    const res = await hitShortLink({ data: { token } })
    if (res.ok) {
      setMsg(`Ledger tick: /${token} → ${res.target}`)
      if (target.startsWith('http')) {
        window.open(target, '_blank', 'noreferrer')
      } else {
        window.location.href = target
      }
    } else {
      setMsg(`Blocked: ${res.error}`)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="ops-label">Field · link intelligence</div>
          <h1 className="text-2xl font-semibold tracking-[0.06em] text-white uppercase">
            Links
          </h1>
          <p className="max-w-2xl text-sm text-[var(--securist-muted)]">
            Short links write the site ledger (field stage). Proof token{' '}
            <code className="ops-accent">/hwihf</code> → HF house. Public source
            only.
          </p>
        </div>
        <CopyPage
          title="Links"
          body="Proof: /hwihf → huggingface.co/securist"
        />
      </header>

      {msg ? (
        <p className="ops-panel p-3 text-[12px] ops-accent">{msg}</p>
      ) : null}

      <section className="ops-panel p-3 sm:p-4">
        <h2 className="ops-label mb-3">Short links</h2>
        <ul className="space-y-2">
          {data.links.map((l) => (
            <li
              key={l.token}
              className="flex flex-wrap items-center justify-between gap-2 border border-[var(--securist-border)] bg-black/30 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm text-white">/{l.token}</div>
                <div className="text-[11px] text-[var(--securist-muted)] break-all">
                  {l.label} · {l.target}
                </div>
              </div>
              <button
                type="button"
                className="ops-btn ops-btn-solid"
                onClick={() => fire(l.token, l.target)}
              >
                Fire + ledger
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="ops-label mb-2">Recent ledger</h2>
        {data.ledger.length === 0 ? (
          <p className="text-[12px] text-[var(--securist-muted)]">
            Empty this process — fire a short link or open{' '}
            <Link to="/hwihf" className="ops-accent">
              /hwihf
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-1 text-[11px] text-[var(--securist-muted)]">
            {data.ledger.map((e) => (
              <li key={e.id} className="ops-panel px-3 py-2">
                <span className="ops-accent">{e.kind}</span> {e.path}{' '}
                {e.detail ? `· ${e.detail}` : ''} ·{' '}
                {new Date(e.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
