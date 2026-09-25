import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import { WalletButton } from './WalletButton'

const sideLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/launches', label: 'Launches' },
]

const rightLinks = [
  { to: '/mechanics', label: 'Mechanics' },
  { to: '/docs', label: 'Docs' },
]

const mobileLinks: { to: string; label: string; end?: boolean }[] = [
  ...sideLinks,
  { to: '/launch', label: 'Launch' },
  ...rightLinks,
]

function linkClass({ isActive }: { isActive: boolean }) {
  return `rounded-full px-3.5 py-1.5 text-[13px] font-semibold tracking-tight transition-all duration-200 ${
    isActive
      ? 'bg-rose-100 text-rose-600 shadow-sm'
      : 'text-ink-500 hover:bg-cream-100 hover:text-ink-900'
  }`
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100/50 bg-cream-50/70 backdrop-blur-2xl">
      <div className="container-page relative flex items-center justify-between gap-4 py-3.5">
        <Logo />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-rose-100/60 bg-milk/70 p-1.5 shadow-sm md:flex">
          {sideLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}

          <NavLink
            to="/launch"
            className={({ isActive }) =>
              `rounded-full px-5 py-2 text-sm font-extrabold tracking-tight text-ink-900 transition-all duration-200 ${
                isActive
                  ? 'bg-rose-500 shadow-[0_0_0_3px_rgba(240,200,90,0.28),0_4px_0_rgba(139,105,20,0.28)]'
                  : 'bg-rose-400 shadow-[0_3px_0_rgba(139,105,20,0.28)] hover:bg-rose-300 hover:-translate-y-0.5'
              }`
            }
          >
            Launch
          </NavLink>

          {rightLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <WalletButton />
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200/80 bg-milk text-ink-700 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-rose-100/60 bg-cream-50/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-0.5">
            {mobileLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  l.to === '/launch'
                    ? `mt-1 rounded-full px-4 py-2.5 text-center text-sm font-extrabold text-ink-900 ${
                        isActive ? 'bg-rose-500' : 'bg-rose-400'
                      }`
                    : `rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                        isActive ? 'bg-rose-100 text-rose-600' : 'text-ink-600'
                      }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 sm:hidden">
              <WalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
