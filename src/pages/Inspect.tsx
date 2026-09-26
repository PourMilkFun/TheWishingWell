import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getCoin,
  formatUsd,
  formatPriceUsd,
  truncateMint,
  DEMO_COIN_ID,
  type Coin,
} from '../data/coins'
import { Badge } from '../components/Badge'
import { SoftBlob } from '../components/MilkIllustrations'
import { EmptyGlass } from '../components/EmptyGlass'
import { PumpChart } from '../components/PumpChart'
import { TokenFeeGlass } from '../components/TokenFeeGlass'
import { TokenImage } from '../components/TokenImage'
import { fetchPumpStats } from '../lib/pumpStats'
import { isUsableImageUrl } from '../lib/ipfs'
import { patchMyLaunchImage } from '../lib/myLaunches'
import {PUMP_COIN, SOLSCAN_TOKEN, SOLSCAN_TX, isPlaceholderMint } from '../lib/constants'

function CopyMintButton({ mint }: { mint: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(mint)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1600)
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-milk px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
      title="Copy mint"
    >
      {truncateMint(mint, 6, 6)}
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}

export function Inspect() {
  const { id } = useParams<{ id: string }>()
  const base = id ? getCoin(id) : undefined
  const [live, setLive] = useState<Partial<Coin> | null>(null)

  const isDemo =
    Boolean(base?.isDemo) || id === DEMO_COIN_ID || isPlaceholderMint(base?.mint)

  const mintKey = base?.mint
  useEffect(() => {
    setLive(null)
    if (!mintKey || isDemo) return
    let cancelled = false

    const apply = (stats: NonNullable<Awaited<ReturnType<typeof fetchPumpStats>>>) => {
      const needsImage =
        stats.imageUrl &&
        (!base?.imageUrl || !isUsableImageUrl(base.imageUrl))
      if (needsImage && stats.imageUrl && mintKey) {
        patchMyLaunchImage(mintKey, stats.imageUrl)
      }
      setLive({
        marketCap: stats.marketCapUsd,
        liquidity: stats.liquidityUsd,
        bondingProgress: stats.bondingProgress,
        ...(stats.volume24hUsd != null ? { volume24h: stats.volume24hUsd } : {}),
        ...(stats.priceUsd != null ? { priceUsd: stats.priceUsd } : {}),
        ...(needsImage && stats.imageUrl ? { imageUrl: stats.imageUrl } : {}),
        ...(stats.complete
          ? {
              badges: (base?.badges ?? []).includes('BONDING')
                ? (base?.badges ?? []).filter((b) => b !== 'BONDING')
                : base?.badges,
            }
          : {}),
      })
    }

    const pull = () => {
      fetchPumpStats(mintKey).then((stats) => {
        if (cancelled || !stats) return
        apply(stats)
      })
    }

    pull()
    const id = window.setInterval(pull, 60_000)
    const onFocus = () => pull()
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
    // mintKey / isDemo only — base object is rebuilt each render from getCoin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintKey, isDemo])

  const coin = useMemo(() => {
    if (!base) return undefined
    if (!live) return base
    return { ...base, ...live }
  }, [base, live])

  if (!coin) {
    return (
      <div className="container-page max-w-lg py-24 text-center">
        <div className="milk-card rounded-3xl p-10">
          <EmptyGlass />
          <h1 className="mt-4 text-title text-xl">Coin not found</h1>
          <p className="mt-2 text-sm font-semibold text-body">
            No launch matches that mint. Browse real launches or preview the demo carton.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/launches" className="btn-primary !py-2.5">
              Browse launches
            </Link>
            <Link
              to={`/coin/${DEMO_COIN_ID}`}
              className="rounded-full border border-rose-200 bg-milk px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-rose-50"
            >
              Preview mock
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const markerLabel =
    coin.markerStatus === 'indexed'
      ? 'Indexed on Wish board'
      : coin.markerStatus === 'pending'
        ? 'Marker pending attestation'
        : 'Not marked'

  const isProtocolFee =
    !coin.quoteTicker ||
    coin.quoteTicker === 'SOL' ||
    coin.quoteTicker === 'USDC'
  // Offline / not-yet-indexed: show em dash, never invent placeholder dollars.
  const fmtStat = (n: number) =>
    !Number.isFinite(n) || n <= 0 ? '—' : formatUsd(n)

  const metrics: { label: string; value: string; hint?: string }[] = [
    { label: 'Market cap (USD)', value: fmtStat(coin.marketCap) },
    { label: 'Liquidity (USD)', value: fmtStat(coin.liquidity) },
    { label: '24h volume', value: fmtStat(coin.volume24h) },
    {
      label: 'Holders',
      value: isDemo || coin.holders > 1 ? coin.holders.toLocaleString() : '—',
    },
    {
      label: 'Bonding progress',
      value:
        !live && !isDemo && coin.bondingProgress <= 0
          ? '—'
          : `${coin.bondingProgress}%`,
    },
    {
      label: 'Creator fee',
      value: isProtocolFee ? '~1.25% (protocol)' : `${coin.creatorFee}%`,
    },
  ]
  if (coin.priceUsd != null && coin.priceUsd > 0) {
    metrics.push({ label: 'Price', value: formatPriceUsd(coin.priceUsd) })
  }
  if (coin.quoteTicker) {
    metrics.push({ label: 'Quote pair', value: coin.quoteTicker })
  }

  return (
    <div className="relative">
      <SoftBlob className="-left-16 top-10 h-64 w-64" color="bg-rose-100" />
      <div className="container-page relative py-6">
        <Link
          to="/launches"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 transition hover:text-rose-500"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to launches
        </Link>

        {/* Header — compact */}
        <header className="glass-card mb-3 overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <div
              className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${coin.imageGradient} cream-texture sm:h-20 sm:w-20`}
            >
              <TokenImage
                url={coin.imageUrl}
                thumb={coin.imageThumb}
                emoji={coin.emoji}
                className="absolute inset-0"
                imgClassName="absolute inset-0 h-full w-full object-cover"
                emojiClassName="relative z-[1] flex h-full w-full items-center justify-center text-3xl drop-shadow-md sm:text-4xl"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-title text-xl sm:text-2xl">{coin.name}</h1>
                <span className="font-mono text-sm font-semibold tracking-tight text-ink-400">
                  ${coin.ticker}
                </span>
                {isDemo && (
                  <span className="rounded-full border border-dashed border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                    Demo
                  </span>
                )}
              </div>
              <p className="line-clamp-2 max-w-2xl text-sm font-semibold text-body">
                {coin.description}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {coin.mint && <CopyMintButton mint={coin.mint} />}
                {coin.badges.map((b) => (
                  <Badge key={b} label={b} />
                ))}
              </div>
              <p className="text-[10px] leading-relaxed text-ink-300">
                PUBLIC MARKER ≠ endorsement. Index eligibility only.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-1.5 sm:flex-col sm:items-end">
              {coin.socials.twitter && (
                <a
                  href={coin.socials.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-rose-100 bg-milk px-3 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  X / Twitter
                </a>
              )}
              {coin.socials.telegram && (
                <a
                  href={coin.socials.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-rose-100 bg-milk px-3 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  Telegram
                </a>
              )}
              {coin.socials.website && (
                <a
                  href={coin.socials.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-rose-100 bg-milk px-3 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  Website
                </a>
              )}
              {coin.mint && !isDemo && (
                <>
                  <a
                    href={SOLSCAN_TOKEN(coin.mint)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-rose-100 bg-milk px-3 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
                  >
                    Solscan
                  </a>
                  <a
                    href={PUMP_COIN(coin.mint)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-rose-100 bg-milk px-3 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
                  >
                    pump.fun
                  </a>
                </>
              )}
              {coin.signature && !isDemo && (
                <a
                  href={SOLSCAN_TX(coin.signature)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-rose-100 bg-milk px-3 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  Create tx
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Metrics — dense single row */}
        <div className="mb-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
          {metrics.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-2">
              <p className="text-label !text-[8px]">{s.label}</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums tracking-tight text-ink-900">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Row A — chart | fee cup + bonding + fee route */}
        <div className="mb-3 grid gap-3 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <PumpChart mint={coin.mint} isDemo={isDemo} ticker={coin.ticker} />
          </div>
          <div className="space-y-2">
            <TokenFeeGlass
              filled={coin.vaultFilled}
              target={coin.vaultTarget}
              vaultPending={coin.vaultPending}
              ticker={coin.ticker}
            />
            <div className="glass-card rounded-2xl p-2.5">
              <h2 className="mb-1.5 text-xs font-semibold text-ink-700">Bonding curve</h2>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-ink-500">Progress</span>
                <span className="font-semibold tabular-nums">{coin.bondingProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full border border-rose-100/50 bg-cream-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-200 to-rose-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, coin.bondingProgress)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-ink-400">
                {coin.bondingProgress >= 100
                  ? 'Graduated. Locked LP via vault'
                  : `${Math.max(0, 100 - coin.bondingProgress)}% to graduation`}
              </p>
            </div>
            <div className="glass-card space-y-2 rounded-2xl p-3">
              <div>
                <h2 className="mb-0.5 text-xs font-semibold text-ink-700">Fee route</h2>
                <p className="text-xs font-semibold text-ink-900">
                  {coin.feeRoute === 'vault'
                    ? '→ Vault (Buyback & Burn + Locked LP)'
                    : '→ Creator wallet'}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-400">
                  {coin.feeRoute === 'vault'
                    ? 'Fees meant for this token’s glass, not a private wallet'
                    : 'Legacy route. No vault badge'}
                </p>
              </div>
              <div className="border-t border-rose-50 pt-2">
                <h2 className="mb-0.5 text-xs font-semibold text-ink-700">Marker status</h2>
                <p className="text-xs font-semibold text-ink-900">{markerLabel}</p>
              </div>
              {coin.quoteTicker && (
                <div className="border-t border-rose-50 pt-2">
                  <h2 className="mb-0.5 text-xs font-semibold text-ink-700">Quote pair</h2>
                  <p className="text-xs font-semibold text-ink-900">{coin.quoteTicker}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row B — full-width activity / receipts */}
        <div className="glass-card rounded-2xl p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <p className="text-label mb-0.5 !text-[8px]">On-chain activity</p>
              <h2 className="text-title text-base">Execution receipts</h2>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-300">
              Tx hashes
            </span>
          </div>
          {coin.receipts && coin.receipts.length > 0 ? (
            <ul className="relative space-y-0">
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-rose-200 via-rose-100 to-transparent" />
              {coin.receipts.map((r, i) => (
                <li
                  key={`${r.label}-${i}`}
                  className="relative flex items-start gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <div className="relative z-[1] mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-rose-300 bg-milk shadow-sm" />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800">{r.label}</p>
                      <p className="truncate font-mono text-[11px] text-ink-400">{r.hash}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-ink-300">
                      {r.time}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-cream-300 px-3 py-4 text-center">
              <p className="text-xs font-medium text-ink-400">No receipts yet</p>
              <p className="mt-0.5 text-[11px] text-ink-300">
                Vault activity will appear here.
              </p>
            </div>
          )}
        </div>

        {isDemo && (
          <p className="mx-auto mt-4 max-w-lg text-center text-[11px] leading-relaxed text-ink-300">
            Demo carton for UI preview only. Numbers and receipts are mock. Launch a real coin to
            see live Pump stats and DexScreener.
          </p>
        )}
      </div>
    </div>
  )
}
