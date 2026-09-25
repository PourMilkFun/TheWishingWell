import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-rose-100/40 bg-gradient-to-b from-cream-100/40 to-cream-200/30">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Logo size="sm" />
            <p className="text-sm text-ink-500 leading-relaxed max-w-xs">
              Liquidity in the well. Fees → vault → Locked LP.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-label">Product</p>
            <div className="space-y-2 text-sm">
              <Link to="/launches" className="block text-ink-500 transition hover:text-rose-400">
                Browse launches
              </Link>
              <Link to="/launch" className="block text-ink-500 transition hover:text-rose-400">
                Launch a coin
              </Link>
              <Link to="/mechanics" className="block text-ink-500 transition hover:text-rose-400">
                How it works
              </Link>
              <Link to="/docs" className="block text-ink-500 transition hover:text-rose-400">
                Docs
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-label">Protocol</p>
            <div className="space-y-2 text-sm">
              <Link to="/docs/vault" className="block text-ink-500 transition hover:text-rose-400">
                The Well
              </Link>
              <Link to="/docs/how-it-works" className="block text-ink-500 transition hover:text-rose-400">
                How fees flow
              </Link>
              <Link to="/docs/faq" className="block text-ink-500 transition hover:text-rose-400">
                FAQ
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-label">Status</p>
            <div className="space-y-2 text-sm">
              <p className="inline-flex items-center gap-2 text-ink-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                Mainnet Pump launches · v2
              </p>
              <p className="text-ink-400">Real create_v2 on Solana</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-rose-100/40 bg-milk/50 px-5 py-4">
          <p className="text-[11px] text-ink-400 leading-relaxed">
            <span className="font-semibold text-ink-500">Disclaimer.</span> Public markers indicate
            on-chain index eligibility — not endorsement, audit, or investment advice. VAULT LIVE
            reflects vault meter status when the well is live. Tokenized stock quotes are third-party
            tokens — not equity. Wish does not sell stocks. Always DYOR. Markets are volatile.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-rose-100/40 pt-6 text-xs text-ink-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Wish. Frontend prototype — not financial advice.</p>
          <p className="font-medium tracking-wide">Fees → well → Locked LP.</p>
        </div>
      </div>
    </footer>
  )
}
