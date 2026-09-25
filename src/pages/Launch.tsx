import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '../hooks/useWallet'
import { loadQuotes, filterQuotes, type QuoteToken } from '../lib/quotes'
import {
  uploadPumpMetadata,
  toHttpImageUrl,
  isUsableImageUrl,
  prepareTokenImage,
  fileToThumbDataUrl,
  rewriteIpfsGateway,
} from '../lib/ipfs'
import { launchPumpCoin, type PairMode } from '../lib/launchCoin'
import { patchMyLaunchImage, patchMyLaunchMeta, saveMyLaunch } from '../lib/myLaunches'
import { fetchPumpStatsFresh } from '../lib/pumpStats'
import { NATIVE_MINT, USDC_MINT, PUMP_COIN, SOLSCAN_TOKEN, SOLSCAN_TX } from '../lib/constants'

type Result = {
  mint: string
  signature: string
  quoteTicker: string
  buyWarning?: string
}

export function Launch() {
  const { connected, connect, publicKey, signTransaction, connection } = useWallet()

  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [description, setDescription] = useState('')
  const [twitter, setTwitter] = useState('')
  const [telegram, setTelegram] = useState('')
  const [website, setWebsite] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [pairMode, setPairMode] = useState<PairMode>('sol')
  const [selectedQuote, setSelectedQuote] = useState<QuoteToken | null>(null)
  const [quoteQuery, setQuoteQuery] = useState('')
  const [quoteTab, setQuoteTab] = useState<'stock' | 'crypto' | 'other'>('stock')
  const [quotes, setQuotes] = useState<QuoteToken[]>([])
  const [quotesSource, setQuotesSource] = useState('')
  const [quotesLoading, setQuotesLoading] = useState(true)

  const [fee, setFee] = useState(1)
  const [initialBuy, setInitialBuy] = useState('0')
  const [agreed, setAgreed] = useState(false)

  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setQuotesLoading(true)
      try {
        const { quotes: q, source } = await loadQuotes()
        if (!cancelled) {
          setQuotes(q)
          setQuotesSource(source)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load quotes')
      } finally {
        if (!cancelled) setQuotesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (pairMode === 'stock') setFee((f) => Math.min(1, Math.max(0.05, f > 1 ? 0.5 : f)))
  }, [pairMode])

  const feeMin = 0.05
  const feeMax = 1
  const feeStep = 0.05

  const displayedQuotes = useMemo(() => {
    if (quoteTab === 'other') {
      return filterQuotes(quotes, { category: 'all', query: quoteQuery }).filter(
        (q) => q.category === 'commodity' || q.category === 'other',
      )
    }
    return filterQuotes(quotes, { category: quoteTab, query: quoteQuery })
  }, [quotes, quoteQuery, quoteTab])

  function onImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const canLaunch =
    !!name.trim() &&
    !!ticker.trim() &&
    !!imageFile &&
    agreed &&
    (pairMode !== 'stock' || !!selectedQuote)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!connected || !publicKey || !signTransaction) {
      connect()
      return
    }
    if (!agreed || !name || !ticker || !imageFile) return
    if (pairMode === 'stock' && !selectedQuote) {
      setError('Pick a stock / custom quote mint')
      return
    }

    setBusy(true)
    try {
      setStatus('Preparing image…')
      const prepared = await prepareTokenImage(imageFile)
      // Always capture a local thumb of the EXACT file we deploy — UI must show art
      // even when IPFS gateways (ipfs.io etc.) fail to load in the browser.
      let thumb: string
      try {
        thumb = await fileToThumbDataUrl(prepared)
      } catch (thumbErr) {
        throw new Error(
          thumbErr instanceof Error
            ? `Could not create local thumbnail of your coin art: ${thumbErr.message}`
            : 'Could not create local thumbnail of your coin art',
        )
      }
      if (!thumb || !/^data:image\//i.test(thumb)) {
        throw new Error('Could not create local thumbnail of your coin art')
      }

      setStatus('Uploading metadata to IPFS…')
      const meta = await uploadPumpMetadata({
        file: prepared,
        name: name.trim(),
        symbol: ticker.trim(),
        description: description.trim() || undefined,
        twitter: twitter.trim() || undefined,
        telegram: telegram.trim() || undefined,
        website: website.trim() || undefined,
      })

      setStatus('Approve in Phantom within ~60 seconds — keep the popup focused…')
      const buy = Number(initialBuy) || 0
      const launched = await launchPumpCoin({
        connection,
        user: publicKey,
        signTransaction,
        name: name.trim(),
        symbol: ticker.trim(),
        metadataUri: meta.metadataUri,
        pairMode,
        onStatus: setStatus,
        quoteMint:
          pairMode === 'stock' && selectedQuote
            ? new PublicKey(selectedQuote.mint)
            : pairMode === 'usdc'
              ? USDC_MINT
              : undefined,
        quoteTicker:
          pairMode === 'stock'
            ? selectedQuote?.ticker
            : pairMode === 'usdc'
              ? 'USDC'
              : 'SOL',
        creatorFeePercent: fee,
        initialBuy: buy > 0 ? buy : undefined,
      })

      const savedImage = (() => {
        const fromMeta = toHttpImageUrl(meta.imageUri || '')
        if (!isUsableImageUrl(fromMeta)) return ''
        // Prefer nftstorage.link over flaky ipfs.io
        return rewriteIpfsGateway(fromMeta)
      })()

      saveMyLaunch({
        id: launched.mint,
        mint: launched.mint,
        name: name.trim(),
        ticker: ticker.trim(),
        description: description.trim(),
        imageUrl: savedImage,
        imageThumb: thumb,
        metadataUri: meta.metadataUri,
        creatorFee: pairMode === 'stock' ? fee : 1.25,
        quoteMint: launched.quoteMint,
        quoteTicker: launched.quoteTicker,
        pairMode,
        signature: launched.signature,
        createdAt: new Date().toISOString(),
        socials: {
          twitter: twitter.trim() || undefined,
          telegram: telegram.trim() || undefined,
          website: website.trim() || undefined,
        },
      })

      // Pump may index art a beat after create — backfill if upload lacked imageUri.
      if (!savedImage) {
        void (async () => {
          for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0) {
              await new Promise((r) => setTimeout(r, 1200 * attempt))
            }
            const stats = await fetchPumpStatsFresh(launched.mint)
            if (!stats) continue
            if (stats.imageUrl && isUsableImageUrl(stats.imageUrl)) {
              patchMyLaunchImage(launched.mint, stats.imageUrl)
            }
            if (stats.name || stats.symbol) {
              patchMyLaunchMeta(launched.mint, {
                name: stats.name,
                ticker: stats.symbol,
              })
            }
            if (stats.imageUrl && isUsableImageUrl(stats.imageUrl)) break
          }
        })()
      }

      setResult({
        mint: launched.mint,
        signature: launched.signature,
        quoteTicker: launched.quoteTicker,
        buyWarning: launched.buyWarning,
      })
      setStatus('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  const quoteLabel =
    pairMode === 'sol' ? 'SOL' : pairMode === 'usdc' ? 'USDC' : selectedQuote?.ticker || 'Quote'

  if (result) {
    return (
      <div className="container-page max-w-lg py-24 text-center">
        <div className="well-panel p-10 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/50 bg-gradient-to-br from-rose-100/40 to-cream-200">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="mt-5 text-title text-2xl">Wish cast on-chain</h1>
          <p className="mt-2 text-sm text-body">
            <strong className="text-ink-800">${ticker}</strong> is live on Pump · pair{' '}
            <strong>{quoteLabel}</strong>
          </p>
          <p className="mt-3 break-all font-mono text-xs text-ink-500">{result.mint}</p>
          {result.buyWarning && (
            <p className="mt-3 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-ink-700">
              {result.buyWarning}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <a className="btn-secondary !py-2.5" href={PUMP_COIN(result.mint)} target="_blank" rel="noreferrer">
              Open on pump.fun
            </a>
            <a className="btn-secondary !py-2.5" href={SOLSCAN_TOKEN(result.mint)} target="_blank" rel="noreferrer">
              View mint on Solscan
            </a>
            <a className="btn-secondary !py-2.5" href={SOLSCAN_TX(result.signature)} target="_blank" rel="noreferrer">
              View create tx
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={`/coin/${result.mint}`} className="btn-primary !py-2.5">
              Inspect
            </Link>
            <Link to="/launches" className="btn-secondary !py-2.5">
              Browse launches
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-x-hidden">
      <div className="container-page py-10 lg:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-label mb-3">Create</p>
          <h1 className="text-title text-4xl sm:text-[2.75rem]">Cast your wish</h1>
          <p className="mt-3 text-body">
            Split flow · live preview on the left · Pump mainnet create on the right.
          </p>
          <p className="mt-2 rounded-xl border border-amber/30 bg-amber/10 px-3 py-2 text-[11px] leading-relaxed text-ink-600">
            <strong>Disclaimer:</strong> Tokenized stock quotes are third-party tokens, not equity.
            Wish does not sell stocks. DYOR.
          </p>
        </div>

        {/* Step pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            '01 Wish',
            '02 Art',
            '03 Pair',
            '04 Seal',
          ].map((s) => (
            <span
              key={s}
              className="rounded-full border border-rose-200/50 bg-cream-100/50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-rose-400"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Sticky preview */}
          <aside className="lg:col-span-4">
            <div className="well-panel sticky top-24 space-y-4 p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
                Live preview
              </p>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-rose-200/40 bg-gradient-to-br from-cream-200 to-cream-100">
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="px-6 text-center">
                    <p className="text-4xl">✨</p>
                    <p className="mt-2 text-xs font-semibold text-ink-400">Art drops here</p>
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink-900">
                  {name.trim() || 'Your wish'}
                </h2>
                <p className="font-mono text-sm font-bold text-rose-400">
                  ${ticker.trim() || 'TICKER'}
                </p>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-200/40 to-transparent" />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-400">Pair</dt>
                  <dd className="font-bold text-ink-800">{quoteLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-400">Creator fee</dt>
                  <dd className="font-bold tabular-nums text-ink-800">{fee}%</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-400">Fee route</dt>
                  <dd className="font-bold text-rose-400">→ The Well</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-400">Initial buy</dt>
                  <dd className="font-bold tabular-nums text-ink-800">
                    {initialBuy || '0'} {quoteLabel}
                  </dd>
                </div>
              </dl>
              <p className="text-[11px] font-semibold leading-relaxed text-ink-400">
                Fees from this mint are meant for the public well — not a private creator wallet.
              </p>
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-8">
            <form onSubmit={onSubmit} className="well-panel space-y-8 p-5 sm:p-7">
          {/* Identity */}
          <section className="space-y-5">
            <h2 className="text-label">01 · Cast your wish</h2>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-700">02 · Drop art in the well</label>
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-rose-200/50 bg-cream-100/40 px-4 py-10 transition hover:border-rose-300 hover:bg-rose-50/40">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-28 w-28 rounded-2xl object-cover shadow-lg ring-2 ring-rose-100"
                  />
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-100 bg-rose-50">
                      <span className="text-xl">📷</span>
                    </div>
                    <span className="mt-3 text-sm font-semibold text-ink-700">
                      Drop image or click to upload
                    </span>
                    <span className="mt-1 text-xs text-ink-300">PNG, JPG · uploaded to IPFS</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={onImage} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink-700">
                  Name
                </label>
                <input
                  id="name"
                  required
                  maxLength={32}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Token name"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="ticker" className="mb-1.5 block text-sm font-semibold text-ink-700">
                  Ticker
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-300">
                    $
                  </span>
                  <input
                    id="ticker"
                    required
                    maxLength={10}
                    value={ticker}
                    onChange={(e) =>
                      setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                    }
                    placeholder="TICKER"
                    className="input-field !pl-7 font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="desc" className="mb-1.5 block text-sm font-semibold text-ink-700">
                Description <span className="font-normal text-ink-300">(optional)</span>
              </label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Short description…"
                className="input-field resize-none"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink-700">
                Socials <span className="font-normal text-ink-300">(optional)</span>
              </p>
              <input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="X / Twitter URL"
                className="input-field"
              />
              <input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Telegram URL"
                className="input-field"
              />
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website URL"
                className="input-field"
              />
            </div>
          </section>

          <div className="h-px bg-rose-100/80" />

          {/* Pair & fees */}
          <section className="space-y-5">
            <h2 className="text-label">03 · Pair the well</h2>
            <div>
              <p className="mb-2.5 text-sm font-semibold text-ink-700">Pair mode</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: 'sol' as const, title: 'SOL', sub: 'Classic bonding' },
                    { id: 'usdc' as const, title: 'USDC', sub: 'Stable quote' },
                    { id: 'stock' as const, title: 'Stock / Custom', sub: 'Live registry' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPairMode(p.id)
                      if (p.id !== 'stock') setSelectedQuote(null)
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      pairMode === p.id
                        ? 'border-rose-300 bg-rose-950/40 shadow-[0_0_0_1px_rgba(201,162,39,0.35)]'
                        : 'border-cream-300/40 bg-cream-100/20 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <p className="font-semibold text-ink-900">{p.title}</p>
                    <p className="text-[11px] text-ink-500">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {pairMode === 'stock' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-700">
                    Quote mint{' '}
                    <span className="font-normal text-ink-300">
                      {quotesLoading ? 'loading…' : `· ${quotesSource}`}
                    </span>
                  </p>
                  {selectedQuote && (
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                      {selectedQuote.ticker}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {(['stock', 'crypto', 'other'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQuoteTab(t)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        quoteTab === t ? 'bg-rose-400 text-ink-900' : 'bg-cream-200 text-ink-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  value={quoteQuery}
                  onChange={(e) => setQuoteQuery(e.target.value)}
                  placeholder="Search ticker, name, or mint…"
                  className="input-field"
                />
                <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                  {displayedQuotes.slice(0, 60).map((q) => (
                    <button
                      key={q.mint}
                      type="button"
                      onClick={() => setSelectedQuote(q)}
                      className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left transition ${
                        selectedQuote?.mint === q.mint
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-cream-300 bg-milk/70 hover:border-rose-200'
                      }`}
                    >
                      {q.imageUrl ? (
                        <img src={q.imageUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-200 text-xs">
                          $
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-ink-800">{q.ticker}</p>
                        <p className="truncate text-[10px] text-ink-400">{q.symbol}</p>
                      </div>
                    </button>
                  ))}
                  {displayedQuotes.length === 0 && !quotesLoading && (
                    <p className="col-span-full py-6 text-center text-xs text-ink-400">
                      No quotes match that filter
                    </p>
                  )}
                </div>
                {selectedQuote && (
                  <p className="break-all font-mono text-[10px] text-ink-400">
                    mint {selectedQuote.mint}
                  </p>
                )}
              </div>
            )}

            {pairMode === 'stock' ? (
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <label htmlFor="fee" className="text-sm font-semibold text-ink-700">
                    Creator fee
                  </label>
                  <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-0.5 text-sm font-bold tabular-nums text-rose-500">
                    {fee.toFixed(2)}%
                  </span>
                </div>
                <input
                  id="fee"
                  type="range"
                  min={feeMin}
                  max={feeMax}
                  step={feeStep}
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="fee-slider"
                  style={{
                    background: `linear-gradient(to right, #FFC1D6 0%, #F56A9A ${
                      ((fee - feeMin) / (feeMax - feeMin)) * 100
                    }%, #FFF0EA ${((fee - feeMin) / (feeMax - feeMin)) * 100}%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-[10px] font-medium text-ink-300">
                  <span>{feeMin}%</span>
                  <span className="text-rose-400">
                    Custom pairs · ~0.05%–1% (on-chain creatorFeeBps)
                  </span>
                  <span>{feeMax}%</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-cream-300 bg-cream-50/80 px-4 py-3.5">
                <p className="text-sm font-semibold text-ink-700">Creator fee</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">
                  Creator fee: Pump protocol schedule (~1.25%). Custom % only on stock/custom
                  quote pairs.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="buy" className="mb-1.5 block text-sm font-semibold text-ink-700">
                Initial buy{' '}
                <span className="font-normal text-ink-300">
                  (optional · {pairMode === 'sol' ? 'SOL' : pairMode === 'usdc' ? 'USDC' : 'quote tokens'})
                </span>
              </label>
              <input
                id="buy"
                type="number"
                min={0}
                step="any"
                value={initialBuy}
                onChange={(e) => setInitialBuy(e.target.value)}
                placeholder="0"
                className="input-field"
              />
              {Number(initialBuy) > 0 && (
                <p className="mt-1 text-[11px] text-ink-400">
                  {pairMode === 'sol'
                    ? 'SOL initial buy uses one combined create+buy transaction (block 0). If it cannot fit under Solana’s size limit, launch fails rather than splitting — that would leave a sniper window. Approve quickly; blockhashes expire in about a minute.'
                    : 'Initial buy may require a second approval after create. Approve quickly — Solana blockhashes expire in about a minute. If funds left your wallet but the UI errored, check Solscan before launching again.'}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-rose-100 bg-cream-50/80 px-4 py-3.5">
              <p className="text-xs leading-relaxed text-ink-500">
                <span className="font-semibold text-ink-700">Preview:</span> ${ticker || 'TICKER'} ·{' '}
                {pairMode === 'stock'
                  ? `${fee.toFixed(2)}% creator fee`
                  : 'protocol fee (~1.25%)'}{' '}
                ·{' '}
                {pairMode === 'sol'
                  ? 'SOL'
                  : pairMode === 'usdc'
                    ? 'USDC'
                    : selectedQuote?.ticker || 'quote'}{' '}
                · {name || 'Untitled'}
              </p>
            </div>
          </section>

          <div className="h-px bg-rose-100/80" />

          {/* Confirm */}
          <section className="space-y-4">
            <h2 className="text-label">04 · Seal the wish</h2>
            <div className="rounded-2xl border border-amber/40 bg-amber/10 px-4 py-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                Irreversible once launched
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-600">
                This submits a real Pump <code>create_v2</code> on Solana mainnet. Name, ticker, and
                metadata cannot be changed after launch. Errors are shown — no fake success.
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-400"
                />
                <span className="text-xs leading-relaxed text-ink-700">
                  I understand this is irreversible, stock quotes are not equity, and I accept
                  mainnet risk.
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <p className="font-semibold">Launch failed</p>
                <p className="mt-1 break-words text-xs">{error}</p>
              </div>
            )}
            {status && <p className="text-center text-sm font-medium text-rose-500">{status}</p>}

            <button
              type="submit"
              disabled={busy || !canLaunch}
              className="btn-primary w-full"
            >
              {busy ? 'Launching…' : connected ? 'Launch on Pump' : 'Connect wallet to launch'}
            </button>
            {busy && (
              <p className="text-center text-[11px] text-ink-400">
                When Phantom opens, approve right away. Waiting on warnings can expire the
                transaction.
              </p>
            )}
          </section>
        </form>
            <p className="mt-4 text-center text-[10px] text-ink-300">
              Quote mint SOL={NATIVE_MINT.toBase58().slice(0, 8)}… · USDC=
              {USDC_MINT.toBase58().slice(0, 8)}…
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}