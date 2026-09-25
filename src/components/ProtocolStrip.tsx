import { Link } from 'react-router-dom'
import { useLiveLaunchCoins } from '../hooks/useLiveLaunchCoins'

/** Thin bar under the nav: slogan + stats + How it works. */
export function ProtocolStrip() {
  const { count } = useLiveLaunchCoins()

  return (
    <div className="relative z-[40] border-b border-rose-100/40 bg-milk/90 backdrop-blur-md">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
        <p className="min-w-0 font-display text-sm font-semibold leading-snug text-ink-900 sm:text-[15px]">
          Toss a wish in the well. Fees stay visible.
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-7">
          {[
            { value: String(count), label: 'Wish launches' },
            { value: 'Live', label: 'Pump create' },
            { value: 'Live', label: 'The Well' },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="font-display text-base font-semibold tabular-nums text-rose-400 sm:text-lg">
                {s.value}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <Link
          to="/mechanics"
          className="shrink-0 rounded-full border border-rose-200 bg-milk px-3 py-1 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50"
        >
          How it works →
        </Link>
      </div>
    </div>
  )
}
