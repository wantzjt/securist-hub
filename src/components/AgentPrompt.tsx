import { useState } from 'react'

export function AgentPrompt({
  title,
  prompt,
}: {
  title: string
  prompt: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="ops-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--securist-border)] px-3 py-2">
        <span className="ops-label">{title}</span>
        <button type="button" className="ops-btn" onClick={copy}>
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </div>
      <pre className="ops-pre m-0 max-h-56 overflow-y-auto bg-black/40 p-3 text-[var(--securist-muted)]">
        {prompt}
      </pre>
    </div>
  )
}
