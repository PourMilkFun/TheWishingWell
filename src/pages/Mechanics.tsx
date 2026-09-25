import { Link } from 'react-router-dom'
import { SoftBlob, MechanicsDiagram, PourDivider } from '../components/MilkIllustrations'
import { CoinIcon } from '../components/Logo'

const steps = [
  {
    n: '01',
    title: 'Trade happens',
    body: 'Buyers and sellers swap on the bonding curve. A creator fee (0.25–3%) is skimmed on each fill.',
  },
  {
    n: '02',
    title: 'Fee routes to vault',
    body: 'Fees are meant to land in a public Wish vault instead of a private wallet. The meter shows fill.',
  },
  {
    n: '03',
    title: 'Buyback & Burn thickens depth',
    body: 'When vault thresholds hit, automated Buyback & Burn recycles SOL into the token, deepening liquidity.',
  },
  {
    n: '04',
    title: 'Locked LP on graduation',
    body: 'At curve completion, vault remainder seeds Locked LP. Liquidity stays locked, not rug-pullable.',
  },
]

export function Mechanics() {
  return (
    <div className="relative">
      <SoftBlob className="right-0 top-20 h-72 w-72" color="bg-rose-100" />
      <SoftBlob className="-left-20 bottom-40 h-56 w-56" color="bg-cream-300" />

      <div className="container-page relative py-14">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-milk/90 px-3.5 py-1.5 text-xs font-semibold text-rose-600 shadow-sm">
            <CoinIcon className="h-3.5 w-3.5" />
            How Wish works
          </div>
          <h1 className="text-title text-4xl sm:text-[2.75rem]">
            Fees → vault → Buyback & Burn + Locked LP
          </h1>
          <p className="mt-4 text-body text-lg">
            Wish’s twist vs the usual generic launchpad clone: the vault is{' '}
            <em className="not-italic font-semibold text-ink-800">provable</em>. Badges unlock only
            when the meter is live and receipts exist.
          </p>
        </div>

        <MechanicsDiagram />

        <PourDivider className="my-12" />

        <div className="grid gap-5 sm:grid-cols-2">
          {steps.map((s) => (
            <div key={s.n} className="glass-card-hover rounded-2xl p-6 sm:p-7">
              <span className="font-mono text-xs font-bold tracking-widest text-rose-400">
                {s.n}
              </span>
              <h2 className="mt-3 text-title text-xl">{s.title}</h2>
              <p className="mt-2.5 text-sm text-body">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-cream-50 p-7 sm:p-8">
            <h2 className="text-title text-xl">Why not just a badge?</h2>
            <p className="mt-3 text-sm text-body">
              Other boards stamp “indexed” early. Wish withholds{' '}
              <strong className="text-ink-800">VAULT LIVE</strong> until the vault contract is
              funded and meters move. Inspect pages show the fill level and execution receipts,
              so vault claims are verifiable, not marketing.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-600">
              {[
                'Badge only when vault is real',
                'Public fee route on every coin page',
                'Receipts for fee route, Buyback & Burn, Locked LP',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vault/20 text-vault-dark">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-cream-300/80 bg-milk p-7 sm:p-8 shadow-sm">
            <h2 className="text-title text-xl">Marker ≠ endorsement</h2>
            <p className="mt-3 text-sm text-body">
              <strong className="text-ink-800">PUBLIC MARKER</strong> /{' '}
              <strong className="text-ink-800">Wish-INDEXED</strong> means the coin is visible on
              the public index board. It does not mean audited, safe, or recommended. Markets are
              chaotic. Markets can still dump. We just show the vault.
            </p>
            <p className="mt-4 text-xs text-ink-400 leading-relaxed">
              Vault metering is product UI in v1. Pump create is live on mainnet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/launch" className="btn-primary !py-2.5">
                Launch a coin
              </Link>
              <Link to="/launches" className="btn-secondary !py-2.5">
                Browse launches
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
