import { isUsableImageUrl, toHttpImageUrl } from './ipfs'

export interface PumpLiveStats {
  marketCapUsd: number
  /** Rough USD liquidity from SOL (or quote) reserves in the bonding curve / DEX. */
  liquidityUsd: number
  bondingProgress: number
  complete: boolean
  volume24hUsd?: number
  priceUsd?: number
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
  if (sol <= 0) return 0
  const mcapUsd = num(raw.usd_market_cap ?? raw.market_cap_usd ?? raw.market_cap)
  const mcapQuote = num(raw.market_cap_quote)
  // Prefer quote-denominated mcap when present (SOL units).
  if (mcapQuote > 0 && mcapUsd > 0 && mcapQuote !== mcapUsd) {
    return sol * (mcapUsd / mcapQuote)
  }
  // fallback ~$150 SOL if price unknown
  return sol * 150
}

function bondingFromCoin(raw: Record<string, unknown>): number {
  if (raw.complete === true) return 100
  // Graduated to PumpSwap / Raydium — treat as bonded.
  if (raw.pump_swap_pool || raw.raydium_pool) return 100
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
    marketCapUsd: num(raw.usd_market_cap ?? raw.market_cap_usd ?? raw.market_cap),
    liquidityUsd: liquidityFromCoin(raw),
    bondingProgress: bondingFromCoin(raw),
    complete: raw.complete === true || Boolean(raw.pump_swap_pool || raw.raydium_pool),
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

function parseDexPair(pair: Record<string, unknown>): PumpLiveStats | null {
  const liquidity = pair.liquidity as Record<string, unknown> | undefined
  const volume = pair.volume as Record<string, unknown> | undefined
  const marketCapUsd = num(pair.marketCap ?? pair.fdv)
  const liquidityUsd = num(liquidity?.usd)
  const priceUsd = num(pair.priceUsd)
  const volume24hUsd = num(volume?.h24)
  // No pair data worth showing
  if (marketCapUsd <= 0 && liquidityUsd <= 0 && priceUsd <= 0) return null

  const dexId = typeof pair.dexId === 'string' ? pair.dexId.toLowerCase() : ''
  const labels = Array.isArray(pair.labels)
    ? pair.labels.map((l) => String(l).toLowerCase())
    : []
  const onPump = dexId.includes('pump') || labels.some((l) => l.includes('pump'))
  // Graduated / non-pump DEX → bonded; still on pump curve → unknown progress (keep 0, not fake)
  const complete = !onPump && (marketCapUsd > 0 || liquidityUsd > 0)
  const bondingProgress = complete ? 100 : 0

  const baseToken = pair.baseToken as Record<string, unknown> | undefined
  const name = typeof baseToken?.name === 'string' ? baseToken.name.trim() : undefined
  const symbol = typeof baseToken?.symbol === 'string' ? baseToken.symbol.trim() : undefined

  return {
    marketCapUsd,
    liquidityUsd,
    bondingProgress,
    complete,
    volume24hUsd: volume24hUsd > 0 ? volume24hUsd : undefined,
    priceUsd: priceUsd > 0 ? priceUsd : undefined,
    name: name || undefined,
    symbol: symbol || undefined,
  }
}

/** DexScreener fallback when Pump single-coin GET is unavailable. */
async function fetchDexScreenerStats(mint: string): Promise<PumpLiveStats | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(mint)}`,
    )
    if (!res.ok) return null
    const data = (await res.json()) as { pairs?: Record<string, unknown>[] | null }
    const pairs = Array.isArray(data.pairs) ? data.pairs : []
    if (pairs.length === 0) return null
    // Prefer Solana pairs, highest liquidity
    const sol = pairs.filter((p) => String(p.chainId || '').toLowerCase() === 'solana')
    const pool = (sol.length ? sol : pairs).slice().sort((a, b) => {
      const la = num((a.liquidity as Record<string, unknown> | undefined)?.usd)
      const lb = num((b.liquidity as Record<string, unknown> | undefined)?.usd)
      return lb - la
    })[0]
    return pool ? parseDexPair(pool) : null
  } catch {
    return null
  }
}

/**
 * Fetch via POST /coins/mints (Pump removed reliable GET /coins/:mint).
 * Proxied as /api/pump-coin/mints in Vite + Vercel/CF.
 */
async function fetchPumpViaMints(mint: string): Promise<PumpLiveStats | null> {
  try {
    const res = await fetch('/api/pump-coin/mints', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ mints: [mint] }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as unknown
    const row = Array.isArray(data)
      ? (data.find(
          (c) =>
            c &&
            typeof c === 'object' &&
            String((c as Record<string, unknown>).mint || '') === mint,
        ) as Record<string, unknown> | undefined)
      : null
    if (!row || typeof row !== 'object') return null
    // Empty / unknown mint — Pump may return {} stubs; require a real name or mcap signal
    const hasSignal =
      typeof row.name === 'string' ||
      row.usd_market_cap != null ||
      row.market_cap != null ||
      row.bonding_curve != null
    if (!hasSignal) return null
    return await parsePumpCoinAsync(row)
  } catch {
    return null
  }
}

/** Legacy GET /coins/:mint — kept as a best-effort try before POST. */
async function fetchPumpViaGet(mint: string): Promise<PumpLiveStats | null> {
  try {
    const res = await fetch(`/api/pump-coin/${encodeURIComponent(mint)}`)
    if (!res.ok) return null
    const raw = (await res.json()) as Record<string, unknown>
    if (!raw || typeof raw !== 'object' || raw.error) return null
    if (raw.statusCode && Number(raw.statusCode) >= 400) return null
    if (!raw.mint && !raw.name && raw.market_cap == null && raw.usd_market_cap == null) {
      return null
    }
    return await parsePumpCoinAsync(raw)
  } catch {
    return null
  }
}

export async function fetchPumpStats(mint: string): Promise<PumpLiveStats | null> {
  const key = mint.trim()
  if (!key) return null
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.stats

  // Prefer working POST /mints; GET is often 404 ("Cannot GET /coins/:mint").
  let stats = await fetchPumpViaMints(key)
  if (!stats) stats = await fetchPumpViaGet(key)
  if (!stats) stats = await fetchDexScreenerStats(key)

  cache.set(key, { at: Date.now(), stats })
  return stats
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
  if (unique.length === 0) return out

  // One bulk POST when possible
  try {
    const res = await fetch('/api/pump-coin/mints', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ mints: unique }),
    })
    if (res.ok) {
      const data = (await res.json()) as unknown
      if (Array.isArray(data)) {
        await Promise.all(
          data.map(async (row) => {
            if (!row || typeof row !== 'object') return
            const r = row as Record<string, unknown>
            const mint = typeof r.mint === 'string' ? r.mint : ''
            if (!mint || !unique.includes(mint)) return
            const hasSignal =
              typeof r.name === 'string' ||
              r.usd_market_cap != null ||
              r.market_cap != null ||
              r.bonding_curve != null
            if (!hasSignal) return
            const stats = await parsePumpCoinAsync(r)
            out.set(mint, stats)
            cache.set(mint, { at: Date.now(), stats })
          }),
        )
      }
    }
  } catch {
    /* fall through to per-mint */
  }

  await Promise.all(
    unique.map(async (mint) => {
      if (out.has(mint)) return
      const s = await fetchPumpStats(mint)
      if (s) out.set(mint, s)
    }),
  )
  return out
}
