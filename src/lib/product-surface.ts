/**
 * Developer-native public surface copy (WO-017 / WO-019).
 * Website/UI only — not Decision Graph contracts.
 * Never claim Team Graph live, public npx, approval, scan, pentest, or Electron.
 */

/** Canonical product sentence (BUYER-MESSAGING / D-011). */
export const PRODUCT_SENTENCE =
  'Securist tells teams what their humans and coding agents may bring into production—and reopens that permission when reality changes.' as const

export const HERO = {
  label: 'Permission system',
  title: 'Permission for code and models.',
  subtitle:
    'Know what may enter production. Reopen the decision when it changes.',
  primaryCta: 'Assess a public repository',
  secondaryCta: 'See a Decision Brief',
} as const

export const BUYER_OUTCOME =
  'Stop approvals silently outliving the version, policy, evidence, or use case that justified them.' as const

/** Public hub monorepo (not a personal handle surface). */
export const OPEN_BUILD_REPO_URL =
  'https://github.com/wantzjt/securist-hub' as const

/** Product primary nav destinations (WO-019). */
export const PRODUCT_NAV = [
  { to: '/assess' as const, label: 'Assess' },
  { to: '/operator' as const, label: 'Local Operator' },
  { to: '/team' as const, label: 'Team Graph', badge: 'Coming next' as const },
] as const

export const LADDER = [
  {
    id: 'public',
    status: 'live' as const,
    statusLabel: 'Live',
    title: 'Assess publicly',
    body: 'Paste a public GitHub URL. Get an immediate, share-safe Decision Brief draft—no account, no private workspace.',
    cta: 'Assess a public repository',
    href: '/assess' as const,
  },
  {
    id: 'private',
    status: 'local' as const,
    statusLabel: 'Local',
    title: 'Assess privately',
    body: 'Keep private code on your machine. Free Local Operator runs from the Securist monorepo today. Public package install is forthcoming after signed distribution—not an Electron app.',
    cta: 'Local Operator guide',
    href: '/operator' as const,
  },
  {
    id: 'team',
    status: 'next' as const,
    statusLabel: 'Coming next',
    title: 'Govern as a team',
    body: 'Shared permission records, owners, policy, and forced re-review when reality changes. Not a live multi-user workspace yet.',
    cta: 'Team Graph (coming next)',
    href: '/team' as const,
  },
] as const

/** Static homepage preview — seed illustration only, not a live approval. */
export const SAMPLE_BRIEF_PREVIEW = {
  artifactName: 'scout-daemon',
  artifactId: 'art-scout-daemon',
  decisionStatus: 'not_reviewed',
  decisionStatusLabel: 'Not reviewed',
  label: 'SEED',
  scope: {
    intendedUse: 'Public CTI discovery tooling in a controlled research lab',
    environment: 'research',
    deploymentBoundary: 'local_only',
  },
  observed: [
    {
      domain: 'provenance',
      assertion:
        'Public repository Securist-InfoSec/scout-daemon on default branch (seed profile).',
    },
    {
      domain: 'license',
      assertion: 'License observed on seed profile (verify on source card).',
    },
  ],
  evidenceGaps: ['security', 'model_governance', 'crypto_agility'],
  disclaimer:
    'Illustrative seed Decision Brief—not a production approval, scan, or pentest.',
} as const

export const RESEARCH_LINKS = [
  { to: '/activity' as const, label: 'Activity', hint: 'Sources pulse' },
  { to: '/models' as const, label: 'Models', hint: 'HF research' },
  { to: '/tools' as const, label: 'Packages', hint: 'Tool catalog' },
  { to: '/daemon' as const, label: 'Scout', hint: 'Operator board' },
  { to: '/links' as const, label: 'Links', hint: 'Field ledger' },
] as const

/** Monorepo Local Operator commands (honest — not public npx). */
export const OPERATOR_COMMANDS = {
  clone: `git clone ${OPEN_BUILD_REPO_URL}.git && cd securist-hub`,
  install: 'npm ci',
  build: 'npm run operator:build',
  doctor: 'npm run securist -- doctor',
  assess: 'npm run securist -- assess . --intended-use "Local engineering review"',
  mcp: 'npm run securist -- mcp',
  note: 'Package @securist/operator remains private. Public npx install is not available until a human-signed distribution ships.',
} as const
