/** Cohesive pink/white feature icons — stroke ~1.8, #E84A7F / #FF8FB8 / white. */

const stroke = '#E84A7F'
const soft = '#FF8FB8'

export function MagnifyingGlassIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="12.5" cy="12.5" r="7" fill="#FFFEFC" stroke={stroke} strokeWidth="1.8" />
      <circle cx="12.5" cy="12.5" r="3.2" fill={soft} opacity="0.55" />
      <path
        d="M17.8 17.8L23 23"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FlameIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 4.5c1.2 2.4 4.8 5.2 4.8 10.2A5.8 5.8 0 0114 20.5a5.8 5.8 0 01-4.8-5.8C9.2 9.7 12.8 6.9 14 4.5z"
        fill={soft}
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 12.2c.55 1.1 2.1 2.3 2.1 4.2A2.1 2.1 0 0114 18.5a2.1 2.1 0 01-2.1-2.1c0-1.9 1.55-3.1 2.1-4.2z"
        fill="#FFFEFC"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect
        x="6.5"
        y="12.5"
        width="15"
        height="11"
        rx="3"
        fill="#FFFEFC"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <path
        d="M10 12.5V9.8a4 4 0 018 0v2.7"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="14" cy="17.5" r="1.6" fill={soft} />
      <path d="M14 19.1v1.6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ChainIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="10"
        width="9.5"
        height="8"
        rx="3.5"
        fill="#FFFEFC"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <rect
        x="15"
        y="10"
        width="9.5"
        height="8"
        rx="3.5"
        fill="#FFFEFC"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <path
        d="M11.5 14h5"
        stroke={soft}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="9" fill="#FFFEFC" stroke={stroke} strokeWidth="1.8" />
      <circle cx="14" cy="14" r="5.5" fill={soft} opacity="0.35" />
      <path
        d="M9.8 14.2l2.8 2.8 5.6-5.8"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
