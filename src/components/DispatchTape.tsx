const DISPATCHES = [
  'PUBLIC SOURCE · AUTHORITATIVE ARTIFACT RECORDS',
  'DECISION GRAPH · VERSION-BOUND APPROVALS',
  'SCOUT · GITHUB + HUGGING FACE',
  'FIELD · LOCAL VALIDATION, SHARE-SAFE EVIDENCE',
  'QUANTUM · INVENTORY BEFORE MIGRATION',
]

/** Factual editorial context, deliberately separate from Activity evidence. */
export function DispatchTape() {
  return (
    <div className="border-b border-[var(--securist-border)] bg-[var(--securist-contract-black)]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 overflow-hidden px-3 py-1.5 sm:px-4">
        <span className="ops-label shrink-0 text-[var(--securist-accent)]">
          Dispatch
        </span>
        <div className="min-w-0 overflow-hidden whitespace-nowrap text-[10px] tracking-[0.1em] text-[var(--securistel)] uppercase">
          {DISPATCHES.join('  ·  ')}
        </div>
      </div>
    </div>
  )
}
