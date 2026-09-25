export function HeroGlass({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute -left-10 top-8 h-36 w-36 rounded-full bg-rose-200/40 blur-3xl blob animate-drift" />
      <div
        className="absolute -right-8 bottom-4 h-44 w-44 rounded-full bg-rose-100/50 blur-3xl blob animate-drift-slow"
        style={{ animationDelay: '-6s' }}
      />
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream-200/30 blur-2xl" />

      {/* Overlapping splash blob behind glass */}
      <svg
        className="absolute -left-6 top-12 w-40 opacity-70 animate-wobble"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path
          d="M60 10 C90 15 115 45 100 75 C85 105 40 115 20 85 C0 55 30 5 60 10Z"
          fill="#F5C9B0"
          opacity="0.45"
        />
        <circle cx="88" cy="38" r="8" fill="#E8B86D" opacity="0.5" />
        <circle cx="30" cy="55" r="5" fill="#FFE8DC" opacity="0.8" />
      </svg>

      <svg
        viewBox="0 0 320 380"
        className="relative mx-auto w-full max-w-[300px] drop-shadow-2xl animate-float"
      >
        <defs>
          <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F8FBFF" />
            <stop offset="100%" stopColor="#FFE8DC" />
          </linearGradient>
          <linearGradient id="glassStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5C9B0" />
            <stop offset="100%" stopColor="#D4A017" />
          </linearGradient>
          <linearGradient id="pourGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8B86D" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="glassClip">
            <path d="M85 75 L95 310 Q160 335 225 310 L235 75 Z" />
          </clipPath>
        </defs>

        <path
          d="M20 200 Q80 160 140 190 T280 170 L300 380 L20 380 Z"
          fill="#FFE8DC"
          opacity="0.25"
        />

        <g filter="url(#softGlow)">
          <ellipse cx="160" cy="18" rx="14" ry="7" fill="url(#pourGrad)" opacity="0.9" />
          <path
            d="M160 22 Q157 45 160 68"
            stroke="url(#pourGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
        </g>

        <path
          d="M85 75 L95 310 Q160 335 225 310 L235 75"
          fill="rgba(255,254,252,0.4)"
          stroke="url(#glassStroke)"
          strokeWidth="2.5"
        />
        <ellipse cx="160" cy="75" rx="76" ry="10" fill="none" stroke="url(#glassStroke)" strokeWidth="2.5" />

        <g clipPath="url(#glassClip)">
          <rect
            x="85"
            y="145"
            width="150"
            height="200"
            fill="url(#milkFill)"
            className="animate-pour"
            style={{ transformOrigin: 'center bottom' }}
          />
          <ellipse cx="160" cy="148" rx="74" ry="16" fill="#FFFEFC" />
          <ellipse cx="125" cy="142" rx="20" ry="11" fill="#FFF" opacity="0.95" />
          <ellipse cx="175" cy="140" rx="24" ry="13" fill="#FFF" opacity="0.9" />
          <ellipse cx="200" cy="150" rx="14" ry="8" fill="#FFE8DC" opacity="0.55" />
          <ellipse cx="140" cy="152" rx="10" ry="6" fill="#F5C9B0" opacity="0.35" />
        </g>

        <path d="M110 100 L115 270" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
        <path d="M120 95 L123 180" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

        <circle cx="250" cy="95" r="7" fill="#E8B86D" opacity="0.7" className="animate-drip" />
        <circle cx="265" cy="115" r="3.5" fill="#F5C9B0" opacity="0.8" />
        <circle cx="60" cy="110" r="5" fill="#F5C9B0" opacity="0.75" />
        <circle cx="48" cy="130" r="2.5" fill="#E8B86D" opacity="0.6" />

        <ellipse cx="160" cy="345" rx="55" ry="8" fill="#F5C9B0" opacity="0.3" />
      </svg>
    </div>
  )
}

export function SoftBlob({
  className = '',
  color = 'bg-rose-100',
}: {
  className?: string
  color?: string
}) {
  return (
    <div
      className={`blob absolute ${color} blur-3xl opacity-50 pointer-events-none animate-drift ${className}`}
      aria-hidden
    />
  )
}

/** Frothy cream pour SVG transition between sections */
export function FrothDivider({ flip = false, className = '' }: { flip?: boolean; className?: string }) {
  return (
    <div className={`relative -mb-px leading-[0] ${className}`} aria-hidden>
      <svg
        className={`w-full ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1440 90"
        fill="none"
        preserveAspectRatio="none"
        style={{ height: 72 }}
      >
        <path
          d="M0 50 C120 20 200 70 340 45 C480 20 560 75 720 50 C880 25 980 70 1140 40 C1260 20 1380 55 1440 40 L1440 90 L0 90 Z"
          fill="#FFFEFC"
        />
        <path
          d="M0 58 C160 30 240 78 400 52 C560 28 640 80 800 55 C960 30 1080 72 1240 48 C1340 35 1400 60 1440 52 L1440 90 L0 90 Z"
          fill="#FFE8DC"
          opacity="0.55"
        />
        {/* foam bubbles along the crest */}
        <circle cx="180" cy="42" r="7" fill="#FFFEFC" stroke="#F5C9B0" strokeWidth="1.5" />
        <circle cx="420" cy="38" r="5" fill="#F8FBFF" stroke="#F5C9B0" strokeWidth="1.2" />
        <circle cx="760" cy="44" r="8" fill="#FFFEFC" stroke="#F5C9B0" strokeWidth="1.5" />
        <circle cx="1100" cy="36" r="6" fill="#F8FBFF" stroke="#F5C9B0" strokeWidth="1.2" />
        <circle cx="1320" cy="42" r="4" fill="#FFE8DC" />
      </svg>
    </div>
  )
}

export function CreamWave({ className = '' }: { className?: string }) {
  return <FrothDivider className={className} />
}

export function PourDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-4 ${className}`} aria-hidden>
      <div className="h-1 flex-1 max-w-32 rounded-full bg-gradient-to-r from-transparent via-rose-200 to-rose-200" />
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-2xl bg-rose-100/90 animate-wobble" />
        <img
          src="/tokens/wish-well-logo.jpg"
          alt=""
          width={40}
          height={40}
          className="relative z-[1] rounded-xl shadow-[0_3px_0_rgba(255,193,214,0.55)] ring-2 ring-rose-100"
        />
      </div>
      <div className="h-1 flex-1 max-w-32 rounded-full bg-gradient-to-l from-transparent via-rose-200 to-rose-200" />
    </div>
  )
}

/** Big milk-splash SVG for overlapping behind hero type */
export function MilkSplash({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute ${className}`}
      viewBox="0 0 400 280"
      fill="none"
      aria-hidden
    >
      <path
        d="M40 140 C60 40 180 10 260 60 C340 110 380 200 300 240 C220 280 80 250 40 140Z"
        fill="#FFE8DC"
        opacity="0.55"
      />
      <path
        d="M100 160 C130 90 220 70 280 110 C330 145 320 210 250 230 C170 255 70 220 100 160Z"
        fill="#FFFEFC"
        opacity="0.7"
      />
      <circle cx="320" cy="70" r="18" fill="#F5C9B0" opacity="0.6" />
      <circle cx="350" cy="100" r="8" fill="#E8B86D" opacity="0.45" />
      <circle cx="70" cy="80" r="12" fill="#F8FBFF" opacity="0.8" stroke="#F5C9B0" strokeWidth="2" />
      <circle cx="50" cy="110" r="5" fill="#E8B86D" opacity="0.4" />
    </svg>
  )
}

export function MechanicsDiagram() {
  const nodes = [
    { label: 'Trade', sub: 'Bonding fill', icon: TradeIcon },
    { label: 'Fee skim', sub: '0.25–3%', icon: DropletSmall },
    { label: 'Vault', sub: 'Public meter', icon: VaultIcon },
    { label: 'Buyback & Burn', sub: 'Depth in', icon: CycleIcon },
    { label: 'Locked LP', sub: 'Stays locked', icon: LockIcon },
  ]

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-rose-100 bg-gradient-to-br from-milk via-cream-50 to-rose-50/80 p-6 sm:p-10 cream-texture">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-100/40 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-cream-300/40 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-2">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center gap-4 md:flex-1 md:flex-col md:gap-3">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] border-2 border-rose-100 bg-milk shadow-[0_4px_0_rgba(255,193,214,0.45)]">
              <node.icon />
            </div>
            <div className="md:text-center">
              <p className="font-display text-sm font-semibold tracking-tight text-ink-900">
                {node.label}
              </p>
              <p className="text-xs font-semibold text-ink-400 mt-0.5">{node.sub}</p>
            </div>
            {i < nodes.length - 1 && (
              <span className="ml-auto text-rose-300 font-bold md:hidden" aria-hidden>
                ↓
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="relative mt-2 hidden md:block px-10">
        <div className="absolute left-[10%] right-[10%] top-0 h-1 rounded-full bg-gradient-to-r from-rose-200 via-rose-300 to-vault overflow-hidden">
          <div className="absolute inset-0 froth-shimmer opacity-60" />
        </div>
        <div className="flex justify-between px-[8%]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-rose-300 bg-milk"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TradeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 16l4-4 3 3 6-7" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h4v4" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DropletSmall() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#E8B86D" aria-hidden>
      <path d="M12 2.5c-.8 0-4.5 4.6-4.5 9 0 4.2 1.9 7.5 4.5 7.5s4.5-3.3 4.5-7.5c0-4.4-3.7-9-4.5-9z" />
    </svg>
  )
}

function VaultIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="#B8860B" strokeWidth="1.8" />
      <path d="M5 10h14" stroke="#B8860B" strokeWidth="1.8" />
      <path d="M9 14h6" stroke="#E8B86D" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CycleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12a8 8 0 0114-5.3" stroke="#B8860B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 4v4h-4" stroke="#B8860B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 01-14 5.3" stroke="#E8B86D" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 20v-4h4" stroke="#E8B86D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#B8860B" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 018 0v3" stroke="#B8860B" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="#E8B86D" />
    </svg>
  )
}
