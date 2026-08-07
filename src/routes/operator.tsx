import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'
import {
  OPEN_BUILD_REPO_URL,
  OPERATOR_COMMANDS,
  PRODUCT_SENTENCE,
} from '#/lib/product-surface'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/operator')({
  component: OperatorPage,
})

const STEPS = [
  { title: 'Clone the monorepo', cmd: OPERATOR_COMMANDS.clone },
  { title: 'Install dependencies', cmd: OPERATOR_COMMANDS.install },
  { title: 'Build the Operator CLI', cmd: OPERATOR_COMMANDS.build },
  { title: 'Doctor (trust status)', cmd: OPERATOR_COMMANDS.doctor },
  { title: 'Assess the current directory', cmd: OPERATOR_COMMANDS.assess },
] as const

function OperatorPage() {
  const commandsBlock = STEPS.map((s) => `# ${s.title}\n${s.cmd}`).join('\n\n')

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="ops-label">Product · Local Operator</div>
          <span className="ops-chip ops-chip-local">Local</span>
          <span className="ops-chip">Not public npm</span>
        </div>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-[0.04em] text-white sm:text-3xl">
          Keep private code local.
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--securist-muted)]">
          {PRODUCT_SENTENCE} The free Local Operator is a{' '}
          <strong className="font-medium text-white">Node CLI</strong> in the
          Securist monorepo—not an Electron desktop app, not a cloud uploader.
        </p>
      </header>

      <section className="ops-panel grid gap-3 p-4 sm:grid-cols-3">
        <div>
          <div className="ops-label">Available today</div>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Source in the monorepo. Build + run{' '}
            <code className="text-[11px] text-white">securist doctor</code> /{' '}
            <code className="text-[11px] text-white">securist assess .</code>
          </p>
        </div>
        <div>
          <div className="ops-label">Trust gate</div>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Without a release-signed runtime identity, doctor reports{' '}
            <span className="text-white">runtime_unavailable</span> and assess
            is blocked. That is intentional.
          </p>
        </div>
        <div>
          <div className="ops-label">Not available</div>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Public <code className="text-[11px]">npx @securist/operator</code>,
            signed package install claims, Team Graph sync, or automatic share
            of local briefs.
          </p>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="run-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="ops-label">Developer path</div>
            <h2
              id="run-heading"
              className="text-sm font-semibold tracking-[0.1em] text-white uppercase"
            >
              Monorepo commands
            </h2>
          </div>
          <CopyPage title="Securist Local Operator commands" body={commandsBlock} />
        </div>
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="ops-panel p-4">
              <div className="ops-label">
                {String(i + 1).padStart(2, '0')} · {step.title}
              </div>
              <pre className="ops-pre mt-2 text-[var(--securist-accent)]">
                {step.cmd}
              </pre>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-[var(--securist-muted)]">
          {OPERATOR_COMMANDS.note}
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="ops-panel space-y-2 p-4">
          <div className="ops-label">MCP (stdio · local)</div>
          <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
            After a successful local assess, IDE agents can read a minimized
            brief over stdio only:
          </p>
          <pre className="ops-pre text-[var(--securist-accent)]">
            {OPERATOR_COMMANDS.mcp}
          </pre>
          <p className="text-[11px] text-[var(--securist-muted)]">
            Tools: <code className="text-white">get_brief</code>,{' '}
            <code className="text-white">list_gaps</code>,{' '}
            <code className="text-white">get_run_metadata</code>. No execute,
            approve, shell, or external write tools.
          </p>
        </div>
        <div className="ops-panel space-y-2 p-4">
          <div className="ops-label">What a Decision Brief answers</div>
          <ol className="list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            <li>What is this artifact?</li>
            <li>What did Securist actually observe?</li>
            <li>What remains unknown?</li>
            <li>What should happen next—and who owns it? (durable after Team Graph)</li>
          </ol>
          <p className="text-[11px] text-[var(--securist-muted)]">
            Local briefs are <span className="text-white">local_only</span> and
            never automatically shareable.
          </p>
        </div>
      </section>

      <section className="ops-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="ops-label">Source</div>
          <p className="mt-1 text-[12px] text-[var(--securist-muted)]">
            Monorepo package{' '}
            <code className="text-white">@securist/operator</code> · private ·
            not published.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={OPEN_BUILD_REPO_URL}
            className="ops-btn no-underline"
            target="_blank"
            rel="noreferrer"
          >
            Open monorepo
          </a>
          <Link to="/assess" className="ops-btn ops-btn-solid no-underline">
            Assess a public repo first
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="ops-panel p-4">
          <div className="ops-label">Why teams pay later</div>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Free path is individual and private. Paid Team Graph is shared
            memory: owners, policy, evidence, and re-review when artifacts
            change—not token metering.
          </p>
          <Link to="/team" className="ops-btn mt-3 inline-flex no-underline">
            Team Graph (coming next)
          </Link>
        </div>
        <div className="ops-panel p-4">
          <div className="ops-label">Release honesty</div>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            Human-signed release candidates and clean-machine verification are
            documented in the monorepo release lane. Contact{' '}
            <a className="ops-accent" href={`mailto:${BRAND.email}`}>
              {BRAND.email}
            </a>{' '}
            for design-partner questions—no unsolicited private data.
          </p>
        </div>
      </section>
    </div>
  )
}
