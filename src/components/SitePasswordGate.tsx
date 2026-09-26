import { useState, type FormEvent, type ReactNode } from 'react'
import { SiteIntro, shouldShowIntro } from './SiteIntro'

const STORAGE_KEY = 'wish-site-gate-v1'
/** Preview gate only — soft lock for casual visitors until public launch. */
const SITE_PASSWORD = 'KayKay'

function alreadyUnlocked(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function SitePasswordGate({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(() => !shouldShowIntro())
  const [unlocked, setUnlocked] = useState(alreadyUnlocked)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (!introDone) {
    return <SiteIntro onComplete={() => setIntroDone(true)} />
  }

  if (unlocked) return <>{children}</>

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (value === SITE_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
      setError(false)
      setUnlocked(true)
      return
    }
    setError(true)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-sky-soft via-milk to-cream-100 px-4 py-16">
      <div className="noise-overlay" aria-hidden />
      <div
        className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-amber/25 blur-3xl"
        aria-hidden
      />

      <div className="relative z-[1] w-full max-w-md">
        <div className="milk-card rounded-3xl p-8 sm:p-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src="/tokens/wish-well-logo.jpg"
              alt=""
              width={72}
              height={72}
              className="mb-4 h-[72px] w-[72px] rounded-2xl border-2 border-rose-100 object-cover shadow-soft"
              aria-hidden
            />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-rose-400">
              Wish
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              Private well
            </h1>
            <p className="mt-2 text-sm font-semibold text-ink-400">
              Enter the password to open the site. We’re not public yet.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (error) setError(false)
                }}
                className={`input-field ${error ? '!border-rose-400' : ''}`}
                placeholder="••••••••"
                aria-invalid={error}
              />
            </label>
            {error && (
              <p className="text-center text-xs font-bold text-rose-500" role="alert">
                Wrong password — try again.
              </p>
            )}
            <button type="submit" className="btn-primary w-full !py-3">
              Unlock site
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
