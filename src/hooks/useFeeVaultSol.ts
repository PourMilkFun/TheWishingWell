import { useCallback, useEffect, useRef, useState } from 'react'
import { Connection } from '@solana/web3.js'
import {
  FEE_VAULT_CLAIM_SINCE,
  FEE_VAULT_TARGET_SOL,
  FEE_VAULT_WALLET,
  FEE_VAULT_WISH_MINT,
  SOLANA_RPC,
} from '../lib/constants'
import { sumClaimedCreatorFees } from '../lib/feeVaultClaims'

export type FeeVaultState = {
  /** Display SOL = sum of claimed creator-fee credits since FEE_VAULT_CLAIM_SINCE (never negative). */
  sol: number
  targetSol: number
  pct: number
  wallet: string | null
  loading: boolean
  error: string | null
  refreshedAt: number | null
  claimCount: number
}

/**
 * Home vault meter: SOL increases only when Pump creator fees are *claimed*
 * into the vault wallet (logs containing CollectCreatorFee / CollectCoinCreatorFee),
 * not from raw wallet balance or non-claim inbound transfers.
 * Until the first such claim after FEE_VAULT_CLAIM_SINCE, display stays 0.00 SOL.
 * RPC failures keep the last good sum.
 */
export function useFeeVaultSol(pollMs = 45_000): FeeVaultState {
  const [sol, setSol] = useState(0)
  const [claimCount, setClaimCount] = useState(0)
  const [loading, setLoading] = useState(Boolean(FEE_VAULT_WALLET))
  const [error, setError] = useState<string | null>(null)
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null)
  const lastGoodSol = useRef(0)
  const lastGoodClaims = useRef(0)
  const inFlight = useRef(false)

  const refresh = useCallback(async () => {
    if (!FEE_VAULT_WALLET) {
      setSol(0)
      setClaimCount(0)
      setLoading(false)
      setError(null)
      return
    }
    if (inFlight.current) return
    inFlight.current = true
    setLoading(true)
    try {
      const connection = new Connection(SOLANA_RPC, 'confirmed')
      const result = await sumClaimedCreatorFees({
        connection,
        vaultWallet: FEE_VAULT_WALLET,
        sinceUnix: FEE_VAULT_CLAIM_SINCE,
        wishMint: FEE_VAULT_WISH_MINT,
      })
      const next = Number.isFinite(result.sol) ? Math.max(0, result.sol) : 0
      lastGoodSol.current = next
      lastGoodClaims.current = result.claimCount
      setSol(next)
      setClaimCount(result.claimCount)
      setError(null)
      setRefreshedAt(Date.now())
    } catch (e) {
      // Keep last good sum on RPC failure.
      setSol(lastGoodSol.current)
      setClaimCount(lastGoodClaims.current)
      setError(e instanceof Error ? e.message : 'Failed to scan vault claims')
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    void refresh()
    if (!FEE_VAULT_WALLET) return
    const id = window.setInterval(() => void refresh(), pollMs)
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh, pollMs])

  const targetSol = Math.max(FEE_VAULT_TARGET_SOL, sol > 0 ? sol : FEE_VAULT_TARGET_SOL)
  const pct = Math.min(100, Math.round((sol / targetSol) * 100))

  return {
    sol,
    targetSol,
    pct,
    wallet: FEE_VAULT_WALLET || null,
    loading,
    error,
    refreshedAt,
    claimCount,
  }
}
