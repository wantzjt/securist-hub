import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { hitShortLink } from '#/lib/activity-api'

const HF = 'https://huggingface.co/securist'

export const Route = createFileRoute('/hwihf')({
  component: HwihfRedirect,
})

function HwihfRedirect() {
  useEffect(() => {
    void hitShortLink({ data: { token: 'hwihf' } }).finally(() => {
      window.location.replace(HF)
    })
  }, [])

  return (
    <div className="ops-panel p-6 text-[12px] text-[var(--securist-muted)]">
      Field proof · ledger tick · redirecting to HF house…
      <br />
      <a className="ops-accent" href={HF}>
        {HF}
      </a>
    </div>
  )
}
