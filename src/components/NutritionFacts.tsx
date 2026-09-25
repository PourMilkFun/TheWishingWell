/** USDA-style nutrition label printed on the milk carton back. */
export function NutritionFacts({
  className = '',
  launches = 0,
  compact = false,
}: {
  className?: string
  launches?: number
  compact?: boolean
}) {
  const rows: { label: string; value: string; bold?: boolean }[] = [
    { label: 'Serving size', value: '1 launch', bold: true },
    { label: 'Mechanism', value: 'Buyback & Burn + Locked LP' },
    { label: 'Tokens poured', value: String(launches), bold: true },
    { label: 'Launch rail', value: 'Pump.fun mainnet' },
    { label: 'Quote pairs', value: 'SOL · USDC · Stocks' },
    { label: 'Fake demos', value: '0g' },
  ]

  return (
    <aside
      className={`nutrition-label text-ink-900 ${compact ? 'text-[9.5px]' : 'text-[11px]'} ${className}`}
      aria-label="Wish product facts"
    >
      <div className="border-b-[3px] border-ink-900 pb-1">
        <p className="font-display text-[1.05rem] font-black leading-none tracking-tight sm:text-lg">
          Nutrition Facts
        </p>
        <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-ink-600">
          Per launch · Wish carton
        </p>
      </div>

      <div className="border-b-[7px] border-ink-900 py-1">
        <div className="flex items-baseline justify-between gap-2 text-[10px] font-black leading-tight">
          <span>Amount per serving</span>
          <span className="tabular-nums">{launches} poured</span>
        </div>
      </div>

      <ul className="divide-y divide-ink-900">
        {rows.map((r) => (
          <li
            key={r.label}
            className={`flex items-baseline justify-between gap-3 py-[3px] leading-snug ${
              r.bold ? 'font-extrabold' : 'font-semibold'
            }`}
          >
            <span>{r.label}</span>
            <span className="text-right tabular-nums text-ink-800">{r.value}</span>
          </li>
        ))}
      </ul>

      <p className="mt-1.5 border-t border-ink-900 pt-1.5 text-[8px] font-semibold leading-snug text-ink-500">
        % Daily Value not established. Pour cold. Trade responsibly.
      </p>
    </aside>
  )
}
