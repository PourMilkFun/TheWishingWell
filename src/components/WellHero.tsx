import { useEffect, useRef, useState } from 'react'

/**
 * Center hero art: muted autoplay of intro.mp4.
 * Plays once then holds the last frame (video does not loop cleanly).
 * Soft pastel claymorphic frame matching the logo.
 */
export function WellHero({ launches = 0 }: { launches?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.loop = false
    const play = v.play()
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        /* autoplay blocked — poster/last-attempt still shows frame */
      })
    }
  }, [])

  function holdLastFrame() {
    const v = videoRef.current
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return
    /* Nudge to end and pause so we freeze on the full-well frame */
    try {
      v.pause()
      v.currentTime = Math.max(0, v.duration - 0.05)
    } catch {
      /* ignore seek errors */
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[420px] animate-float" aria-hidden>
      <div className="absolute -left-8 top-10 h-36 w-36 rounded-full bg-rose-200/35 blur-3xl blob animate-drift" />
      <div
        className="absolute -right-6 bottom-6 h-40 w-40 rounded-full bg-amber/25 blur-3xl blob animate-drift-slow"
        style={{ animationDelay: '-6s' }}
      />

      <div className="well-hero-frame relative">
        <div className="well-hero-chrome">
          <video
            ref={videoRef}
            className={`well-hero-video ${ready ? 'well-hero-video--ready' : ''}`}
            src="/intro.mp4"
            playsInline
            muted
            autoPlay
            preload="auto"
            poster="/tokens/wish-well-logo.jpg"
            onLoadedData={() => setReady(true)}
            onEnded={holdLastFrame}
          />
        </div>

        <div className="well-hero-plaque">
          <p className="font-display text-sm font-semibold text-ink-900">The Well</p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
            {launches} {launches === 1 ? 'wish' : 'wishes'}
          </p>
        </div>
      </div>
    </div>
  )
}
