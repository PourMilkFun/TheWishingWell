import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LaunchSortFilters } from '../components/LaunchSortFilters'
import type { LaunchSort } from '../components/LaunchSortFilters'
import { useLiveLaunchCoins } from '../hooks/useLiveLaunchCoins'
import { sortLaunches } from '../lib/sortLaunches'
import { CoinCard } from '../components/CoinCard'
import { SoftBlob } from '../components/MilkIllustrations'
import { EmptyGlass } from '../components/EmptyGlass'

export function Launches() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<LaunchSort>('recent')

  const { coins: allCoins } = useLiveLaunchCoins()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = allCoins.filter((c) => {
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q)
      )
    })
    return sortLaunches(matches, sort)
  }, [allCoins, query, sort])

  const isEmptyFeed = allCoins.length === 0

  return (
    <div className="relative overflow-x-hidden">
      <SoftBlob className="pointer-events-none -right-24 top-0 h-64 w-64" color="bg-rose-100/40" />
      <div className="container-page relative py-14">
        <div className="mb-10 max-w-xl">
          <p className="text-label mb-3">Discover</p>
          <h1 className="text-title text-4xl sm:text-[2.75rem]">Launches</h1>
          <p className="mt-3 text-body">
            Real Pump creates only. Sort by newest, market cap, or liquidity.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-rose-100/70 bg-milk/60 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-2 sm:pl-3">
          <LaunchSortFilters value={sort} onChange={setSort} />
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Search</span>
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search name or ticker…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field !rounded-full !py-2.5 !pl-10"
            />
          </label>
        </div>

        <p className="mb-5 text-xs font-medium text-ink-400">
          {filtered.length} {filtered.length === 1 ? 'launch' : 'launches'}
        </p>

        {filtered.length === 0 ? (
          <div className="milk-card rounded-3xl px-6 py-16 text-center">
            <EmptyGlass />
            <h2 className="mt-5 text-title text-xl">
              {isEmptyFeed
                ? 'No launches yet — go first'
                : 'No matches for this search'}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-body">
              {isEmptyFeed
                ? 'Deploy on Pump with vault-ready fee routing. Your coin appears here when the create lands on-chain.'
                : 'Try another name or clear search.'}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/launch" className="btn-primary">
                Launch a coin
              </Link>
              {isEmptyFeed && (
                <Link
                  to="/coin/demo"
                  className="rounded-full border border-rose-200 bg-milk px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-rose-50"
                >
                  Preview mock
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <CoinCard key={c.id} coin={c} />
            ))}
          </div>
        )}

        <p className="mx-auto mt-14 max-w-lg text-center text-[11px] leading-relaxed text-ink-300">
          Listings here are real Pump creates from this app. Always do your own research.
        </p>
      </div>
    </div>
  )
}
