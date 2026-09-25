import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LaunchSortFilters } from '../components/LaunchSortFilters'
import type { LaunchSort } from '../components/LaunchSortFilters'
import { useLiveLaunchCoins } from '../hooks/useLiveLaunchCoins'
import { sortLaunches } from '../lib/sortLaunches'
import { CoinCard } from '../components/CoinCard'
import { WellHero } from '../components/WellHero'
import { CoinIcon } from '../components/Logo'
import { EmptyGlass } from '../components/EmptyGlass'
import { FeeVaultPanel } from '../components/FeeVaultPanel'
import {
  MagnifyingGlassIcon,
  FlameIcon,
  LockIcon,
} from '../components/FeatureIcons'
import { formatUsd } from '../data/coins'
import { TokenImage } from '../components/TokenImage'

const features = [
  {
    title: 'Fees into The Well',
    body: 'Creator fees route into a public gold vault you can watch fill — not a private wallet.',
    icon: <MagnifyingGlassIcon />,
    step: '01',
  },
  {
    title: 'Locked LP',
    body: 'After graduation, liquidity becomes Locked LP. Less rug drama, more staying power.',
    icon: <LockIcon />,
    step: '02',
  },
  {
    title: 'Buyback & Burn',
    body: 'Vault SOL powers Buyback & Burn so volume recycles into the chart instead of vanishing.',
    icon: <FlameIcon />,
    step: '03',
  },
]

function StarDivider() {
  return (
    <div className="star-divider py-2" aria-hidden>
      <span className="star-divider-dot" />
    </div>
  )
}

export function Home() {
  const { coins: launches, count: launchCount } = useLiveLaunchCoins()
  const [sort, setSort] = useState<LaunchSort>('recent')
  const sorted = sortLaunches(launches, sort)
  const spotlight = sorted[0]
  const sideList = sorted.slice(1, 5)
  const liveCount = launches.filter((c) => c.badges.includes('VAULT LIVE')).length

  return (
    <div>
      {/* Hero — art left / copy right (not milk text-left art-right) */}
      <section className="relative overflow-hidden cream-band">
        <div className="container-page relative z-[1] py-4 lg:py-6">
          <div className="grid items-center gap-4 lg:grid-cols-12 lg:gap-4">
            <div className="relative order-1 flex justify-center lg:col-span-5 lg:order-1 lg:justify-start">
              <WellHero launches={launchCount} />
            </div>

            <div className="relative order-2 space-y-3 lg:col-span-7 lg:order-2 lg:pl-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-cream-100/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-rose-400">
                <CoinIcon className="h-3.5 w-3.5 text-rose-400" />
                Liquidity in the well
              </div>

              <h1 className="text-display-hero text-[2.35rem] leading-[1.05] sm:text-4xl lg:text-[3.15rem]">
                Toss a wish.{' '}
                <span className="text-rose-400">Liquidity stays.</span>
              </h1>

              <p className="max-w-md text-sm font-semibold leading-relaxed text-ink-500 sm:text-base">
                Wish is a liquidity fountain: gold fees drop into The Well, then power Buyback &amp; Burn
                and Locked LP on Pump.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-0.5">
                <Link to="/launch" className="btn-primary">
                  Cast a wish
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link to="/launches" className="btn-secondary">
                  Browse launches
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live
                </span>
                <span className="tabular-nums text-rose-400">
                  {launchCount} {launchCount === 1 ? 'launch' : 'launches'}
                  {liveCount > 0 ? ` · ${liveCount} vault live` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Well + status strip overlapping hero band */}
          <div className="mt-3 grid gap-3 lg:grid-cols-5 lg:items-stretch">
            <div className="well-panel lg:col-span-3 p-1">
              <FeeVaultPanel />
            </div>
            <div className="well-panel flex flex-col justify-center gap-3 p-4 lg:col-span-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
                  Network
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink-900">Mainnet · Pump</p>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-200/50 to-transparent" />
              <p className="text-[12px] font-semibold leading-relaxed text-ink-400">
                Wish launches only — tokens created here. Outside Pump deploys are not counted.
              </p>
              <Link
                to="/mechanics"
                className="text-[12px] font-extrabold text-rose-400 transition hover:text-rose-500"
              >
                How The Well works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="py-1">
        <StarDivider />
      </div>

      {/* Features — 3-step horizontal, not 5-card milk grid */}
      <section className="container-page pb-2 pt-0">
        <div className="mb-3 max-w-xl">
          <p className="text-label mb-1.5">Path</p>
          <h2 className="text-title text-2xl sm:text-3xl">Three beats from wish to well</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="well-panel relative overflow-hidden p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50/40">
                  {f.icon}
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-rose-400/80">{f.step}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-ink-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="py-1">
        <StarDivider />
      </div>

      {/* Featured — spotlight + side list */}
      <section className="container-page pb-6">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-label mb-1.5">On the board</p>
            <h2 className="text-title text-2xl sm:text-3xl">Recent launches</h2>
            <p className="mt-1.5 text-sm font-semibold text-ink-500">
              Real on-chain creates only. No demo tickers in the feed.
            </p>
            <div className="mt-3">
              <LaunchSortFilters value={sort} onChange={setSort} />
            </div>
          </div>
          <Link
            to="/launches"
            className="text-sm font-extrabold text-rose-400 transition hover:text-rose-500"
          >
            View all →
          </Link>
        </div>

        {sorted.length === 0 ? (
          <div className="well-panel px-5 py-10 text-center">
            <EmptyGlass />
            <h3 className="mt-4 text-title text-xl">No launches yet. Go first.</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm font-semibold text-ink-500">
              Deploy on Pump with well-ready fee routing. Your coin shows up here when it lands
              on-chain.
            </p>
            <Link to="/launch" className="btn-primary mt-5">
              Cast a wish
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-5">
            {spotlight && (
              <div className="lg:col-span-3">
                <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
                  Spotlight
                </p>
                <CoinCard coin={spotlight} />
              </div>
            )}
            <div className="flex flex-col gap-2 lg:col-span-2">
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
                More on the board
              </p>
              {sideList.length === 0 ? (
                <div className="well-panel flex flex-1 items-center justify-center p-6 text-center text-sm font-semibold text-ink-400">
                  More launches will stack here.
                </div>
              ) : (
                sideList.map((c) => (
                  <Link
                    key={c.id}
                    to={`/coin/${c.id}`}
                    className="well-panel flex items-center gap-3 p-3 transition hover:border-rose-300/60"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                      <TokenImage
                        url={c.imageUrl}
                        thumb={c.imageThumb}
                        emoji={c.emoji}
                        className="absolute inset-0"
                        imgClassName="h-full w-full object-cover"
                        emojiClassName="flex h-full w-full items-center justify-center text-xl"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold text-ink-900">
                        {c.name}
                      </p>
                      <p className="font-mono text-xs font-bold text-rose-400">${c.ticker}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-ink-400">MC</p>
                      <p className="text-sm font-extrabold tabular-nums text-ink-800">
                        {c.isDemo || c.marketCap <= 0 ? '—' : formatUsd(c.marketCap)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
