/**
 * Securist brand — public surface constants only.
 * Never export personal handles for UI rendering.
 */
import { REPOS } from './packages'

export const BRAND = {
  productHouse: 'Securist',
  productHub: 'Securist',
  domain: 'secur.ist',
  hostname:
    (import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined) || 'secur.ist',
  /** CSS uses --securist-accent; do not print hex in public UI copy. */
  accentToken: 'var(--securist-accent)',
  email: 'ops@secur.ist',
  securityEmail: 'security@secur.ist',
  legalEmail: 'legal@secur.ist',
  githubOrg:
    (import.meta.env.VITE_PUBLIC_GITHUB_ORG as string | undefined) ||
    'securist',
  githubUrl:
    (import.meta.env.VITE_PUBLIC_GITHUB_URL as string | undefined) ||
    'https://github.com/securist',
  hfOrg:
    (import.meta.env.VITE_PUBLIC_HF_ORG as string | undefined) || 'securist',
  hfUrl: 'https://huggingface.co/securist',
  /** Cache-bust so CDN/immutable asset deploys pick up brand mark changes */
  logoPath: '/securist-logo.png?v=20260806',
  faviconPath: '/favicon.png?v=20260806',
  /** Product sentence for meta/description (BUYER-MESSAGING). */
  tagline:
    'Permission for code and models. Know what may enter production—and reopen the decision when it changes.',
  posture:
    'Public assess is free. Private code stays local. Shared team governance is next. Legal public-source only.',
  doctrine: 'Assess · Decide · Re-review',
  /** Public header sublabel — product, not classification theater */
  classification: 'PERMISSION',
  stack: 'PERMISSION · CODE · MODELS · DECISION BRIEF · RE-REVIEW',
} as const

/** @deprecated prefer REPOS from packages.ts */
export const GH_PACKAGES = REPOS.map((r) => ({
  id: r.id,
  label: r.id,
  opsRole: r.opsRole,
  description: r.summary,
}))

export const ACTIVITY_STAGES = [
  {
    id: 'discover',
    label: 'Discover',
    detail: 'GH Scout + HF Scout (public only)',
  },
  {
    id: 'contribute',
    label: 'Contribute',
    detail: 'Patches, datasets, eval notes',
  },
  { id: 'package', label: 'Package', detail: 'SDKs, bridges, catalog rows' },
  {
    id: 'field',
    label: 'Field',
    detail: 'Clone repo or pull model to local metal',
  },
  {
    id: 'compound',
    label: 'Compound',
    detail: 'Activity merge + offline evidence',
  },
] as const

/** @deprecated use ACTIVITY_STAGES */
export const FLYWHEEL_STAGES = ACTIVITY_STAGES

export const ROUTE_TOKENS = [
  'about',
  'terms',
  'legal',
  'security',
  'models',
  'daemon',
  'tools',
  'use-cases',
  'services',
  'activity',
  'links',
  'ecosystem',
  'hwihf',
  'artifacts',
] as const
