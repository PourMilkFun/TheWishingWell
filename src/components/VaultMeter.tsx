import { formatSol } from '../data/coins'

interface VaultMeterProps {
  filled: number
  target: number
  size?: 'sm' | 'lg'
  showLabel?: boolean
}

export function VaultMeter({ filled, target, size = 'sm', showLabel = true }: VaultMeterProps) {
  const pct = Math.min(100, Math.round((filled / target) * 100))
  const isLg = size === 'lg'

  if (isLg) {
    return (
      <div className="w-full">
        {showLabel && (
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <span className="font-display text-sm font-semibold text-ink-700">
              Well fill
            </span>
            <span className="tabular-nums text-sm font-bold text-ink-400">
              {formatSol(filled)} <span className="text-ink-200">/</span> {formatSol(target)}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-8">
          {/* Interactive gold vault */}
          <div className="milk-glass shrink-0" aria-hidden>
            <div className="milk-glass-rim" />
            <div className="milk-glass-body">
              <div className="milk-glass-fill" style={{ height: `${Math.max(8, pct)}%` }}>
                <div className="milk-glass-bubbles">
                  <span style={{ left: '22%', bottom: '30%', width: 5, height: 5, animationDelay: '0s' }} />
                  <span style={{ left: '55%', bottom: '45%', width: 4, height: 4, animationDelay: '0.7s' }} />
                  <span style={{ left: '70%', bottom: '22%', width: 6, height: 6, animationDelay: '1.2s' }} />
                </div>
                <div className="absolute inset-0 froth-shimmer opacity-40" />
              </div>
              <div className="milk-glass-shine" />
              <div className="absolute inset-0 z-[4] flex items-center justify-center">
                <span className="rounded-full bg-milk/80 px-2.5 py-0.5 font-display text-sm font-bold tabular-nums text-ink-800 shadow-sm backdrop-blur-sm">
                  {pct}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="pour-progress">
              <div className="pour-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs font-semibold leading-relaxed text-ink-400">
              Fees drop here → Buyback & Burn + Locked LP. The{' '}
              <span className="text-vault-dark">VAULT LIVE</span> sticker peels on only when this
              glass is real.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-wider">
              <span className="rounded-full bg-cream-200 px-2.5 py-1 text-ink-500">
                {pct < 30 ? 'Just a sip' : pct < 70 ? 'Gold gathering' : pct < 100 ? 'Almost full' : 'Overflow ready'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-xs font-extrabold text-ink-700">Vault fill</span>
          <span className="tabular-nums text-xs font-bold text-ink-400">
            {formatSol(filled)} <span className="text-ink-200">/</span> {formatSol(target)}
          </span>
        </div>
      )}
      <div className="relative h-3 overflow-hidden rounded-full border-2 border-rose-100 bg-cream-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-200 via-rose-300 to-vault transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 froth-shimmer opacity-50" />
        </div>
        {/* tiny foam cap at leading edge */}
        {pct > 4 && (
          <div
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-milk border border-rose-200 shadow-sm"
            style={{ left: `calc(${pct}% - 6px)` }}
          />
        )}
      </div>
    </div>
  )
}
