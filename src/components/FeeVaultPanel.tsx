import { useFeeVaultSol } from '../hooks/useFeeVaultSol'
import { formatSol } from '../data/coins'

function shortAddr(a: string) {
  return a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a
}

/** Live fee vault — The Well — driven by wallet SOL balance. */
export function FeeVaultPanel() {
  const { sol, targetSol, pct, wallet, loading, error } = useFeeVaultSol()

  const mood =
    sol <= 0
      ? 'Waiting for wishes'
      : pct < 30
        ? 'First coins in'
        : pct < 70
          ? 'Gold gathering'
          : pct < 100
            ? 'Well filling'
            : 'Well heavy'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border-2 border-rose-100 bg-gradient-to-br from-milk via-rose-50/80 to-cream-100 p-5 shadow-soft sm:p-6">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-amber/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
            Vault wallet · live SOL
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink-900 sm:text-3xl">
            {loading && sol === 0 ? '…' : formatSol(sol)}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink-400">
            {wallet
              ? <>Vault wallet {shortAddr(wallet)}</>
              : 'Set vault wallet to start live tracking'}
          </p>
        </div>
        <span className="rounded-full border border-rose-200 bg-milk px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-500 shadow-[0_2px_0_rgba(232,196,176,0.55)]">
          {mood}
        </span>
      </div>

      <div className="relative mt-auto flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div
          className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] border-2 border-rose-200 bg-gradient-to-br from-cream-100 to-rose-50 shadow-soft sm:h-32 sm:w-32"
          aria-hidden
        >
          <img
            src="/tokens/wish-well-logo.jpg"
            alt=""
            className="h-full w-full object-cover"
            width={128}
            height={128}
            decoding="async"
          />
          <div className="absolute left-1.5 top-1.5 z-[1]">
            <span className="rounded-full bg-milk/95 px-2 py-0.5 font-display text-xs font-bold tabular-nums text-ink-800 shadow-sm backdrop-blur-sm sm:text-sm">
              {pct}%
            </span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-3">
          <div className="flex items-baseline justify-between gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-400">
            <span>Fees collected</span>
            <span className="tabular-nums text-rose-500">
              {formatSol(sol)} / {formatSol(targetSol)}
            </span>
          </div>
          <div className="pour-progress">
            <div
              className="pour-progress-fill transition-all duration-700 ease-out"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
          <p className="text-xs font-semibold leading-relaxed text-ink-500">
            Creator fees drop into The Well as SOL. Buyback & Burn and Locked LP draw from the same gold vault.
          </p>
          {error && (
            <p className="text-[11px] font-semibold text-rose-500">Couldn’t refresh balance. Retrying.</p>
          )}
        </div>
      </div>
    </div>
  )
}
