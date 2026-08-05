import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getHomeData } from '#/lib/activity-api'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()
  const [q, setQ] = useState('')
  const [lane, setLane] = useState<'all' | 'github' | 'huggingface' | 'bridge'>(
    'all',
  )

  const filteredPkgs = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return data.packages.filter((p) => {
      if (qq && !`${p.id} ${p.summary} ${p.opsRole}`.toLowerCase().includes(qq))
        return false
      return true
    })
  }, [data.packages, q])

  const filteredModels = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return data.curated.filter((m) => {
      if (
        qq &&
        !`${m.title} ${m.repoId} ${m.infosecUse} ${m.queryPack}`
          .toLowerCase()
          .includes(qq)
      )
        return false
      return true
    })
  }, [data.curated, q])

  const filteredTools = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return data.tools.filter((t) => {
      if (lane !== 'all' && t.lane !== lane) return false
      if (qq && !`${t.id} ${t.name} ${t.summary}`.toLowerCase().includes(qq))
        return false
      return true
    })
  }, [data.tools, q, lane])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ops-label">Catalog console</div>
          <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase sm:text-2xl">
            {data.productHub}
          </h1>
          <p className="mt-1 text-[11px] text-[var(--securistel)]">
            Auto-boot · scout warm · activity merge
            {data.boot.throttled ? ' · throttled' : ''} · pulse{' '}
            <span className="ops-accent">{data.pulse.mode}</span>
            {typeof data.boot.hfHits === 'number'
              ? ` · hf hits ${data.boot.hfHits}`
              : ''}
          </p>
        </div>
        <CopyPage
          title="Catalog"
          body={`mode=${data.pulse.mode}\npkgs=${data.packages.map((p) => p.id).join(',')}`}
        />
      </header>

      {/* Source status — not marketing pills */}
      <div className="grid grid-cols-3 gap-2">
        {data.pulse.sourceCards.map((c) => (
          <div
            key={c.id}
            className="border border-[var(--securist-border)] bg-[var(--securist-panel)] px-2 py-2"
          >
            <div className="ops-label truncate">{c.label}</div>
            <div className="mt-1 flex justify-between font-mono text-[12px]">
              <span
                className={
                  c.status === 'live'
                    ? 'ops-accent'
                    : 'text-[var(--securist-muted)]'
                }
              >
                {c.status}
              </span>
              <span className="text-white">{c.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter catalog…"
          className="min-w-[12rem] flex-1 border border-[var(--securist-border)] bg-black/40 px-3 py-2 font-mono text-[12px] text-white outline-none focus:border-[var(--securist-accent)]"
          aria-label="Filter catalog"
        />
        {(['all', 'github', 'huggingface', 'bridge'] as const).map((l) => (
          <button
            key={l}
            type="button"
            className={`ops-btn ${lane === l ? 'ops-btn-solid' : ''}`}
            onClick={() => setLane(l)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Packages table */}
      <section className="ops-panel overflow-x-auto p-0">
        <div className="border-b border-[var(--securist-border)] px-3 py-2 ops-label">
          Packages · {filteredPkgs.length}
        </div>
        <table className="w-full min-w-[560px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-[var(--securist-border)] text-[var(--securistel)]">
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Clone</th>
            </tr>
          </thead>
          <tbody>
            {filteredPkgs.map((p) => (
              <tr
                key={p.id}
                className="border-t border-[var(--securist-border)]"
              >
                <td className="px-3 py-2">
                  <Link
                    to="/tools"
                    className="font-mono text-white no-underline hover:ops-accent"
                  >
                    {p.id}
                  </Link>
                </td>
                <td className="px-3 py-2 text-[var(--securist-muted)]">
                  {p.opsRole}
                </td>
                <td className="ops-pre px-3 py-2 text-[10px] text-[var(--securist-muted)]">
                  {p.clone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Models table */}
      <section className="ops-panel overflow-x-auto p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--securist-border)] px-3 py-2">
          <span className="ops-label">Models · {filteredModels.length}</span>
          <Link
            to="/models"
            className="text-[10px] uppercase tracking-wide ops-accent no-underline"
          >
            open models
          </Link>
        </div>
        <table className="w-full min-w-[520px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-[var(--securist-border)] text-[var(--securistel)]">
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Hub id</th>
              <th className="px-3 py-2 font-medium">Risk</th>
              <th className="px-3 py-2 font-medium">Scope</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((m) => (
              <tr
                key={m.id}
                className="border-t border-[var(--securist-border)]"
              >
                <td className="px-3 py-2 text-white">{m.title}</td>
                <td className="px-3 py-2 font-mono text-[var(--securist-muted)] break-all">
                  {m.repoId}
                </td>
                <td className="px-3 py-2 text-[var(--securist-muted)]">
                  {m.legalRisk}
                </td>
                <td className="px-3 py-2 text-[var(--securistel)]">
                  {m.catalogScope}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tools / surfaces table */}
      <section className="ops-panel overflow-x-auto p-0">
        <div className="border-b border-[var(--securist-border)] px-3 py-2 ops-label">
          Surfaces · {filteredTools.length}
        </div>
        <table className="w-full min-w-[480px] text-left text-[11px]">
          <tbody>
            {filteredTools.map((t) => (
              <tr
                key={t.id}
                className="border-t border-[var(--securist-border)]"
              >
                <td className="px-3 py-2">
                  <Link
                    to={t.href.startsWith('/') ? t.href.split('#')[0] : '/'}
                    className="text-white no-underline hover:underline"
                  >
                    {t.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-[var(--securistel)]">{t.lane}</td>
                <td className="px-3 py-2 text-[var(--securist-muted)]">
                  {t.opsRole}
                </td>
                <td className="px-3 py-2 text-[var(--securist-muted)]">
                  {t.summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Activity slice — not marketing stages */}
      <section className="ops-panel p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="ops-label">Activity</span>
          <Link
            to="/activity"
            className="text-[10px] uppercase ops-accent no-underline"
          >
            open
          </Link>
        </div>
        <ul className="space-y-1">
          {data.pulse.events.slice(0, 6).map((e) => (
            <li
              key={e.id}
              className="border border-[var(--securist-border)] bg-black/20 px-2 py-1.5 text-[11px]"
            >
              <span className="ops-accent">{e.source}</span>{' '}
              <span className="text-white">{e.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
