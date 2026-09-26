import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  type ConfirmedSignatureInfo,
  type ParsedTransactionWithMeta,
} from '@solana/web3.js'

/** Pump bonding-curve / AMM creator-fee claim log markers (Anchor instruction names). */
const CLAIM_LOG_MARKERS = ['CollectCreatorFee', 'CollectCoinCreatorFee'] as const

const SIG_PAGE = 100
const TX_BATCH = 25

function accountKeyString(
  key: ParsedTransactionWithMeta['transaction']['message']['accountKeys'][number],
): string {
  if (typeof key === 'string') return key
  if (key instanceof PublicKey) return key.toBase58()
  // ParsedMessageAccount
  const pk = (key as { pubkey: PublicKey | string }).pubkey
  return typeof pk === 'string' ? pk : pk.toBase58()
}

function isCreatorFeeClaim(logs: string[] | null | undefined): boolean {
  if (!logs?.length) return false
  return logs.some((line) => CLAIM_LOG_MARKERS.some((m) => line.includes(m)))
}

/**
 * Prefer Wish-mint claims when the mint is detectable on the tx (account keys or
 * token-balance mint fields). If mint involvement is ambiguous, count the claim
 * anyway — CollectCreatorFee credits to the vault wallet are still valid.
 */
function passesMintFilter(
  tx: ParsedTransactionWithMeta,
  wishMint: string | null,
): boolean {
  if (!wishMint) return true

  const keys = tx.transaction.message.accountKeys.map(accountKeyString)
  if (keys.includes(wishMint)) return true

  const tokenMints = new Set<string>()
  for (const bal of [
    ...(tx.meta?.preTokenBalances ?? []),
    ...(tx.meta?.postTokenBalances ?? []),
  ]) {
    if (bal.mint) tokenMints.add(bal.mint)
  }
  if (tokenMints.has(wishMint)) return true

  // Mint list present but Wish absent → skip (prefer Wish-only when detectable).
  if (tokenMints.size > 0) return false

  // Ambiguous: no mint keys/balances — still count vault CollectCreatorFee credits.
  return true
}

function vaultLamportDelta(
  tx: ParsedTransactionWithMeta,
  vault: string,
): number {
  const keys = tx.transaction.message.accountKeys.map(accountKeyString)
  const idx = keys.indexOf(vault)
  if (idx < 0) return 0
  const pre = tx.meta?.preBalances?.[idx]
  const post = tx.meta?.postBalances?.[idx]
  if (pre == null || post == null) return 0
  return post - pre
}

export type ClaimedFeesResult = {
  /** Sum of positive claim credits since the cutoff (SOL, floored at 0). */
  sol: number
  /** Number of claim txs that contributed. */
  claimCount: number
  /** Signatures inspected (with blockTime >= since). */
  scanned: number
}

/**
 * Sum SOL credited to `vaultWallet` from Pump-style creator-fee claim txs
 * (`CollectCreatorFee` / `CollectCoinCreatorFee` in logs) with blockTime >= `sinceUnix`.
 * Ignores buys, sells, plain transfers, and withdrawals. Never returns negative.
 */
export async function sumClaimedCreatorFees(opts: {
  connection: Connection
  vaultWallet: string
  sinceUnix: number
  wishMint?: string | null
}): Promise<ClaimedFeesResult> {
  const vault = new PublicKey(opts.vaultWallet)
  const vaultStr = vault.toBase58()
  const wishMint = opts.wishMint?.trim() || null

  let before: string | undefined
  let scanned = 0
  let claimCount = 0
  let lamports = 0

  // Newest-first pagination; stop once signatures fall before the cutoff.
  for (;;) {
    const page: ConfirmedSignatureInfo[] =
      await opts.connection.getSignaturesForAddress(vault, {
        limit: SIG_PAGE,
        before,
      })
    if (!page.length) break

    const inWindow: ConfirmedSignatureInfo[] = []
    let reachedOlder = false
    for (const info of page) {
      if (info.err) continue
      if (info.blockTime != null && info.blockTime < opts.sinceUnix) {
        reachedOlder = true
        break
      }
      inWindow.push(info)
    }

    for (let i = 0; i < inWindow.length; i += TX_BATCH) {
      const chunk = inWindow.slice(i, i + TX_BATCH)
      const txs = await opts.connection.getParsedTransactions(
        chunk.map((s) => s.signature),
        { maxSupportedTransactionVersion: 0, commitment: 'confirmed' },
      )
      for (let j = 0; j < txs.length; j++) {
        const tx = txs[j]
        scanned += 1
        if (!tx?.meta) continue
        if (!isCreatorFeeClaim(tx.meta.logMessages)) continue
        if (!passesMintFilter(tx, wishMint)) continue
        const delta = vaultLamportDelta(tx, vaultStr)
        if (delta > 0) {
          lamports += delta
          claimCount += 1
        }
      }
    }

    if (reachedOlder || page.length < SIG_PAGE) break
    before = page[page.length - 1]?.signature
    if (!before) break
  }

  return {
    sol: Math.max(0, lamports / LAMPORTS_PER_SOL),
    claimCount,
    scanned,
  }
}
