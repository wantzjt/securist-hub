const DISPATCHES = [
  'PERMISSION FOR CODE AND MODELS',
  'VERSION-BOUND DECISIONS · FORCED RE-REVIEW',
  'PUBLIC ASSESS · LIVE',
  'LOCAL OPERATOR · CODE STAYS LOCAL',
  'TEAM GOVERNANCE · COMING NEXT',
]

/** Product-first editorial strip — separate from Activity evidence. */
export function DispatchTape() {
  return (
    <div className="border-b border-[var(--securist-border)] bg-[var(--securist-contract-black)]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 overflow-hidden px-3 py-1.5 sm:px-4">
        <span className="ops-label shrink-0 text-[var(--securist-accent)]">
          Dispatch
        </span>
        <div
          className="min-w-0 overflow-hidden whitespace-nowrap text-[10px] tracking-[0.1em] text-[var(--securistel)] uppercase"
          aria-hidden="true"
        >
          {DISPATCHES.join('  ·  ')}
        </div>
      </div>
    </div>
  )
}
