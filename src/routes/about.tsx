import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({ component: AboutPage })

function AboutPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="ops-label">Securist · product truth</div>
        <h1 className="mt-1 text-xl font-semibold tracking-[0.08em] text-white uppercase">
          About
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--securist-muted)]">
          Securist is an intelligence-to-action layer for security engineering:
          discover a public artifact, understand it in plain English, validate
          it locally, contribute or integrate responsibly, and retain share-safe
          evidence.
        </p>
      </header>

      <section className="ops-panel space-y-3 p-4 text-sm text-[var(--securist-muted)]">
        <div className="ops-label">Upstream and downstream</div>
        <p>
          Prefer upstream PRs, documentation, and connectors. Downstream
          packages are narrow bridges—not an ecosystem fork farm.
        </p>
        <p>
          GitHub is the code lane; Hugging Face is the public model lane. Local
          validation remains operator-controlled; TARX is an optional upstream
          runtime integration, never a required Securist dependency.
        </p>
      </section>

      <section className="ops-panel space-y-3 p-4 text-sm text-[var(--securist-muted)]">
        <div className="ops-label">Decision Graph</div>
        <p>
          Artifact Profiles record the evidence, policy, validation, and
          contribution context behind a decision. Activity projects those facts;
          it is not a social timeline.
        </p>
        <Link to="/artifacts" className="ops-btn inline-flex no-underline">
          Open Artifact Profiles
        </Link>
      </section>
    </div>
  )
}
