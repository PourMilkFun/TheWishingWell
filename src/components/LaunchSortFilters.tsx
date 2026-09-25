export type LaunchSort = 'recent' | 'marketCap' | 'liquidity'

const OPTIONS: { id: LaunchSort; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'marketCap', label: 'Market Cap' },
  { id: 'liquidity', label: 'Liquidity' },
]

export function LaunchSortFilters({
  value,
  onChange,
}: {
  value: LaunchSort
  onChange: (next: LaunchSort) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sort launches">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`pill-filter ${
            value === o.id ? 'pill-filter-active' : 'pill-filter-idle'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
