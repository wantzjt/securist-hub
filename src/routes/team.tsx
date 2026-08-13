import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'
import { BUYER_OUTCOME, PRODUCT_SENTENCE } from '#/lib/product-surface'
import { getTeamGraphStatus, postTeamGraphReReview } from '#/lib/activity-api'
import type { TeamGraphStubErrorV1 } from '../../packages/contracts/src/team-graph'

export const Route = createFileRoute('/team')({
  loader: () => getTeamGraphStatus(),
  component: TeamGraphPage,
})

function TeamGraphPage() {
  const status = Route.useLoaderData()
  const illustration = status.illustration
  const [reReview, setReReview] = useState<TeamGraphStubErrorV1 | null>(null)
  const [busy, setBusy] = useState(false)

  async function onRequestReReview() {
    setBusy(true)
    try {
      const result = await postTeamGraphReReview({
        data: {
          contractVersion: '1',
          kind: 'team_graph_re_review_request',
          live: false,
          durable: false,
          persistence: 'stub_not_live',
          artifactId: illustration.artifactId,
          artifactVersionId: illustration.artifactVersionId,
          trigger: 'material_version',
          reason:
            'Illustration only — material change would reopen this Decision after R1.',
          requestedBy: 'ui-stub',
        },
      })
      setReReview(result)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="ops-label">Product · Team Graph</div>
          <span className="ops-chip ops-chip-next">Coming next</span>
        </div>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-[0.04em] text-white sm:text-3xl">
          Shared permission under drift.
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--securist-muted)]">
          {PRODUCT_SENTENCE}
        </p>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--securist-muted)]">
          Team Graph is the paid control plane: durable shared decisions with a
          named owner, policy binding, evidence set, and forced re-review when
          reality changes. It is{' '}
          <strong className="text-white">not live</strong>. Contracts are frozen
          (WO-032). A postgres re-review loop exists (WO-033) and does not flip
          this page live. WO-008 human exit remains open.
        </p>
      </header>

      <section className="ops-panel border-[var(--securist-border)] bg-[var(--securist-accent-dim)] p-4 sm:p-5">
        <div className="ops-label text-[var(--securist-accent)]">Why pay</div>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white">
          {BUYER_OUTCOME}
        </p>
        <p className="mt-2 text-[12px] text-[var(--securist-muted)]">
          Free path: assess publicly or keep private code local. Paid path:
          shared organizational memory—not AI token meters.
        </p>
      </section>

      <section className="ops-panel space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="ops-label">Stub API · not live</div>
          <span className="ops-chip ops-chip-next">Coming next</span>
        </div>
        <dl className="grid gap-2 text-[12px] sm:grid-cols-2">
          <div>
            <dt className="ops-label">live</dt>
            <dd className="text-white">{String(status.live)}</dd>
          </div>
          <div>
            <dt className="ops-label">durable</dt>
            <dd className="text-white">{String(status.durable)}</dd>
          </div>
          <div>
            <dt className="ops-label">persistence</dt>
            <dd className="text-white">{status.persistence}</dd>
          </div>
          <div>
            <dt className="ops-label">R1 gate</dt>
            <dd className="text-white">
              {status.r1Gate} · {status.postgresOwner} only
            </dd>
          </div>
        </dl>
        <p className="text-[11px] text-[var(--securist-muted)]">
          GET status / GET one-artifact / POST re-review are stubs. They do not
          read DATABASE_URL and they do not write a Decision Graph row.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="ops-label">One-artifact loop (frozen contract)</div>
          <span className="ops-chip ops-chip-next">Coming next</span>
        </div>
        <p className="max-w-3xl text-[12px] leading-relaxed text-[var(--securist-muted)]">
          Illustration of owner + policy + evidence + re-review on one artifact.
          Status remains{' '}
          <span className="text-white">{illustration.status}</span>. Not a
          production approval. Team Graph is not live.
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          <article className="ops-panel p-4">
            <div className="ops-label">Coming next · Decision</div>
            <h2 className="mt-2 text-[13px] font-semibold tracking-[0.08em] text-white uppercase">
              {illustration.artifactId}
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
              {illustration.summary}
            </p>
          </article>
          <article className="ops-panel p-4">
            <div className="ops-label">Coming next · Owner</div>
            <h2 className="mt-2 text-[13px] font-semibold tracking-[0.08em] text-white uppercase">
              {illustration.owner.displayName}
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
              A named human owns the decision under an explicit policy version.
              Agents may draft; they may not sign.
            </p>
          </article>
          <article className="ops-panel p-4">
            <div className="ops-label">Coming next · Policy</div>
            <h2 className="mt-2 text-[13px] font-semibold tracking-[0.08em] text-white uppercase">
              {illustration.policy.name}
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
              Bound to {illustration.policy.policyId} @{' '}
              {illustration.policy.policyVersion}. Policy binding is not an
              approval.
            </p>
          </article>
          <article className="ops-panel p-4">
            <div className="ops-label">Coming next · Evidence</div>
            <h2 className="mt-2 text-[13px] font-semibold tracking-[0.08em] text-white uppercase">
              Evidence set
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
              Permission binds to the evidence set that justified it—not a wiki
              memory. Illustration record is labeled{' '}
              {illustration.evidence[0]?.verification}.
            </p>
          </article>
        </div>
        <article className="ops-panel space-y-3 p-4">
          <div className="ops-label">Coming next · Re-review on change</div>
          <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Material version, license, boundary, policy, or evidence change
            reopens trust. The stub POST refuses the write and stays not live.
          </p>
          <button
            type="button"
            className="ops-btn"
            disabled={busy}
            onClick={() => void onRequestReReview()}
          >
            {busy ? 'Refusing write…' : 'Request re-review (stub)'}
          </button>
          {reReview ? (
            <p className="text-[12px] text-white">
              {reReview.error}: {reReview.message}
            </p>
          ) : null}
        </article>
      </section>

      <section className="ops-panel space-y-3 p-4">
        <div className="ops-label">What you can do now</div>
        <div className="flex flex-wrap gap-2">
          <Link to="/assess" className="ops-btn ops-btn-solid no-underline">
            Assess a public repository
          </Link>
          <Link to="/operator" className="ops-btn no-underline">
            Local Operator guide
          </Link>
          <Link to="/services" className="ops-btn no-underline">
            Adoption Assurance (secondary)
          </Link>
        </div>
        <p className="text-[11px] text-[var(--securist-muted)]">
          Design partners:{' '}
          <a className="ops-accent" href={`mailto:${BRAND.email}`}>
            {BRAND.email}
          </a>{' '}
          with subject <span className="text-white">design partner</span>—no
          unsolicited private data.
        </p>
      </section>
    </div>
  )
}
