import { formatSol } from '../data/coins'

interface TokenFeeGlassProps {
  filled: number
  target: number
  vaultPending?: boolean
  ticker?: string
}

/**
 * Per-token fee cup — fees from THIS mint drop here (not the global Home vault).
 * Uses the same gold coin mark as FeeVaultPanel.
 * Auto-height only — never stretch to match chart (no h-full / flex-1 / mt-auto / min-h-*).
 */
export function TokenFeeGlass({
  filled,
  target,
  vaultPending,
  ticker,
}: TokenFeeGlassProps) {
  const safeTarget = target > 0 ? target : 10
  const pct = Math.min(100, Math.round((filled / safeTarget) * 100))

  const mood =
    vaultPending && filled <= 0
      ? 'Awaiting vault'
      : pct < 30
        ? 'First coins in'
        : pct < 70
          ? 'Gold gathering'
          : pct < 100
            ? 'Well filling'
            : 'Well heavy'

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-milk via-rose-50/80 to-cream-100 p-3 shadow-soft">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-200/35 blur-2xl"
        aria-hidden
      />

      <div className="relative mb-2 flex w-full flex-wrap items-start justify-between gap-1.5">
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-rose-400">
            This token’s well share
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-ink-900">
            {formatSol(filled)}
          </p>
          <p className="truncate text-[11px] font-semibold text-ink-400">
            {ticker
              ? `Fees from $${ticker} drop here`
              : 'Fees from this mint drop here'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {vaultPending && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700">
              Pending vault
            </span>
          )}
          <span className="rounded-full border border-rose-200 bg-milk px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-rose-500">
            {mood}
          </span>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-rose-200 bg-rose-50 shadow-soft"
          aria-hidden
        >
          <img
            src="/tokens/wish-well-logo.jpg"
            alt=""
            className="h-full w-full object-cover"
            width={40}
            height={40}
            decoding="async"
          />
          <div className="absolute left-1 top-1 z-[1]">
            <span className="rounded-full bg-milk/95 px-1.5 py-0.5 font-display text-[10px] font-bold tabular-nums text-ink-800 shadow-sm backdrop-blur-sm">
              {pct}%
            </span>
          </div>
        </div>

        <div className="w-full min-w-0 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
            <span>Filled</span>
            <span className="tabular-nums text-rose-400">
              {formatSol(filled)} / {formatSol(safeTarget)}
            </span>
          </div>
          <div className="pour-progress">
            <div
              className="pour-progress-fill transition-all duration-700 ease-out"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
          <p className="truncate text-[10px] font-semibold text-ink-500">
            {vaultPending
              ? 'Vault pending on-chain — cup previews fill for this mint.'
              : 'Fees drop here for Buyback & Burn and Locked LP.'}
          </p>
        </div>
      </div>
    </div>
  )
}
