import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'wish.intro.seen.v1'
/** Fallback if `ended` never fires (slow decode / autoplay quirks). Video is ~6s. */
const MAX_MS = 7200

export function shouldShowIntro() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('intro') === '1') return true
  if (params.get('intro') === '0') return false
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

type SiteIntroProps = {
  /** Called once the intro has finished (or was already skipped). */
  onComplete?: () => void
}

/** Fullscreen intro — plays once, fades out, then yields to the app. */
export function SiteIntro({ onComplete }: SiteIntroProps = {}) {
  const [visible, setVisible] = useState(shouldShowIntro)
  const [exiting, setExiting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closed = useRef(false)
  const completed = useRef(false)

  function notifyComplete() {
    if (completed.current) return
    completed.current = true
    onComplete?.()
  }

  function finish() {
    if (closed.current) return
    closed.current = true
    markSeen()
    setExiting(true)
    window.setTimeout(() => {
      setVisible(false)
      notifyComplete()
    }, 800)
  }

  useEffect(() => {
    if (!visible) {
      notifyComplete()
      return
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const v = videoRef.current
    if (v) {
      v.loop = false
      v.currentTime = 0
      const play = v.play()
      if (play && typeof play.catch === 'function') {
        play.catch(() => {
          window.setTimeout(finish, 1200)
        })
      }
    }

    const fallback = window.setTimeout(finish, MAX_MS)

    return () => {
      document.body.style.overflow = prevOverflow
      window.clearTimeout(fallback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  if (!visible) return null

  return (
    <div
      className={`site-intro ${exiting ? 'site-intro--out' : ''}`}
      role="dialog"
      aria-label="Wish intro"
      aria-modal="true"
    >
      <video
        ref={videoRef}
        className="site-intro__video"
        src="/intro.mp4"
        playsInline
        muted
        autoPlay
        preload="auto"
        onEnded={finish}
      />

      {/* Video already burns in "Wishing Well" — no HTML title overlay (avoids double text). */}
      <div className="site-intro__veil" aria-hidden />

      <p className="site-intro__loading" aria-live="polite">
        <span className="site-intro__loading-dot" aria-hidden />
        Loading
      </p>

      <button type="button" className="site-intro__skip" onClick={finish}>
        Skip
      </button>
    </div>
  )
}
