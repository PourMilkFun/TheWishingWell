import {MY_LAUNCHES_CHANGED, MY_LAUNCHES_KEY, isPlaceholderMint } from './constants'
import { isUsableImageUrl } from './ipfs'
import type { Badge, Coin } from '../data/coins'
import { SITE_LAUNCHES } from '../data/siteLaunches'

export interface MyLaunch {
  id: string
  mint: string
  name: string
  ticker: string
  description: string
  imageUrl: string
  /** Local JPEG/PNG data-URL of the exact file used to deploy (survives IPFS failures). */
  imageThumb?: string
  /** IPFS/http metadata JSON URI from Pump upload (optional; used for image backfill). */
  metadataUri?: string
  creatorFee: number
  quoteMint: string
  quoteTicker: string
  pairMode: 'sol' | 'usdc' | 'stock'
  signature: string
  createdAt: string
  socials: { twitter?: string; telegram?: string; website?: string }
}

/** Older keys left behind when we wiped the board once (v1→v2→v3). */
const LEGACY_LAUNCH_KEYS = ['milk.myLaunches.v3', 'milk.myLaunches.v2', 'milk.myLaunches.v1'] as const

function parseLaunchList(raw: string | null): MyLaunch[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as MyLaunch[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** If current key is empty, pull the newest non-empty legacy list once (restores after accidental wipe). */
function migrateLegacyLaunchesIfNeeded(): MyLaunch[] {
  const current = parseLaunchList(localStorage.getItem(MY_LAUNCHES_KEY))
  if (current.length > 0) return current

  for (const key of LEGACY_LAUNCH_KEYS) {
    const legacy = parseLaunchList(localStorage.getItem(key))
    if (legacy.length === 0) continue
    localStorage.setItem(MY_LAUNCHES_KEY, JSON.stringify(legacy))
    // Drop legacy copy so we don't double-migrate later
    localStorage.removeItem(key)
    return legacy
  }
  return []
}

function read(): MyLaunch[] {
  try {
    return pruneTestNameDuplicate(migrateLegacyLaunchesIfNeeded())
  } catch {
    return []
  }
}

function write(list: MyLaunch[]) {
  localStorage.setItem(MY_LAUNCHES_KEY, JSON.stringify(list))
}

function mergeSiteLaunches(local: MyLaunch[]): MyLaunch[] {
  const byMint = new Map<string, MyLaunch>()
  for (const s of SITE_LAUNCHES) byMint.set(s.mint, s)
  // Local saves override site seeds for the same mint (e.g. fresher art/signature),
  // but never wipe a good site image with a blank/blob local URL (emoji fallback).
  for (const l of local) {
    const site = byMint.get(l.mint)
    if (!site) {
      byMint.set(l.mint, l)
      continue
    }
    const localImg = (l.imageUrl || '').trim()
    const siteImg = (site.imageUrl || '').trim()
    const keepSiteArt = Boolean(siteImg && isUsableImageUrl(siteImg) && !isUsableImageUrl(localImg))
    byMint.set(l.mint, {
      ...site,
      ...l,
      imageUrl: keepSiteArt ? siteImg : localImg || siteImg,
      imageThumb: keepSiteArt ? site.imageThumb : l.imageThumb || site.imageThumb,
    })
  }
  return [...byMint.values()]
}

export function listMyLaunches(): MyLaunch[] {
  return mergeSiteLaunches(read()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function getMyLaunch(idOrMint: string): MyLaunch | undefined {
  return listMyLaunches().find((l) => l.id === idOrMint || l.mint === idOrMint)
}

export function saveMyLaunch(launch: MyLaunch): void {
  const next = read().filter((l) => l.mint !== launch.mint)
  next.unshift(launch)
  write(next.slice(0, 100))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MY_LAUNCHES_CHANGED))
  }
}

/** Wipe stored launches and notify listeners (empty board). */
export function clearMyLaunches(): void {
  write([])
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MY_LAUNCHES_CHANGED))
  }
}

/** Remove one launch by mint or id. */
export function removeMyLaunch(idOrMint: string): boolean {
  const list = read()
  const next = list.filter((l) => l.id !== idOrMint && l.mint !== idOrMint)
  if (next.length === list.length) return false
  write(next)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MY_LAUNCHES_CHANGED))
  }
  return true
}

/**
 * Drop the short-name "TEST" card when "Test the Wish" ($TEST) is also present.
 * One-shot cleanup after the v2→v3 restore left both on the board.
 */
function pruneTestNameDuplicate(list: MyLaunch[]): MyLaunch[] {
  const ticker = (l: MyLaunch) => l.ticker.replace(/^\$/, '').toUpperCase()
  const keep = list.some(
    (l) => ticker(l) === 'TEST' && l.name.trim() === 'Test the Wish',
  )
  if (!keep) return list
  const pruned = list.filter(
    (l) => !(ticker(l) === 'TEST' && l.name.trim() === 'TEST'),
  )
  if (pruned.length === list.length) return list
  write(pruned)
  return pruned
}

/** Re-add a mint that landed on-chain but never got saved (e.g. confirm timeout). */
export function importMyLaunch(input: {
  mint: string
  name: string
  ticker: string
  description?: string
  imageUrl?: string
  signature?: string
  quoteMint?: string
  quoteTicker?: string
  pairMode?: MyLaunch['pairMode']
  creatorFee?: number
}): MyLaunch {
  const mint = input.mint.trim()
  if (mint.length < 32 || mint.length > 50) {
    throw new Error('Paste a valid Solana mint address')
  }
  const launch: MyLaunch = {
    id: mint,
    mint,
    name: input.name.trim() || 'Imported',
    ticker: input.ticker.trim().replace(/^\$/, '').toUpperCase() || 'COIN',
    description: input.description?.trim() || 'Imported after on-chain create',
    imageUrl: input.imageUrl || '',
    creatorFee: input.creatorFee ?? 0.5,
    quoteMint: input.quoteMint || 'So11111111111111111111111111111111111111112',
    quoteTicker: input.quoteTicker || 'SOL',
    pairMode: input.pairMode || 'sol',
    signature: input.signature?.trim() || 'imported',
    createdAt: new Date().toISOString(),
    socials: {},
  }
  saveMyLaunch(launch)
  return launch
}

const gradients = [
  'from-rose-200 via-cream-200 to-rose-100',
  'from-amber/40 via-cream-200 to-rose-100',
  'from-rose-300 via-rose-100 to-cream-200',
  'from-sky/40 via-cream-100 to-rose-50',
]

export function myLaunchToCoin(launch: MyLaunch): Coin {
  const badges: Badge[] = ['BONDING']
  return {
    id: launch.id,
    name: launch.name,
    ticker: launch.ticker,
    description: launch.description || `Launched on Wish · pair ${launch.quoteTicker}`,
    imageGradient: gradients[launch.mint.charCodeAt(0) % gradients.length],
    emoji: '🪙',
    bondingProgress: 0,
    marketCap: 0,
    liquidity: 0,
    volume24h: 0,
    holders: 1,
    creatorFee: launch.creatorFee,
    badges,
    vaultFilled: 0,
    vaultTarget: 10,
    markerStatus: 'pending',
    feeRoute: 'vault',
    createdAt: launch.createdAt,
    socials: launch.socials,
    receipts: [
      {
        label: 'Pump create_v2',
        hash: `${launch.signature.slice(0, 8)}…${launch.signature.slice(-4)}`,
        time: 'just now',
      },
    ],
    isReal: !isPlaceholderMint(launch.mint),
    isDemo: isPlaceholderMint(launch.mint),
    mint: launch.mint,
    quoteMint: launch.quoteMint,
    quoteTicker: launch.quoteTicker,
    signature: launch.signature,
    vaultPending: true,
    imageUrl: launch.imageUrl || undefined,
    imageThumb: launch.imageThumb,
  }
}

/** Persist a durable http(s) image URL for a mint if it changed. Returns true when written. */
export function patchMyLaunchImage(
  mint: string,
  imageUrl: string,
  opts?: { silent?: boolean },
): boolean {
  const url = (imageUrl || '').trim()
  if (!isUsableImageUrl(url)) return false
  const list = read()
  const idx = list.findIndex((l) => l.mint === mint || l.id === mint)
  if (idx < 0) return false
  if (list[idx].imageUrl === url) return false
  list[idx] = { ...list[idx], imageUrl: url }
  write(list)
  if (!opts?.silent && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MY_LAUNCHES_CHANGED))
  }
  return true
}

/** Persist name/ticker (and optional image) from Pump backfill when local looks weak. */
export function patchMyLaunchMeta(
  mint: string,
  patch: { imageUrl?: string; name?: string; ticker?: string },
  opts?: { silent?: boolean },
): boolean {
  const list = read()
  const idx = list.findIndex((l) => l.mint === mint || l.id === mint)
  if (idx < 0) return false
  const cur = list[idx]
  let changed = false
  const next = { ...cur }
  if (patch.imageUrl && isUsableImageUrl(patch.imageUrl) && patch.imageUrl !== cur.imageUrl) {
    next.imageUrl = patch.imageUrl.trim()
    changed = true
  }
  if (patch.name && patch.name.trim() && patch.name.trim() !== cur.name) {
    next.name = patch.name.trim()
    changed = true
  }
  if (patch.ticker && patch.ticker.trim() && patch.ticker.trim() !== cur.ticker) {
    next.ticker = patch.ticker.trim().replace(/^\$/, '').toUpperCase()
    changed = true
  }
  if (!changed) return false
  list[idx] = next
  write(list)
  if (!opts?.silent && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MY_LAUNCHES_CHANGED))
  }
  return true
}
