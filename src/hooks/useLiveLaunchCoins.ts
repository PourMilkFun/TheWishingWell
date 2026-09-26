import { useCallback, useEffect, useState } from 'react'
import type { Coin } from '../data/coins'
import {MY_LAUNCHES_CHANGED, isLiveChartMint } from '../lib/constants'
import { isUsableImageUrl, rewriteIpfsGateway } from '../lib/ipfs'
import { listMyLaunches, myLaunchToCoin, patchMyLaunchImage, patchMyLaunchMeta } from '../lib/myLaunches'
import { fetchPumpStatsMany } from '../lib/pumpStats'

function loadBase(): Coin[] {
  return listMyLaunches().map(myLaunchToCoin)
}

function looksLikePlaceholderName(name: string | undefined): boolean {
  const n = (name || '').trim()
  if (!n) return true
  return /^(imported|untitled|unknown|token|coin|new\s*coin)$/i.test(n)
}

function looksLikePlaceholderTicker(ticker: string | undefined): boolean {
  const t = (ticker || '').trim().replace(/^\$/, '')
  if (!t) return true
  return /^(COIN|TKN|TOKEN|XXX)$/i.test(t)
}

/** Wish launches only (created via this app). Enriched with Pump stats. Never counts outside deploys. */
export function useLiveLaunchCoins(): { coins: Coin[]; loading: boolean; count: number } {
  const [coins, setCoins] = useState<Coin[]>(() => loadBase())
  const [loading, setLoading] = useState(() => loadBase().length > 0)

  const refresh = useCallback(() => {
    const base = loadBase()
    setCoins(base)
    if (base.length === 0) {
      setLoading(false)
      return () => {}
    }
    setLoading(true)
    let cancelled = false
    const mints = base
      .map((c) => c.mint)
      .filter((m): m is string => Boolean(m) && isLiveChartMint(m))
    fetchPumpStatsMany(mints).then((map) => {
      if (cancelled) return
      const imagePatches: { mint: string; imageUrl: string }[] = []
      const metaPatches: { mint: string; name?: string; ticker?: string; imageUrl?: string }[] = []
      setCoins(
        base.map((c) => {
          const mint = c.mint
          if (!mint) return c
          const s = map.get(mint)
          if (!s) return c

          // Always prefer a usable Pump image over local empty/bad URLs.
          const pumpImage = s.imageUrl && isUsableImageUrl(s.imageUrl) ? rewriteIpfsGateway(s.imageUrl) : undefined
          const nextImage = pumpImage || undefined
          if (nextImage && nextImage !== c.imageUrl) {
            imagePatches.push({ mint, imageUrl: nextImage })
          }

          const betterName =
            s.name && looksLikePlaceholderName(c.name) && !looksLikePlaceholderName(s.name)
              ? s.name
              : undefined
          const betterTicker =
            s.symbol &&
            looksLikePlaceholderTicker(c.ticker) &&
            !looksLikePlaceholderTicker(s.symbol)
              ? s.symbol.replace(/^\$/, '').toUpperCase()
              : undefined

          if (betterName || betterTicker || (nextImage && nextImage !== c.imageUrl)) {
            metaPatches.push({
              mint,
              name: betterName,
              ticker: betterTicker,
              imageUrl: nextImage && nextImage !== c.imageUrl ? nextImage : undefined,
            })
          }

          return {
            ...c,
            marketCap: s.marketCapUsd,
            liquidity: s.liquidityUsd,
            bondingProgress: s.bondingProgress,
            ...(s.volume24hUsd != null ? { volume24h: s.volume24hUsd } : {}),
            ...(s.priceUsd != null ? { priceUsd: s.priceUsd } : {}),
            // Patch http imageUrl from Pump, but never clear local imageThumb.
            ...(nextImage ? { imageUrl: nextImage } : {}),
            imageThumb: c.imageThumb,
            ...(betterName ? { name: betterName } : {}),
            ...(betterTicker ? { ticker: betterTicker } : {}),
            badges: s.complete
              ? c.badges.includes('BONDING')
                ? c.badges.filter((b) => b !== 'BONDING')
                : c.badges
              : c.badges,
          }
        }),
      )
      // Persist without dispatching — setCoins already has the art;
      // a MY_LAUNCHES_CHANGED here would re-enter refresh and refetch Pump needlessly.
      for (const p of imagePatches) {
        patchMyLaunchImage(p.mint, p.imageUrl, { silent: true })
      }
      for (const p of metaPatches) {
        if (p.name || p.ticker) {
          patchMyLaunchMeta(p.mint, { name: p.name, ticker: p.ticker }, { silent: true })
        }
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const cancelStats = refresh()
    const onChange = () => {
      refresh()
    }
    window.addEventListener(MY_LAUNCHES_CHANGED, onChange)
    window.addEventListener('storage', onChange)
    window.addEventListener('focus', onChange)
    return () => {
      cancelStats()
      window.removeEventListener(MY_LAUNCHES_CHANGED, onChange)
      window.removeEventListener('storage', onChange)
      window.removeEventListener('focus', onChange)
    }
  }, [refresh])

  return { coins, loading, count: coins.length }
}
