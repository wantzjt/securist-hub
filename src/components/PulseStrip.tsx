import type { FlywheelEvent } from '#/lib/flywheel'

const SOURCE_LABEL: Record<string, string> = {
  gh_scout: 'GH Scout',
  hf_scout: 'HF Scout',
  model_pull: 'model_pull',
  org: 'org',
  implementer: 'implementer',
  package: 'package',
  seed: 'seed',
}

export function PulseStrip({
  events,
  live,
  title = 'Dual-forge pulse',
}: {
  events: FlywheelEvent[]
  live: boolean
  title?: string
}) {
  return (
    <section aria-label={title} className="ops-panel p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="ops-label">{title}</h2>
        <span className={`ops-chip ${live ? 'ops-chip-live' : ''}`}>
          {live ? 'org live + seed' : 'seed mode'}
        </span>
      </div>
      <ul className="space-y-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex items-start gap-2.5 border border-[var(--securist-border)] bg-black/30 px-2.5 py-2"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--securist-accent)]" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] leading-snug text-[#e8e8ec] break-words">
                {e.title}
              </div>
              {e.detail ? (
                <p className="mt-0.5 text-[11px] text-[var(--securist-muted)] break-words">
                  {e.detail}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-[var(--securistel)]">
                <span className="ops-accent">
                  {SOURCE_LABEL[e.source] || e.source}
                </span>
                <span>{e.stage}</span>
                {e.repo ? <span className="break-all">{e.repo}</span> : null}
                <span>{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
