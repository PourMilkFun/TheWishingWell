import { Link } from 'react-router-dom'
import type { Coin } from '../data/coins'
import { formatUsd } from '../data/coins'
import { TokenImage } from './TokenImage'

function CreamCap() {
  return (
    <div className="cream-cap" aria-hidden>
      <svg viewBox="0 0 200 28" preserveAspectRatio="none">
        <path
          d="M0 18 C20 4 40 22 60 12 C80 2 100 20 120 10 C140 0 160 18 180 8 C190 4 200 12 200 12 L200 28 L0 28 Z"
          fill="#FFF6F0"
          opacity="0.72"
        />
        <path
          d="M0 20 C25 8 50 24 75 14 C100 4 125 22 150 12 C170 5 190 16 200 14"
          fill="none"
          stroke="#E8B86D"
          strokeWidth="2"
          opacity="0.55"
        />
        <ellipse cx="48" cy="10" rx="10" ry="6" fill="#FFE9A0" opacity="0.55" />
        <ellipse cx="110" cy="8" rx="14" ry="7" fill="#FFE9A0" opacity="0.45" />
        <ellipse cx="160" cy="11" rx="9" ry="5" fill="#F0C85A" opacity="0.35" />
      </svg>
    </div>
  )
}

export function CoinCard({ coin }: { coin: Coin }) {
  const bonded = coin.bondingProgress >= 100

  return (
    <Link
      to={`/coin/${coin.id}`}
      className="milk-card-hover splash-hover group relative block overflow-visible pt-2"
    >
      <CreamCap />

      {/* Splash rings on hover */}
      <span className="splash-ring" style={{ top: '30%', left: '20%' }} />
      <span className="splash-ring" style={{ top: '40%', left: '70%', animationDelay: '0.08s' }} />
      <span className="splash-ring" style={{ top: '55%', left: '45%', animationDelay: '0.14s' }} />

      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
        {/* Full-bleed token art */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${coin.imageGradient} cream-texture`}
        >
          <TokenImage
            url={coin.imageUrl}
            thumb={coin.imageThumb}
            emoji={coin.emoji}
            className="absolute inset-0 z-[1]"
            imgClassName="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            emojiClassName="relative z-[2] flex h-full w-full items-center justify-center text-6xl drop-shadow-sm transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-8"
          />
          {/* mini splash dots appear on hover */}
          <span className="absolute right-6 top-8 z-[2] h-2.5 w-2.5 rounded-full bg-rose-300 opacity-0 transition group-hover:opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1" />
          <span className="absolute right-10 top-14 z-[2] h-1.5 w-1.5 rounded-full bg-rose-200 opacity-0 transition delay-75 group-hover:opacity-90" />
          <span className="absolute left-8 top-10 z-[2] h-2 w-2 rounded-full bg-rose-200 opacity-0 transition delay-100 group-hover:opacity-70 group-hover:-translate-x-1" />
        </div>

        {/* Bonding / Bonded badge */}
        <div className="absolute left-3 top-3 z-[3] flex flex-wrap gap-1.5">
          <span
            className={
              bonded
                ? 'rounded-full border border-vault/40 bg-[#E8F7F0]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-vault-dark backdrop-blur-sm'
                : 'rounded-full border border-amber/55 bg-[#FFF4E0]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-dark backdrop-blur-sm'
            }
          >
            {bonded ? 'Bonded' : 'Bonding'}
          </span>
        </div>

        {/* Soft fade into glass panel */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 bg-gradient-to-t from-milk/70 via-milk/25 to-transparent"
          aria-hidden
        />

        {/* Frosted glass info panel over art */}
        <div className="absolute inset-x-0 bottom-0 z-[3] space-y-2.5 border-t border-white/40 bg-milk/50 p-3.5 pt-3 backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-[1.05rem] font-semibold leading-tight text-ink-900 drop-shadow-sm">
                {coin.name}
              </h3>
              <p className="font-mono text-sm font-bold tracking-tight text-rose-500">
                ${coin.ticker}
              </p>
            </div>
            <div className="shrink-0 space-y-1 text-right">
              <div className="rounded-xl border border-white/50 bg-white/55 px-2.5 py-1.5 backdrop-blur-sm">
                <p className="text-label !text-[8px]">MC</p>
                <p className="text-sm font-extrabold tabular-nums text-ink-900">
                  {formatUsd(coin.marketCap)}
                </p>
              </div>
              <div className="rounded-xl border border-white/40 bg-white/40 px-2.5 py-1 backdrop-blur-sm">
                <p className="text-label !text-[8px]">LIQ</p>
                <p className="text-xs font-extrabold tabular-nums text-ink-700">
                  {formatUsd(coin.liquidity ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs font-bold text-ink-600">
              <span>Bonding</span>
              <span className="tabular-nums text-ink-800">{coin.bondingProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-rose-100/80 bg-cream-200/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-200 to-rose-400 transition-all"
                style={{ width: `${Math.min(100, coin.bondingProgress)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function CoinCardSkeleton() {
  return (
    <div className="milk-card animate-pulse overflow-hidden pt-2">
      <div className="aspect-[4/5] rounded-[1.35rem] bg-cream-200" />
    </div>
  )
}
