import { PUMP_COIN, isLiveChartMint } from '../lib/constants'

interface PumpChartProps {
  mint?: string
  /** Force mock SVG chart (demo coin). */
  isDemo?: boolean
  ticker?: string
}

/**
 * Prebond / bonding-curve chart via DexScreener embed on the mint
 * (covers Pump bonding / pre-grad; pump.fun often blocks iframes).
 * Demo / mock coins get a styled SVG instead of a live embed.
 */

/** Clean empty chart — used for demo / placeholder mints (no infinite iframe load). */
function EmptyChartStub({ ticker }: { ticker?: string }) {
  return (
    <div className="relative flex h-[200px] flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-rose-200/70 bg-gradient-to-b from-cream-100/80 to-cream-50 sm:h-[240px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,162,39,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.35) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      <div className="relative z-[1] px-6 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
          Chart
        </p>
        <p className="mt-2 text-sm font-semibold text-ink-700">
          {ticker ? `$${ticker}` : 'Demo'} · waiting on a real mint
        </p>
        <p className="mx-auto mt-1.5 max-w-xs text-[11px] font-medium leading-relaxed text-ink-400">
          DexScreener embeds unlock after a live Pump create. Placeholder seeds stay empty on purpose.
        </p>
      </div>
    </div>
  )
}

export function PumpChart({ mint, isDemo, ticker }: PumpChartProps) {
  const live = isLiveChartMint(mint)
  const useEmpty = Boolean(isDemo) || !live

  if (useEmpty) {
    return (
      <section className="glass-card overflow-hidden rounded-2xl p-2.5">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-title text-base">Prebond chart</h2>
            <p className="mt-0.5 text-[11px] font-semibold text-ink-400">
              Empty until a real Pump mint — no infinite loading
            </p>
          </div>
        </div>
        <EmptyChartStub ticker={ticker} />
      </section>
    )
  }

  const liveMint = mint as string
  const embedSrc = `https://dexscreener.com/solana/${encodeURIComponent(liveMint)}?embed=1&theme=light&trades=0&info=0`

  return (
    <section className="glass-card overflow-hidden rounded-2xl p-2.5">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-title text-base">Prebond / Bonding chart</h2>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-400">
            Pump.fun market · via DexScreener
          </p>
        </div>
        <a
          href={PUMP_COIN(liveMint)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-rose-100 bg-milk px-2.5 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-rose-200 hover:bg-rose-50"
        >
          Open on pump.fun
        </a>
      </div>
      <div className="overflow-hidden rounded-xl border border-rose-100/80 bg-cream-50">
        <iframe
          title="Prebond / Bonding chart · Pump.fun market"
          src={embedSrc}
          className="h-[240px] w-full border-0 sm:h-[280px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    </section>
  )
}
