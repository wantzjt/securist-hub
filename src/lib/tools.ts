/** Public tools catalog — dual-forge peers + all package slugs. */
import { REPOS } from './packages'

export type ToolEntry = {
  id: string
  name: string
  lane: 'github' | 'huggingface' | 'bridge'
  opsRole: string
  href: string
  summary: string
}

const packageTools: ToolEntry[] = REPOS.map((r) => ({
  id: r.id,
  name: r.id,
  lane: r.id === 'tarx-bridge' ? 'bridge' : 'github',
  opsRole: r.opsRole,
  href: r.siteHref,
  summary: r.summary,
}))

export const TOOLS: ToolEntry[] = [
  {
    id: 'gh-scout',
    name: 'GitHub Scout',
    lane: 'github',
    opsRole: 'Discover',
    href: '/daemon',
    summary:
      'Public repos only. Rate-limited. legal_risk tags. Agent setup prompts. Org Securist-InfoSec (beachheads are scaffolds).',
  },
  {
    id: 'hf-model-scout',
    name: 'HF Model Scout',
    lane: 'huggingface',
    opsRole: 'Discover',
    href: '/models',
    summary:
      'Public models via hub search (User-Agent securist-scout). seed_only fallback if empty.',
  },
  ...packageTools,
  {
    id: 'ops-activity',
    name: 'Activity',
    lane: 'bridge',
    opsRole: 'Field',
    href: '/activity',
    summary: 'Activity merge: GH Scout + HF Scout + model_pull + package events.',
  },
]
