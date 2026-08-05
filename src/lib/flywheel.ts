/**
 * Dual-forge flywheel — GH Scout + HF Scout + model_pull + packages.
 * Public org events only. Never personal-handle themed on public UI.
 */

import { BRAND } from './brand'

export type FlywheelSource =
  | 'gh_scout'
  | 'hf_scout'
  | 'model_pull'
  | 'org'
  | 'implementer'
  | 'package'
  | 'seed'

export type FlywheelEvent = {
  id: string
  source: FlywheelSource
  stage: string
  title: string
  detail?: string
  url?: string
  /** Display label only — never personal handles */
  actor?: string
  repo?: string
  createdAt: string
}

export const SEED_EVENTS: FlywheelEvent[] = [
  {
    id: 'seed-securist-boot',
    source: 'seed',
    stage: 'discover',
    title: 'Securist dual-forge hub online',
    detail: 'GitHub code lane + Hugging Face model lane on one ops board.',
    actor: BRAND.productHouse,
    repo: 'hub',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-gh-scout',
    source: 'gh_scout',
    stage: 'discover',
    title: 'GH Scout: public org package inventory',
    detail: 'scout-daemon legal_risk tags · public repos only · rate-limited.',
    actor: 'gh-scout',
    repo: 'scout-daemon',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'seed-hf-scout',
    source: 'hf_scout',
    stage: 'discover',
    title: 'HF Scout: CTI / NER query pack',
    detail:
      'Public hub search via huggingface.co/api · User-Agent securist-scout.',
    actor: 'hf-model-scout',
    repo: 'securist',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'seed-model-pull',
    source: 'model_pull',
    stage: 'field',
    title: 'model_pull: BGE small EN offline fielding',
    detail:
      'Operator-controlled cache · license reviewed · no rehost · TARX-local.',
    actor: 'field-agent',
    repo: 'BAAI/bge-small-en-v1.5',
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 'seed-model-pull-gguf',
    source: 'model_pull',
    stage: 'field',
    title: 'model_pull: GGUF quant for sovereign SOC lab',
    detail: 'Offline pull success + docs · no dark phone-home on weights.',
    actor: 'field-agent',
    repo: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'seed-implementer',
    source: 'implementer',
    stage: 'package',
    title: 'Implementer SDK contract freeze',
    detail: 'AUP + legal-use headers · package telemetry only.',
    actor: 'implementer-sdk',
    repo: 'implementer-sdk',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'seed-tarx',
    source: 'package',
    stage: 'field',
    title: 'tarx-bridge: upstream-only field notes',
    detail: 'Local private runtime integrate — do not vendor TARX.',
    actor: 'tarx-bridge',
    repo: 'tarx-bridge',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'seed-redirect',
    source: 'package',
    stage: 'discover',
    title: 'redirect-intel beachhead published',
    detail: 'Public redirect / infrastructure signals · legal_risk tags.',
    actor: 'redirect-intel',
    repo: 'redirect-intel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'seed-sovereignty',
    source: 'package',
    stage: 'compound',
    title: 'sovereignty-lab-kit checklist freeze',
    detail: 'Local-first evidence defaults · pairs with GGUF model_pull.',
    actor: 'sovereignty-lab-kit',
    repo: 'sovereignty-lab-kit',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'seed-ecosystem-prompts',
    source: 'package',
    stage: 'package',
    title: 'ecosystem-prompts dual-forge pack',
    detail: 'Agent prompts with securist org + ethics gates for GH and HF.',
    actor: 'ecosystem-prompts',
    repo: 'ecosystem-prompts',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
  },
  {
    id: 'seed-geolite',
    source: 'package',
    stage: 'package',
    title: 'geolite2-bridge MaxMind honesty note',
    detail: 'City/ASN only · no household GeoIP claims.',
    actor: 'geolite2-bridge',
    repo: 'geolite2-bridge',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
]

type GhEvent = {
  id: string
  type: string
  actor?: { login?: string }
  repo?: { name?: string }
  created_at?: string
}

function mapOrgEvent(e: GhEvent): FlywheelEvent {
  const type = e.type || 'Event'
  const repo = e.repo?.name
  let title = type.replace(/Event$/, '')
  if (type === 'PushEvent') title = `Org push: ${repo ?? 'repo'}`
  if (type === 'CreateEvent') title = `Org create: ${repo ?? 'resource'}`
  if (type === 'PublicEvent') title = `Open-sourced: ${repo ?? 'repo'}`
  if (type === 'ReleaseEvent') title = `Release: ${repo ?? 'repo'}`

  return {
    id: `gh-org-${e.id}`,
    source: 'org',
    stage: 'contribute',
    title,
    detail: 'Public org event only',
    url: repo ? `https://github.com/${repo}` : undefined,
    actor: BRAND.githubOrg,
    repo,
    createdAt: e.created_at || new Date().toISOString(),
  }
}

async function fetchOrgEvents(org: string, token?: string): Promise<GhEvent[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'securist-scout',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(
      `https://api.github.com/orgs/${org}/events?per_page=15`,
      { headers },
    )
    if (!res.ok) return []
    return (await res.json()) as GhEvent[]
  } catch {
    return []
  }
}

export async function loadFlywheelEvents(options?: {
  token?: string
  org?: string
  limit?: number
}): Promise<{
  events: FlywheelEvent[]
  live: boolean
  sources: string[]
}> {
  const org = options?.org || BRAND.githubOrg
  const token = options?.token
  const limit = options?.limit ?? 40

  const orgEv = await fetchOrgEvents(org, token)
  const liveMapped = orgEv.map(mapOrgEvent)
  const live = liveMapped.length > 0

  const sources = new Set<string>([
    'seed',
    'gh_scout',
    'hf_scout',
    'model_pull',
    'implementer',
    'package',
  ])
  if (live) sources.add('org')

  const merged = [...liveMapped, ...SEED_EVENTS]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit)

  return { events: merged, live, sources: [...sources] }
}

export async function loadPulse(token?: string) {
  const { events, live } = await loadFlywheelEvents({ token, limit: 8 })
  return { events, live }
}
