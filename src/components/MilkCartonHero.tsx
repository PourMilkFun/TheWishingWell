import { NutritionFacts } from './NutritionFacts'

/** Animated milk pour + carton BACK with nutrition label printed on cream paper. */
export function MilkCartonHero({
  launches = 0,
  className = '',
}: {
  launches?: number
  className?: string
}) {
  return (
    <div className={`relative mx-auto w-full max-w-[340px] ${className}`}>
      <div
        className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-rose-100/60 via-cream-200/40 to-transparent blur-2xl"
        aria-hidden
      />

      <div className="pointer-events-none absolute left-1/2 top-[-28px] z-20 -translate-x-1/2" aria-hidden>
        <div className="milk-pour-stream" />
        <div className="milk-pour-splash" />
      </div>

      <div className="relative carton-body carton-body--back animate-float">
        {/* Folded gable top */}
        <div className="carton-gable" aria-hidden>
          <span className="carton-gable-left" />
          <span className="carton-gable-right" />
        </div>

        {/* Side-edge / fold shading (carton depth) */}
        <span className="carton-edge carton-edge--left" aria-hidden />
        <span className="carton-edge carton-edge--right" aria-hidden />

        <div className="carton-face carton-face--back">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img src="/tokens/wish-well-logo.jpg" alt="" className="h-7 w-7 rounded-md object-contain opacity-90" />
              <div>
                <p className="font-display text-[13px] font-semibold leading-none text-ink-900">
                  Wish
                </p>
                <p className="mt-0.5 text-[8px] font-extrabold uppercase tracking-[0.16em] text-ink-500">
                  product facts
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-ink-900 shadow-sm">
              {launches} poured
            </span>
          </div>

          <NutritionFacts launches={launches} compact className="nutrition-label--carton" />

          {/* Carton-back micro type + barcode cue */}
          <div className="carton-back-meta mt-3">
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-0.5 text-[8px] font-extrabold uppercase leading-tight tracking-[0.12em] text-ink-500">
                <p>Best by · keep chilled</p>
                <p className="text-ink-400">Pour cold · shake gently</p>
              </div>
              <div className="carton-barcode" aria-hidden title="barcode">
                <span /><span /><span /><span /><span /><span /><span /><span />
                <span /><span /><span /><span /><span /><span /><span />
              </div>
            </div>
            <p className="mt-1.5 text-center font-mono text-[7px] tracking-[0.2em] text-ink-400">
              0 85001 33401 9
            </p>
          </div>
        </div>

        <div className="carton-milk-fill" aria-hidden>
          <div className="carton-milk-wave" />
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-rose-300">
        carton facts · live pour count
      </p>
    </div>
  )
}
