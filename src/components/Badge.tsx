import type { Badge as BadgeType } from '../data/coins'

const styles: Record<BadgeType, string> = {
  'VAULT LIVE': 'bg-[#E8F7F0] text-vault-dark border-vault/50',
  'Wish-INDEXED': 'bg-rose-100 text-rose-600 border-rose-300/80',
  BONDING: 'bg-[#FFF4E0] text-amber-dark border-amber/55',
  'PUBLIC MARKER': 'bg-[#E8F4FA] text-sky-dark border-sky/50',
}

export function Badge({ label }: { label: BadgeType }) {
  return (
    <span className={`sticker ${styles[label]}`}>
      {label === 'VAULT LIVE' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vault-dark opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-vault-dark" />
        </span>
      )}
      {label === 'Wish-INDEXED' && <span aria-hidden>✦</span>}
      {label}
    </span>
  )
}
