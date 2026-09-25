/** Soft rising milk bubbles — CSS-only, GPU-friendly, no JS animation loop. */
const BUBBLES = [
  { left: '6%', size: 10, delay: 0, dur: 18 },
  { left: '14%', size: 6, delay: 3, dur: 22 },
  { left: '22%', size: 14, delay: 7, dur: 16 },
  { left: '31%', size: 8, delay: 1.5, dur: 20 },
  { left: '42%', size: 11, delay: 9, dur: 24 },
  { left: '53%', size: 7, delay: 4, dur: 19 },
  { left: '61%', size: 16, delay: 11, dur: 17 },
  { left: '72%', size: 9, delay: 2, dur: 21 },
  { left: '81%', size: 5, delay: 6, dur: 15 },
  { left: '88%', size: 12, delay: 13, dur: 23 },
  { left: '94%', size: 7, delay: 8, dur: 18 },
  { left: '48%', size: 4, delay: 15, dur: 26 },
]

export function FloatingBubbles() {
  return (
    <div className="bubbles-layer" aria-hidden>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
