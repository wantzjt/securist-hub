/**
 * HF Model Scout — public hub search only.
 * User-Agent: securist-scout · timeouts · rate-aware · seed fallback.
 */

import { CURATED_HF, HF_QUERY_PACKS } from './hf-catalog'
import type { HfCatalogRow } from './hf-catalog'

const HF_API = 'https://huggingface.co/api'
const UA = 'Securist-Scout (+https://secur.ist; legal public-source only)'
const TIMEOUT_MS = 8_000

export type HfLiveHit = {
  id: string
  modelId: string
  pipeline_tag?: string
  likes?: number
  downloads?: number
  tags?: string[]
  library_name?: string
}

export type HfScoutResult = {
  mode: 'live' | 'seed_only'
  packId: string
  query: string
  hits: HfLiveHit[]
  curated: HfCatalogRow[]
  fetchedAt: string
  note?: string
}

function controller() {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), TIMEOUT_MS)
  return { c, t }
}

export async function searchHfModels(
  query: string,
  limit = 8,
): Promise<HfLiveHit[]> {
  const { c, t } = controller()
  try {
    const url = new URL(`${HF_API}/models`)
    url.searchParams.set('search', query)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('full', 'false')
    url.searchParams.set('config', 'false')

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': UA,
      },
      signal: c.signal,
    })
    if (!res.ok) return []
    const data = (await res.json()) as Array<Record<string, unknown>>
    return data.map((row) => ({
      id: String(row._id || row.id || row.modelId || ''),
      modelId: String(row.id || row.modelId || ''),
      pipeline_tag: row.pipeline_tag as string | undefined,
      likes: row.likes as number | undefined,
      downloads: row.downloads as number | undefined,
      tags: row.tags as string[] | undefined,
      library_name: row.library_name as string | undefined,
    }))
  } catch {
    return []
  } finally {
    clearTimeout(t)
  }
}

export async function runHfScout(packId?: string): Promise<HfScoutResult> {
  const pack = HF_QUERY_PACKS.find((p) => p.id === packId) || HF_QUERY_PACKS[0]
  const hits = await searchHfModels(pack.query, 8)
  const curated = CURATED_HF.filter(
    (r) => r.queryPack === pack.id || !packId,
  ).slice(0, 6)

  if (hits.length === 0) {
    return {
      mode: 'seed_only',
      packId: pack.id,
      query: pack.query,
      hits: [],
      curated: CURATED_HF.slice(0, 5),
      fetchedAt: new Date().toISOString(),
      note: 'HF API empty or rate-limited — showing curated seed catalog.',
    }
  }

  return {
    mode: 'live',
    packId: pack.id,
    query: pack.query,
    hits,
    curated: curated.length ? curated : CURATED_HF.slice(0, 3),
    fetchedAt: new Date().toISOString(),
  }
}

export function catalogById(id: string) {
  return CURATED_HF.find((r) => r.id === id)
}
