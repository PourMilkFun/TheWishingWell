import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ProtocolStrip } from './ProtocolStrip'
import { TickerMarquee } from './TickerMarquee'
import { Footer } from './Footer'
import { FloatingCoins } from './FloatingCoins'

function PastelWash() {
  return (
    <div className="pastel-wash-layer" aria-hidden>
      <div className="mist-wash" style={{ top: '8%' }} />
      <div
        className="mist-wash"
        style={{ top: '55%', transform: 'skewY(4deg)', opacity: 0.45 }}
      />
      <div className="mist-blob" style={{ width: 220, height: 180, left: '6%', top: '22%' }} />
      <div
        className="mist-blob"
        style={{ width: 160, height: 140, right: '8%', top: '48%', animationDelay: '-8s' }}
      />
      <div
        className="mist-blob"
        style={{ width: 120, height: 100, left: '40%', bottom: '12%', animationDelay: '-14s' }}
      />
      <svg
        className="star-sil"
        style={{ left: '12%', top: '62%', width: 24, height: 24 }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.6z" />
      </svg>
      <svg
        className="star-sil"
        style={{ right: '18%', top: '28%', width: 18, height: 18 }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.6z" />
      </svg>
      <svg
        className="star-sil"
        style={{ left: '55%', top: '75%', width: 14, height: 14 }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.6z" />
      </svg>
    </div>
  )
}

export function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="noise-overlay" aria-hidden />
      <PastelWash />
      <FloatingCoins />
      <Navbar />
      <ProtocolStrip />
      <TickerMarquee />
      <main className="relative z-[1] flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
