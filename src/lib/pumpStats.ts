import { isUsableImageUrl, toHttpImageUrl } from './ipfs'

export interface PumpLiveStats {
  marketCapUsd: number
  /** Rough USD liquidity from SOL (or quote) reserves in the bonding curve. */
  liquidityUsd: number
  bondingProgress: number
  complete: boolean
  /** Optional coin art from pump API (https). */
  imageUrl?: string
  name?: string
  symbol?: string
}

type CacheEntry = { at: number; stats: PumpLiveStats | null }

const cache = new Map<string, CacheEntry>()
const TTL_MS = 60_000

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Derive USD liquidity from curve reserves + implied SOL price. */
function liquidityFromCoin(raw: Record<string, unknown>): number {
  const realSol = num(raw.real_sol_reserves ?? raw.real_quote_reserves)
  const sol = realSol / 1e9
  const mcapSol = num(raw.market_cap ?? raw.market_cap_quote)
  const mcapUsd = num(raw.usd_market_cap ?? raw.market_cap_usd)
  if (sol <= 0) return 0
  if (mcapSol > 0 && mcapUsd > 0) return sol * (mcapUsd / mcapSol)
  // fallback ~$150 SOL if price unknown
  return sol * 150
}

function bondingFromCoin(raw: Record<string, unknown>): number {
  if (raw.complete === true) return 100
  // Pump starts near ~1.073e15 token reserves; progress rises as real_token_reserves fall.
  const realTok = num(raw.real_token_reserves)
  const start = 1_073_000_000_000_000
  if (realTok <= 0) return 0
  const pct = Math.round(((start - realTok) / start) * 100)
  return Math.max(0, Math.min(99, pct))
}

function normalizeImageCandidate(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined
  const http = toHttpImageUrl(raw)
  return isUsableImageUrl(http) ? http : undefined
}

function imageFromCoin(raw: Record<string, unknown>): string | undefined {
  return (
    normalizeImageCandidate(raw.image_uri) ||
    normalizeImageCandidate(raw.image_url) ||
    normalizeImageCandidate(raw.image)
  )
}

async function imageFromMetadataUri(raw: Record<string, unknown>): Promise<string | undefined> {
  const metaRaw = raw.metadata_uri ?? raw.metadataUri ?? raw.uri
  if (typeof metaRaw !== 'string' || !metaRaw.trim()) return undefined
  const metaHttp = toHttpImageUrl(metaRaw)
  if (!isUsableImageUrl(metaHttp)) return undefined
  try {
    const res = await fetch(metaHttp)
    if (!res.ok) return undefined
    const meta = (await res.json()) as Record<string, unknown>
    return normalizeImageCandidate(meta.image) || normalizeImageCandidate(meta.image_uri)
  } catch {
    return undefined
  }
}

export function parsePumpCoin(raw: Record<string, unknown>): PumpLiveStats {
  const name = typeof raw.name === 'string' ? raw.name.trim() : undefined
  const symbol =
    typeof raw.symbol === 'string'
      ? raw.symbol.trim()
      : typeof raw.ticker === 'string'
        ? raw.ticker.trim()
        : undefined
  return {
    marketCapUsd: num(raw.usd_market_cap ?? raw.market_cap_usd),
    liquidityUsd: liquidityFromCoin(raw),
    bondingProgress: bondingFromCoin(raw),
    complete: raw.complete === true,
    imageUrl: imageFromCoin(raw),
    name: name || undefined,
    symbol: symbol || undefined,
  }
}

/** Full parse including metadata_uri JSON image fallback. */
export async function parsePumpCoinAsync(
  raw: Record<string, unknown>,
): Promise<PumpLiveStats> {
  const base = parsePumpCoin(raw)
  if (base.imageUrl) return base
  const fromMeta = await imageFromMetadataUri(raw)
  return fromMeta ? { ...base, imageUrl: fromMeta } : base
}

export async function fetchPumpStats(mint: string): Promise<PumpLiveStats | null> {
  const key = mint.trim()
  if (!key) return null
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.stats

  try {
    const res = await fetch(`/api/pump-coin/${encodeURIComponent(key)}`)
    if (!res.ok) {
      cache.set(key, { at: Date.now(), stats: null })
      return null
    }
    const raw = (await res.json()) as Record<string, unknown>
    const stats = await parsePumpCoinAsync(raw)
    cache.set(key, { at: Date.now(), stats })
    return stats
  } catch {
    cache.set(key, { at: Date.now(), stats: null })
    return null
  }
}

/** Bypass cache — useful right after create when Pump may lag. */
export async function fetchPumpStatsFresh(mint: string): Promise<PumpLiveStats | null> {
  const key = mint.trim()
  if (!key) return null
  cache.delete(key)
  return fetchPumpStats(key)
}

export async function fetchPumpStatsMany(
  mints: string[],
): Promise<Map<string, PumpLiveStats>> {
  const out = new Map<string, PumpLiveStats>()
  const unique = [...new Set(mints.filter(Boolean))]
  await Promise.all(
    unique.map(async (mint) => {
      const s = await fetchPumpStats(mint)
      if (s) out.set(mint, s)
    }),
  )
  return out
}
