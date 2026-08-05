/**
 * Pulse control plane — single merge of GitHub + Hugging Face + site ledger.
 * Returns honest source cards: live | empty | error | seed
 */
import { BRAND } from './brand'
import { SEED_EVENTS, type FlywheelEvent } from './flywheel'
import { listLedger } from './site-ledger'

export type SourceStatus = 'live' | 'empty' | 'error' | 'seed'

export type PulseSourceCard = {
  id: 'github' | 'huggingface' | 'site'
  label: string
  status: SourceStatus
  count: number
  detail: string
}

export type FlywheelPulse = {
  mode: 'LIVE' | 'HYBRID' | 'SEED'
  fetchedAt: string
  sources: PulseSourceCard[]
  events: FlywheelEvent[]
  classification: string
  stack: string
}

const UA = 'Securist-Scout (+https://secur.ist; legal public-source only)'
const CACHE_MS = 45_000

let cache: { at: number; pulse: FlywheelPulse } | null = null

type GhEvent = {
  id: string
  type: string
  actor?: { login?: string }
  repo?: { name?: string }
  created_at?: string
}

async function fetchJson(
  url: string,
  headers: Record<string, string>,
  token?: string,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  try {
    const h = { ...headers }
    if (token) h.Authorization = `Bearer ${token}`
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 8000)
    const res = await fetch(url, {
      headers: h,
      signal: ac.signal,
    }).finally(() => clearTimeout(timer))
    if (!res.ok) return { ok: false, status: res.status, data: null }
    return { ok: true, status: res.status, data: await res.json() }
  } catch {
    return { ok: false, status: 0, data: null }
  }
}

function mapOrgEvent(e: GhEvent): FlywheelEvent {
  const type = e.type || 'Event'
  const repo = e.repo?.name
  let title = type.replace(/Event$/, '')
  if (type === 'PushEvent') title = `Org push: ${repo ?? 'repo'}`
  if (type === 'CreateEvent') title = `Org create: ${repo ?? 'resource'}`
  if (type === 'PublicEvent') title = `Open-sourced: ${repo ?? 'repo'}`
  if (type === 'ReleaseEvent') title = `Release: ${repo ?? 'repo'}`
  if (type === 'WatchEvent') title = `Star: ${repo ?? 'repo'}`
  return {
    id: `gh-org-${e.id}`,
    source: 'org',
    stage: 'contribute',
    title,
    detail: 'Public securist event',
    url: repo ? `https://github.com/${repo}` : undefined,
    actor: BRAND.githubOrg,
    repo,
    createdAt: e.created_at || new Date().toISOString(),
  }
}

async function loadGithubPlane(token?: string): Promise<{
  status: SourceStatus
  events: FlywheelEvent[]
  detail: string
}> {
  const org = BRAND.githubOrg
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': UA,
    'X-GitHub-Api-Version': '2022-11-28',
  }

  // Prefer org events; fallback user public events; fallback recent repos
  let r = await fetchJson(
    `https://api.github.com/orgs/${org}/events?per_page=20`,
    headers,
    token,
  )
  if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
    return {
      status: 'live',
      events: (r.data as GhEvent[]).map(mapOrgEvent),
      detail: `orgs/${org}/events`,
    }
  }

  r = await fetchJson(
    `https://api.github.com/users/${org}/events/public?per_page=20`,
    headers,
    token,
  )
  if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
    return {
      status: 'live',
      events: (r.data as GhEvent[]).map(mapOrgEvent),
      detail: `users/${org}/events/public`,
    }
  }

  r = await fetchJson(
    `https://api.github.com/orgs/${org}/repos?sort=pushed&per_page=10`,
    headers,
    token,
  )
  if (r.ok && Array.isArray(r.data) && r.data.length > 0) {
    const events: FlywheelEvent[] = (r.data as Array<Record<string, unknown>>).map(
      (repo, i) => ({
        id: `gh-repo-${repo.id || i}`,
        source: 'org' as const,
        stage: 'package',
        title: `Repo active: ${repo.name}`,
        detail: 'Recent push order from org repos API',
        url: String(repo.html_url || `https://github.com/${org}/${repo.name}`),
        actor: BRAND.githubOrg,
        repo: `${org}/${repo.name}`,
        createdAt: String(repo.pushed_at || new Date().toISOString()),
      }),
    )
    return { status: 'live', events, detail: `orgs/${org}/repos?sort=pushed` }
  }

  if (r.status === 0 || (r.status >= 400 && r.status !== 404)) {
    return { status: 'error', events: [], detail: `GitHub API status ${r.status}` }
  }
  return { status: 'empty', events: [], detail: 'No public org events yet' }
}

async function loadHfPlane(): Promise<{
  status: SourceStatus
  events: FlywheelEvent[]
  detail: string
}> {
  const r = await fetchJson(
    'https://huggingface.co/api/models?search=cybersecurity&limit=8',
    { Accept: 'application/json', 'User-Agent': UA },
  )
  if (!r.ok) {
    return {
      status: r.status === 0 ? 'error' : 'empty',
      events: [],
      detail: `HF API status ${r.status}`,
    }
  }
  const rows = r.data as Array<Record<string, unknown>>
  if (!rows?.length) {
    return { status: 'empty', events: [], detail: 'HF search empty' }
  }
  const events: FlywheelEvent[] = rows.slice(0, 8).map((row, i) => {
    const id = String(row.id || row.modelId || i)
    return {
      id: `hf-live-${id}`,
      source: 'hf_scout',
      stage: 'discover',
      title: `HF Scout hit: ${id}`,
      detail: 'Public hub search · securist-scout',
      url: `https://huggingface.co/${id}`,
      actor: 'hf-model-scout',
      repo: id,
      createdAt: new Date(Date.now() - i * 60_000).toISOString(),
    }
  })
  return { status: 'live', events, detail: 'huggingface.co/api/models search' }
}

function loadSitePlane(): {
  status: SourceStatus
  events: FlywheelEvent[]
  detail: string
} {
  const ledger = listLedger(20)
  if (!ledger.length) {
    return {
      status: 'empty',
      events: [],
      detail: 'No redirect/access ticks this process',
    }
  }
  const events: FlywheelEvent[] = ledger.map((e) => ({
    id: e.id,
    source: e.kind === 'implementer_tick' ? 'implementer' : 'seed',
    stage: 'field',
    title: `${e.kind}: ${e.path}`,
    detail: e.detail || 'Site ledger',
    actor: 'site-ledger',
    repo: e.path,
    createdAt: e.createdAt,
  }))
  return { status: 'live', events, detail: `${ledger.length} ledger events` }
}

export async function getFlywheelPulse(options?: {
  token?: string
  force?: boolean
}): Promise<FlywheelPulse> {
  const now = Date.now()
  if (!options?.force && cache && now - cache.at < CACHE_MS) {
    return cache.pulse
  }

  const token = options?.token
  const [gh, hf] = await Promise.all([loadGithubPlane(token), loadHfPlane()])
  const site = loadSitePlane()

  const sources: PulseSourceCard[] = [
    {
      id: 'github',
      label: 'GitHub securist',
      status: gh.status === 'empty' && SEED_EVENTS.length ? 'seed' : gh.status,
      count: gh.events.length || (gh.status === 'empty' ? SEED_EVENTS.filter((e) => e.source === 'gh_scout' || e.source === 'org' || e.source === 'package').length : 0),
      detail: gh.detail,
    },
    {
      id: 'huggingface',
      label: 'Hugging Face',
      status: hf.status === 'empty' ? 'seed' : hf.status,
      count: hf.events.length || SEED_EVENTS.filter((e) => e.source === 'hf_scout' || e.source === 'model_pull').length,
      detail: hf.detail,
    },
    {
      id: 'site',
      label: 'Site ledger',
      status: site.status === 'empty' ? 'seed' : site.status,
      count: site.events.length,
      detail: site.detail,
    },
  ]

  // Fix counts when seed fallback displayed for GH/HF
  if (sources[0].status === 'seed') {
    sources[0].count = SEED_EVENTS.filter((e) =>
      ['gh_scout', 'org', 'package', 'implementer'].includes(e.source),
    ).length
  }
  if (sources[1].status === 'seed') {
    sources[1].count = SEED_EVENTS.filter((e) =>
      ['hf_scout', 'model_pull'].includes(e.source),
    ).length
  }

  const liveBits = [gh.status === 'live', hf.status === 'live', site.status === 'live']
  const liveCount = liveBits.filter(Boolean).length
  const mode: FlywheelPulse['mode'] =
    liveCount === 0 ? 'SEED' : liveCount === 3 ? 'LIVE' : 'HYBRID'

  const seedFallback =
    gh.status !== 'live' || hf.status !== 'live' ? SEED_EVENTS : []

  const events = [...gh.events, ...hf.events, ...site.events, ...seedFallback]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 50)

  const pulse: FlywheelPulse = {
    mode,
    fetchedAt: new Date().toISOString(),
    sources,
    events,
    classification: 'INFOSEC',
    stack: 'INFOSEC · OSINT · CTI · GEOIP · MODELS',
  }
  cache = { at: now, pulse }
  return pulse
}
