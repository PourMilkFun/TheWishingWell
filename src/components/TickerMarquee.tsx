import { listMyLaunches, myLaunchToCoin } from '../lib/myLaunches'
import { formatUsd } from '../data/coins'
import { TokenImage } from './TokenImage'

const SCROLL_MIN = 4

function Chip({
  coin,
  animDelay,
}: {
  coin: ReturnType<typeof myLaunchToCoin>
  animDelay?: string
}) {
  return (
    <span
      className="marquee-chip"
      style={animDelay ? { animationDelay: animDelay } : undefined}
    >
      <TokenImage
        url={coin.imageUrl}
        thumb={coin.imageThumb}
        emoji={coin.emoji}
        className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full"
        imgClassName="h-full w-full object-cover"
        emojiClassName="flex h-full w-full items-center justify-center text-[11px] leading-none"
      />
      <span className="font-mono text-rose-500">${coin.ticker}</span>
      <span className="font-bold text-ink-300">·</span>
      <span className="tabular-nums text-ink-500">{formatUsd(coin.marketCap)}</span>
      {coin.badges.includes('VAULT LIVE') && (
        <span className="h-1.5 w-1.5 rounded-full bg-vault" title="Vault live" />
      )}
    </span>
  )
}

/** Live ticker of launches. Hidden until at least one exists (no empty fluff). */
export function TickerMarquee() {
  const coins = listMyLaunches().map(myLaunchToCoin)
  if (coins.length === 0) return null

  const scroll = coins.length >= SCROLL_MIN

  if (!scroll) {
    return (
      <div className="marquee marquee--static border-b border-rose-100/70 bg-milk/80 py-2.5">
        <div className="marquee-static-row">
          {coins.map((c) => (
            <Chip key={c.id} coin={c} />
          ))}
        </div>
      </div>
    )
  }

  const items = [...coins, ...coins]
  return (
    <div className="marquee border-b border-rose-100/70 bg-milk/80 py-2.5">
      <div className="flex justify-center overflow-hidden">
        <div className="marquee-track">
          {items.map((c, i) => (
            <Chip
              key={`${c.id}-${i}`}
              coin={c}
              animDelay={`${(i % 8) * 0.18}s`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
