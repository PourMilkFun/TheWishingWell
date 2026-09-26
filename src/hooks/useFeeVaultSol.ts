import { useCallback, useEffect, useRef, useState } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { FEE_VAULT_WALLET, SOLANA_RPC } from '../lib/constants'

export type FeeVaultState = {
  /** Live SOL balance of the vault wallet. */
  sol: number
  wallet: string | null
  loading: boolean
  error: string | null
  refreshedAt: number | null
}

/**
 * Home vault panel: live SOL balance of the fee vault wallet (getBalance).
 */
export function useFeeVaultSol(pollMs = 30_000): FeeVaultState {
  const [sol, setSol] = useState(0)
  const [loading, setLoading] = useState(Boolean(FEE_VAULT_WALLET))
  const [error, setError] = useState<string | null>(null)
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null)
  const lastGoodSol = useRef(0)
  const inFlight = useRef(false)

  const refresh = useCallback(async () => {
    if (!FEE_VAULT_WALLET) {
      setSol(0)
      setLoading(false)
      setError(null)
      return
    }
    if (inFlight.current) return
    inFlight.current = true
    setLoading(true)
    try {
      const connection = new Connection(SOLANA_RPC, 'confirmed')
      const lamports = await connection.getBalance(new PublicKey(FEE_VAULT_WALLET), 'confirmed')
      const next = Math.max(0, lamports / LAMPORTS_PER_SOL)
      lastGoodSol.current = next
      setSol(next)
      setError(null)
      setRefreshedAt(Date.now())
    } catch (e) {
      setSol(lastGoodSol.current)
      setError(e instanceof Error ? e.message : 'Failed to read vault balance')
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

  return {
    sol,
    wallet: FEE_VAULT_WALLET || null,
    loading,
    error,
    refreshedAt,
  }
}
