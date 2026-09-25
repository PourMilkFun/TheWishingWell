import { Link } from 'react-router-dom'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { mark: 28, text: 'text-lg' },
    md: { mark: 36, text: 'text-xl' },
    lg: { mark: 48, text: 'text-3xl' },
  }
  const s = sizes[size]

  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <img
        src="/tokens/wish-well-logo.jpg"
        alt=""
        width={s.mark}
        height={s.mark}
        className="rounded-xl object-cover shadow-soft ring-1 ring-rose-200/50 transition-transform duration-300 group-hover:scale-105"
        aria-hidden
      />
      <span className={`font-display font-semibold tracking-[-0.03em] text-ink-900 ${s.text}`}>
        Wish
      </span>
    </Link>
  )
}

export function CoinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="currentColor"
        opacity="0.85"
      >
        $
      </text>
    </svg>
  )
}

/** @deprecated use CoinIcon — kept for any leftover imports */
export function DropletIcon(props: { className?: string }) {
  return <CoinIcon {...props} />
}
