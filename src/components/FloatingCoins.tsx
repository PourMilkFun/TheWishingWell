/** Soft falling gold coins — CSS-only, GPU-friendly. */
const COINS = [
  { left: '6%', size: 18, delay: 0, dur: 18 },
  { left: '14%', size: 12, delay: 3, dur: 22 },
  { left: '22%', size: 22, delay: 7, dur: 16 },
  { left: '31%', size: 14, delay: 1.5, dur: 20 },
  { left: '42%', size: 16, delay: 9, dur: 24 },
  { left: '53%', size: 11, delay: 4, dur: 19 },
  { left: '61%', size: 20, delay: 11, dur: 17 },
  { left: '72%', size: 15, delay: 2, dur: 21 },
  { left: '81%', size: 10, delay: 6, dur: 15 },
  { left: '88%', size: 18, delay: 13, dur: 23 },
  { left: '94%', size: 12, delay: 8, dur: 18 },
  { left: '48%', size: 9, delay: 15, dur: 26 },
]

function CoinSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <radialGradient id={`cg-${size}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE9A0" />
          <stop offset="55%" stopColor="#E8C04A" />
          <stop offset="100%" stopColor="#A67C00" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#cg-${size})`} stroke="#8B6914" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="#FFF3C4" strokeWidth="1" opacity="0.5" />
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fontSize="12"
        fill="#5C4308"
        fontFamily="Georgia, serif"
        fontWeight="700"
      >
        ★
      </text>
    </svg>
  )
}

export function FloatingCoins() {
  return (
    <div className="coins-layer" aria-hidden>
      {COINS.map((c, i) => (
        <span
          key={i}
          className="coin-float"
          style={{
            left: c.left,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <CoinSvg size={c.size} />
        </span>
      ))}
    </div>
  )
}
