import { useCallback, useEffect, useState } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { FEE_VAULT_TARGET_SOL, FEE_VAULT_WALLET, SOLANA_RPC } from '../lib/constants'

export type FeeVaultState = {
  sol: number
  targetSol: number
  pct: number
  wallet: string | null
  loading: boolean
  error: string | null
  refreshedAt: number | null
}

/**
 * Live SOL balance of the fee vault wallet.
 * Set address via VITE_FEE_VAULT_WALLET — until then sol stays 0.
 */
export function useFeeVaultSol(pollMs = 30_000): FeeVaultState {
  const [sol, setSol] = useState(0)
  const [loading, setLoading] = useState(Boolean(FEE_VAULT_WALLET))
  const [error, setError] = useState<string | null>(null)
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    if (!FEE_VAULT_WALLET) {
      setSol(0)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    try {
      const key = new PublicKey(FEE_VAULT_WALLET)
      const connection = new Connection(SOLANA_RPC, 'confirmed')
      const lamports = await connection.getBalance(key, 'confirmed')
      const next = lamports / LAMPORTS_PER_SOL
      setSol(next)
      setError(null)
      setRefreshedAt(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read vault balance')
    } finally {
      setLoading(false)
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
  }
}
