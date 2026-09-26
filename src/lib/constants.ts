import { PublicKey } from '@solana/web3.js'

/** Prefer `VITE_SOLANA_RPC`; fall back to a public mainnet endpoint. */
export const SOLANA_RPC =
  (import.meta.env.VITE_SOLANA_RPC as string | undefined)?.trim() ||
  'https://solana-rpc.publicnode.com'

export const NATIVE_MINT = new PublicKey('So11111111111111111111111111111111111111112')
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

export const QUOTES_LIVE_URL = '/api/live-quotes'
export const QUOTES_FALLBACK_URL = '/pump-quotes.json'
export const IPFS_UPLOAD_URL = '/pump-ipfs'

export const MY_LAUNCHES_KEY = 'wish.myLaunches.v1'
export const MY_LAUNCHES_CHANGED = 'wish:my-launches-changed'

export const SOLSCAN_TX = (sig: string) => `https://solscan.io/tx/${sig}`
export const SOLSCAN_TOKEN = (mint: string) => `https://solscan.io/token/${mint}`
export const PUMP_COIN = (mint: string) => `https://pump.fun/coin/${mint}`

/** Fee vault wallet — set `VITE_FEE_VAULT_WALLET` to override; defaults to Wish fee wallet. */
export const FEE_VAULT_WALLET =
  (import.meta.env.VITE_FEE_VAULT_WALLET as string | undefined)?.trim() ||
  '6urQ4suhy2x8b9K3aqwSSMDKTYGF3j2jR1jXwJv7Wish'

/** Soft fill target for the vault meter UI (SOL). Override with `VITE_FEE_VAULT_TARGET_SOL`. */
export const FEE_VAULT_TARGET_SOL = (() => {
  const raw = (import.meta.env.VITE_FEE_VAULT_TARGET_SOL as string | undefined)?.trim()
  const n = raw ? Number(raw) : 10
  return Number.isFinite(n) && n > 0 ? n : 10
})()

/**
 * Display baseline for the vault UI (SOL). Shown balance = max(0, on-chain − baseline).
 * Snapshot of wallet 6urQ…Wish at reset (~1.082 SOL) so the UI starts at 0; new inbound SOL
 * shows as the delta. Override with `VITE_FEE_VAULT_BASELINE_SOL`.
 */
export const FEE_VAULT_BASELINE_SOL = (() => {
  const raw = (import.meta.env.VITE_FEE_VAULT_BASELINE_SOL as string | undefined)?.trim()
  const n = raw ? Number(raw) : 1.082350573
  return Number.isFinite(n) && n >= 0 ? n : 1.082350573
})()

/** Seed / demo mints that must not hit DexScreener or Pump APIs. */
export function isPlaceholderMint(mint?: string | null): boolean {
  if (!mint) return true
  const m = mint.trim()
  if (m.length < 32) return true
  if (/^Wish1{6,}/i.test(m)) return true
  if (/Demo/i.test(m)) return true
  // Long identical padding is not a real minted address
  if (/(.)\1{16,}/.test(m)) return true
  return false
}

/** True when a mint can back a live DexScreener / Pump chart embed. */
export function isLiveChartMint(mint?: string | null): boolean {
  return Boolean(mint) && !isPlaceholderMint(mint)
}

