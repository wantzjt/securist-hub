import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getModelsPage, getHfScout } from '#/lib/activity-api'
import { CatalogCard } from '#/components/CatalogCard'
import { CopyPage } from '#/components/CopyPage'
import type { HfScoutResult } from '#/lib/hf-scout'

export const Route = createFileRoute('/models')({
  loader: () => getModelsPage(),
  component: ModelsPage,
})

function ModelsPage() {
  const initial = Route.useLoaderData()
  const [scout, setScout] = useState<HfScoutResult>(initial.scout)
  const [packId, setPackId] = useState(initial.scout.packId)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)

  // Auto re-scout on pack change (no "Run" CTA)
  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      if (packId === initial.scout.packId && scout.hits.length) return
      setBusy(true)
      try {
        const res = await getHfScout({ data: { packId } })
        if (!controller.signal.aborted) setScout(res)
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    })()
    return () => {
      controller.abort()
    }
  }, [initial.scout.packId, packId, scout.hits.length])

  const catalog = useMemo(() => {
    const rows = scout.curated.length ? scout.curated : initial.curated
    const qq = q.trim().toLowerCase()
    if (!qq) return rows
    return rows.filter((r) =>
      `${r.title} ${r.repoId} ${r.infosecUse} ${r.legalRisk}`
        .toLowerCase()
        .includes(qq),
    )
  }, [scout.curated, initial.curated, q])

  const hits = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return scout.hits
    return scout.hits.filter((h) =>
      `${h.modelId} ${h.pipeline_tag || ''}`.toLowerCase().includes(qq),
    )
  }, [scout.hits, q])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Discover · models</div>
          <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase">
            Models
          </h1>
          <p className="mt-1 text-[11px] text-[var(--securistel)]">
            Auto-scout on load ·{' '}
            <span className={scout.mode === 'live' ? 'ops-accent' : ''}>
              {scout.mode}
            </span>
            {busy ? ' · refreshing…' : ''} · pack {scout.packId}
          </p>
        </div>
        <CopyPage title="Models" />
      </header>

      <div className="flex flex-wrap gap-1.5">
        {initial.packs.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`ops-btn ${packId === p.id ? 'ops-btn-solid' : ''}`}
            onClick={() => setPackId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter hits + catalog…"
        className="w-full border border-[var(--securist-border)] bg-black/40 px-3 py-2 font-mono text-[12px] text-white outline-none focus:border-[var(--securist-accent)]"
        aria-label="Filter models"
      />

      {scout.note ? (
        <p className="text-[11px] text-amber-200/80">{scout.note}</p>
      ) : null}

      <section className="ops-panel overflow-x-auto p-0">
        <div className="border-b border-[var(--securist-border)] px-3 py-2 ops-label">
          Hub hits · {hits.length}
        </div>
        {hits.length === 0 ? (
          <p className="px-3 py-3 text-[12px] text-[var(--securist-muted)]">
            No live hits — curated catalog below remains authoritative.
          </p>
        ) : (
          <table className="w-full min-w-[480px] text-left text-[11px]">
            <tbody>
              {hits.map((h) => (
                <tr
                  key={h.id || h.modelId}
                  className="border-t border-[var(--securist-border)]"
                >
                  <td className="px-3 py-2">
                    <a
                      href={`https://huggingface.co/${h.modelId}`}
                      className="break-all font-mono text-white no-underline hover:underline"
                      rel="noreferrer"
                      target="_blank"
                    >
                      {h.modelId}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-[var(--securist-muted)]">
                    {h.pipeline_tag || '—'}
                  </td>
                  <td className="px-3 py-2 text-[var(--securistel)]">
                    {typeof h.downloads === 'number' ? `dl ${h.downloads}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <div className="mb-2 ops-label">Curated catalog · {catalog.length}</div>
        <div className="grid gap-3 lg:grid-cols-2">
          {catalog.map((row) => (
            <CatalogCard key={row.id} row={row} />
          ))}
        </div>
      </section>

      <p className="text-[11px] text-[var(--securist-muted)]">
        TARX field notes · operator cache only ·{' '}
        <Link to="/daemon" className="ops-accent">
          Scout
        </Link>{' '}
        ·{' '}
        <Link to="/activity" className="ops-accent">
          Activity
        </Link>
      </p>
    </div>
  )
}
