import { QUOTES_FALLBACK_URL, QUOTES_LIVE_URL } from './constants'

export type QuoteCategory = 'native' | 'stable' | 'stock' | 'crypto' | 'commodity' | 'other'

export interface QuoteToken {
  mint: string
  decimals: number
  symbol: string
  ticker: string
  imageUrl: string
  priceUsd: number
  liquidityUsd: number
  category: QuoteCategory
  featured: boolean
}

const CATS = new Set<QuoteCategory>(['native', 'stable', 'stock', 'crypto', 'commodity', 'other'])

function normalize(raw: unknown): QuoteToken | null {
  if (!raw || typeof raw !== 'object') return null
  const q = raw as Record<string, unknown>
  const mint = String(q.mint ?? '')
  const ticker = String(q.ticker ?? q.symbol ?? '')
  if (!mint || !ticker) return null
  const cat = String(q.category ?? 'other') as QuoteCategory
  return {
    mint,
    decimals: Number(q.decimals ?? 6),
    symbol: String(q.symbol ?? ticker),
    ticker,
    imageUrl: String(q.imageUrl ?? ''),
    priceUsd: Number(q.priceUsd ?? 0),
    liquidityUsd: Number(q.liquidityUsd ?? 0),
    category: CATS.has(cat) ? cat : 'other',
    featured: Boolean(q.featured),
  }
}

async function fetchJson(url: string): Promise<QuoteToken[]> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Quotes fetch failed (${res.status})`)
  const data = (await res.json()) as { quotes?: unknown[] } | unknown[]
  const list = Array.isArray(data) ? data : data.quotes
  if (!Array.isArray(list)) throw new Error('Unexpected quotes payload')
  return list.map(normalize).filter((q): q is QuoteToken => q != null)
}

export async function loadQuotes(): Promise<{ quotes: QuoteToken[]; source: string }> {
  try {
    const quotes = await fetchJson(QUOTES_LIVE_URL)
    if (quotes.length > 0) return { quotes, source: 'live · launchondeep.com' }
  } catch {
    // fall through
  }
  const quotes = await fetchJson(QUOTES_FALLBACK_URL)
  return { quotes, source: 'local pump-quotes.json' }
}

export function filterQuotes(
  quotes: QuoteToken[],
  opts: { category?: QuoteCategory | 'all'; query?: string },
): QuoteToken[] {
  const q = (opts.query ?? '').trim().toLowerCase()
  return quotes.filter((item) => {
    if (opts.category && opts.category !== 'all' && item.category !== opts.category) return false
    if (!q) return true
    return (
      item.ticker.toLowerCase().includes(q) ||
      item.symbol.toLowerCase().includes(q) ||
      item.mint.toLowerCase().includes(q)
    )
  })
}
