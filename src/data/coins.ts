import { getMyLaunch, myLaunchToCoin } from '../lib/myLaunches'

export type Badge = 'VAULT LIVE' | 'Wish-INDEXED' | 'BONDING' | 'PUBLIC MARKER'

export interface Coin {
  id: string
  name: string
  ticker: string
  description: string
  imageGradient: string
  emoji: string
  bondingProgress: number
  marketCap: number
  /** USD liquidity estimate (curve reserves). */
  liquidity: number
  volume24h: number
  holders: number
  creatorFee: number
  badges: Badge[]
  vaultFilled: number
  vaultTarget: number
  markerStatus: 'indexed' | 'pending' | 'none'
  feeRoute: 'vault' | 'creator'
  createdAt: string
  socials: {
    twitter?: string
    telegram?: string
    website?: string
  }
  receipts?: { label: string; hash: string; time: string }[]
  /** Real on-chain launch (from localStorage). */
  isReal?: boolean
  mint?: string
  quoteMint?: string
  quoteTicker?: string
  signature?: string
  /** Vault not deployed yet — show pending label on Inspect. */
  vaultPending?: boolean
  imageUrl?: string
  /** Local JPEG/PNG data-URL thumb of deploy art (survives IPFS gateway failures). */
  imageThumb?: string
  /** Optional spot price in USD for metrics row. */
  priceUsd?: number
  /** Demo/preview coin — chart uses mock SVG, not live embed. */
  isDemo?: boolean
}

/** No catalog coins — feed is real launches only (demo is /coin/demo, never injected). */
export const coins: Coin[] = []

export const DEMO_COIN_ID = 'demo'


/** Rich mock coin so `/coin/demo` can preview the Inspect redesign without a real launch. */
export function getDemoCoin(): Coin {
  return {
    id: DEMO_COIN_ID,
    name: 'Cream Carton',
    ticker: 'CREAM',
    description:
      'Whole-milk vibes, half-and-half chaos. A demo carton so you can taste the coin page before you pour a real launch.',
    imageGradient: 'from-rose-200 via-cream-200 to-rose-100',
    emoji: '🥛',
    bondingProgress: 47,
    marketCap: 42_000,
    liquidity: 18_000,
    volume24h: 95_000,
    holders: 312,
    creatorFee: 1,
    badges: ['BONDING', 'PUBLIC MARKER'],
    vaultFilled: 3.4,
    vaultTarget: 10,
    markerStatus: 'pending',
    feeRoute: 'vault',
    createdAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    socials: {
      twitter: 'https://x.com/wishwell',
      website: 'https://wish.well',
    },
    receipts: [
      {
        label: 'Pump create_v2 (demo)',
        hash: '5Kq9mN2pR…xW7hL',
        time: '2d ago',
      },
      {
        label: 'Fees → well (pending)',
        hash: 'pending…',
        time: '—',
      },
      {
        label: 'Public marker attest (demo)',
        hash: '3Hn8vB1cT…qM4sY',
        time: '1d ago',
      },
    ],
    isReal: false,
    isDemo: true,
    // Fake-looking base58; chart still uses mock mode because isDemo / id === demo.
    mint: 'CrmCrtnDemo1111111111111111111111111111111',
    quoteTicker: 'SOL',
    vaultPending: true,
    priceUsd: 0.000042,
  }
}

export function getCoin(id: string): Coin | undefined {
  if (id === DEMO_COIN_ID) return getDemoCoin()
  const launch = getMyLaunch(id)
  return launch ? myLaunchToCoin(launch) : undefined
}

export function getAllCoins(extra: Coin[] = []): Coin[] {
  const map = new Map<string, Coin>()
  for (const c of extra) map.set(c.id, c)
  return [...map.values()]
}

export function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export function formatSol(n: number): string {
  return `${n.toFixed(2)} SOL`
}

/** Pretty-print a tiny USD price like $0.000042. */
export function formatPriceUsd(n: number): string {
  if (n <= 0) return '—'
  if (n >= 1) return `$${n.toFixed(2)}`
  if (n >= 0.01) return `$${n.toFixed(4)}`
  // Keep significant digits for micro prices
  const s = n.toFixed(8).replace(/0+$/, '').replace(/\.$/, '')
  return `$${s}`
}

export function truncateMint(mint: string, head = 4, tail = 4): string {
  if (mint.length <= head + tail + 1) return mint
  return `${mint.slice(0, head)}…${mint.slice(-tail)}`
}
