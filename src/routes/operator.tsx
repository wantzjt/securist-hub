import { createFileRoute, Link } from '@tanstack/react-router'
import { BRAND } from '#/lib/brand'
import {
  OPEN_BUILD_REPO_URL,
  OPERATOR_COMMANDS,
  OPERATOR_DISTRIBUTION_STATUS,
  OPERATOR_RC_COMMANDS,
  OPERATOR_RELEASE_URL,
  PRODUCT_SENTENCE,
} from '#/lib/product-surface'
import { ADMISSION_PACK_LIST } from '#/lib/admission-packs'
import { CopyPage } from '#/components/CopyPage'

export const Route = createFileRoute('/operator')({
  component: OperatorPage,
})

const MONOREPO_STEPS = [
  { title: 'Clone the monorepo', cmd: OPERATOR_COMMANDS.clone },
  { title: 'Install dependencies', cmd: OPERATOR_COMMANDS.install },
  { title: 'Build the Operator CLI', cmd: OPERATOR_COMMANDS.build },
  { title: 'Doctor (trust status)', cmd: OPERATOR_COMMANDS.doctor },
  { title: 'Assess the current directory', cmd: OPERATOR_COMMANDS.assess },
] as const

const RC_STEPS = [
  { title: 'Fetch signed Release assets', cmd: OPERATOR_RC_COMMANDS.download },
  {
    title: 'Verify SHA-256 checksums',
    cmd: OPERATOR_RC_COMMANDS.verifyChecksum,
  },
  { title: 'Unpack the signed RC tarball', cmd: OPERATOR_RC_COMMANDS.unpack },
  { title: 'Set a private SECURIST_HOME', cmd: OPERATOR_RC_COMMANDS.home },
  {
    title: 'Doctor — expect Runtime verified',
    cmd: OPERATOR_RC_COMMANDS.doctor,
  },
  { title: 'First local Decision Brief', cmd: OPERATOR_RC_COMMANDS.assess },
] as const

function OperatorPage() {
  const monorepoBlock = MONOREPO_STEPS.map(
    (s) => `# ${s.title}\n${s.cmd}`,
  ).join('\n\n')
  const rcBlock = RC_STEPS.map((s) => `# ${s.title}\n${s.cmd}`).join('\n\n')

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="ops-label">Product · Local Operator</div>
          <span className="ops-chip ops-chip-local">Local</span>
          <span className="ops-chip">Not public npm</span>
          <span className="ops-chip">{OPERATOR_RC_COMMANDS.statusLabel}</span>
        </div>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-[0.04em] text-white sm:text-3xl">
          Keep private code local.
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--securist-muted)]">
          {PRODUCT_SENTENCE} The free Local Operator is a{' '}
          <strong className="font-medium text-white">Node CLI</strong>
          —not an Electron desktop app, not a cloud uploader, not public{' '}
          <code className="text-[12px] text-white">npx</code>.
        </p>
      </header>

      <section className="ops-panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="ops-label">Monorepo</div>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            {OPERATOR_DISTRIBUTION_STATUS.monorepo}
          </p>
        </div>
        <div>
          <div className="ops-label">Signed RC</div>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--securist-muted)]">
            {OPERATOR_DISTRIBUTION_STATUS.signedRc}
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
            {OPERATOR_DISTRIBUTION_STATUS.publicNpx}.{' '}
            {OPERATOR_DISTRIBUTION_STATUS.teamGraph}.
          </p>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="path-a-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="ops-label">
              Path A · available to everyone today
            </div>
            <h2
              id="path-a-heading"
              className="text-sm font-semibold tracking-[0.1em] text-white uppercase"
            >
              Monorepo commands
            </h2>
          </div>
          <CopyPage
            title="Securist Local Operator — monorepo"
            body={monorepoBlock}
          />
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
          Clone the open hub, build the CLI, then run doctor/assess. Unsigned
          monorepo builds fail closed until a human signs a release identity for
          that artifact set.
        </p>
        <ol className="space-y-3">
          {MONOREPO_STEPS.map((step, i) => (
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

      <section className="space-y-3" aria-labelledby="path-b-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="ops-label">
              Path B · about five minutes from signed GitHub Release
            </div>
            <h2
              id="path-b-heading"
              className="text-sm font-semibold tracking-[0.1em] text-white uppercase"
            >
              Signed GitHub Release candidate
            </h2>
          </div>
          <CopyPage
            title="Securist Local Operator — Path B signed Release"
            body={rcBlock}
          />
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
          Skilled operators can finish Path B in about five minutes. Use signed
          pre-release tag operator-v0.1.0-rc.1 on the hub. Check SHA256SUMS,
          unpack the RC tarball, set a private home, run doctor against the
          Ed25519 trust root (expect Runtime verified), then assess for a first
          local Decision Brief. No monorepo build. Follow the six steps below
          for the clean-machine path. Release:{' '}
          <a
            className="ops-accent"
            href={OPERATOR_RELEASE_URL}
            target="_blank"
            rel="noreferrer"
          >
            {OPERATOR_RELEASE_URL}
          </a>
          . Still not a public registry install path.
        </p>
        <ol className="space-y-3">
          {RC_STEPS.map((step, i) => (
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
          {OPERATOR_RC_COMMANDS.note}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="ops-panel space-y-2 p-4">
            <div className="ops-label">Trust root honesty</div>
            <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
              Doctor verifies an Ed25519 signature over the packaged artifacts
              using the shipped{' '}
              <code className="text-white">trust-root.pem</code>. We do not
              claim ML-KEM (or other PQC) signing for Operator releases.
            </p>
          </div>
          <div className="ops-panel space-y-2 p-4">
            <div className="ops-label">Human-readable failures</div>
            <ul className="list-disc space-y-1.5 pl-4 text-[12px] leading-relaxed text-[var(--securist-muted)]">
              <li>
                <span className="text-white">Bad or missing signature</span> —
                doctor reports signature_invalid / Runtime unavailable; do not
                treat the build as verified; assess stays blocked.
              </li>
              <li>
                <span className="text-white">Wrong runtime / platform</span> —
                this Release is a portable Node CLI (Node.js 20 or newer), not
                an OS-native binary. Missing Node or Node &lt; 20 fails with a
                clear engines message before doctor runs.
              </li>
              <li>
                <span className="text-white">Checksum mismatch</span> — stop and
                re-fetch Release assets; do not unpack a bad tarball.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="packs-heading">
        <div className="ops-label">WO-031 · scaffolds</div>
        <h2
          id="packs-heading"
          className="text-sm font-semibold tracking-[0.1em] text-white uppercase"
        >
          Admission packs
        </h2>
        <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
          Three versioned packs (coding agent, MCP server, model/weights) fill
          intended use and unknown/gap defaults. Not a compliance certification.
          Team Graph is not live. No PQC claim.
        </p>
        <div className="grid gap-3 lg:grid-cols-3">
          {ADMISSION_PACK_LIST.map((pack) => (
            <div key={pack.id} className="ops-panel space-y-2 p-4">
              <div className="ops-label">
                {pack.id}@{pack.version}
              </div>
              <h3 className="text-sm font-semibold text-white">{pack.title}</h3>
              <p className="text-[12px] leading-relaxed text-[var(--securist-muted)]">
                {pack.summary}
              </p>
              <pre className="ops-pre text-[var(--securist-accent)]">
                {'securist assess . --pack ' + pack.id}
              </pre>
              <p className="text-[10px] text-[var(--securist-muted)]">
                Sample: {pack.sampleSources[0]?.url}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--securist-muted)]">
          List packs with --list-packs. --intended-use overrides the pack
          prompt. Unknown and gap defaults still apply. See
          docs/ADMISSION-PACKS.md.
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
            From a signed RC directory use{' '}
            <code className="text-white">{OPERATOR_RC_COMMANDS.mcp}</code>.
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
            <li>
              What should happen next—and who owns it? (durable after Team
              Graph)
            </li>
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
            not published. Path B uses the published signed RC; package remains
            private.
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
            Human-signed release candidates and clean-machine verification live
            in the monorepo release lane (WO-018–WO-021). Contact{' '}
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
