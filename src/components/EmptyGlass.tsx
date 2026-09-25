/** Illustrated empty well for empty states — pastel claymorphic. */
export function EmptyGlass({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 200"
      className={`mx-auto w-28 drop-shadow-md ${className}`}
      fill="none"
      aria-hidden
    >
      <ellipse cx="80" cy="188" rx="40" ry="7" fill="#E8C4B0" opacity="0.45" />
      <ellipse cx="80" cy="70" rx="48" ry="14" fill="#E4F1FF" stroke="#E8C4B0" strokeWidth="2" />
      <path
        d="M32 70 L38 160 Q80 178 122 160 L128 70"
        fill="#F5DCD0"
        stroke="#E8C4B0"
        strokeWidth="2"
      />
      <ellipse cx="80" cy="70" rx="40" ry="10" fill="#8EC5E8" opacity="0.45" />
      <circle cx="80" cy="105" r="8" fill="#F0C85A" opacity="0.55" />
      <path
        d="M48 140 H112"
        stroke="#D4A017"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <rect x="52" y="28" width="8" height="42" rx="3" fill="#8EC5E8" stroke="#5A9AC4" strokeWidth="1" />
      <rect x="100" y="28" width="8" height="42" rx="3" fill="#8EC5E8" stroke="#5A9AC4" strokeWidth="1" />
      <path
        d="M40 32 L80 8 L120 32 L112 40 L80 20 L48 40 Z"
        fill="#B8D4F0"
        stroke="#5A9AC4"
        strokeWidth="1.5"
      />
      <circle cx="95" cy="55" r="7" fill="#F0C85A" stroke="#B8860B" strokeWidth="1" />
      <text x="95" y="58" textAnchor="middle" fontSize="8" fill="#8B6914" fontWeight="700">
        $
      </text>
    </svg>
  )
}
