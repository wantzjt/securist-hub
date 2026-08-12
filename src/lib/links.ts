/** Short-link registry + reserved tokens. */
export const RESERVED_TOKENS = [
  'about',
  'terms',
  'legal',
  'security',
  'models',
  'daemon',
  'tools',
  'use-cases',
  'activity',
  'links',
  'ecosystem',
  'hwihf',
  'api',
] as const

export type ShortLink = {
  token: string
  target: string
  label: string
  opsRole: string
}

/** Public short links — field stage proof. */
export const SHORT_LINKS: ShortLink[] = [
  {
    token: 'hwihf',
    target: 'https://huggingface.co/securist',
    label: 'HF org slug (provision when live — not claimed)',
    opsRole: 'Field proof',
  },
  {
    token: 'gh',
    target: 'https://github.com/Securist-InfoSec',
    label: 'GitHub org Securist-InfoSec',
    opsRole: 'Contribute',
  },
  {
    token: 'models',
    target: '/models',
    label: 'Models HQ (internal)',
    opsRole: 'Discover',
  },
  {
    token: 'scout',
    target: '/daemon',
    label: 'GH Scout (internal)',
    opsRole: 'Discover',
  },
]

export function findLink(token: string): ShortLink | undefined {
  const t = token.toLowerCase()
  if ((RESERVED_TOKENS as readonly string[]).includes(t) && t !== 'hwihf') {
    // reserved site routes — not short-links except hwihf proof token
    return undefined
  }
  return SHORT_LINKS.find((l) => l.token === t)
}
