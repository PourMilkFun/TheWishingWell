import { useCallback, useMemo } from 'react'
import { useWallet as useAdapterWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import type { PublicKey, Transaction } from '@solana/web3.js'

function shorten(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`
}

export interface MilkWallet {
  connected: boolean
  connecting: boolean
  address: string | null
  publicKey: PublicKey | null
  connect: () => void
  disconnect: () => Promise<void>
  signTransaction: ((tx: Transaction) => Promise<Transaction>) | undefined
  connection: ReturnType<typeof useConnection>['connection']
}

/** App-facing wallet hook (backed by Solana wallet-adapter + Wallet Standard). */
export function useWallet(): MilkWallet {
  const { connection } = useConnection()
  const {
    publicKey,
    connected,
    connecting,
    disconnect,
    signTransaction,
  } = useAdapterWallet()
  const { setVisible } = useWalletModal()

  const connect = useCallback(() => setVisible(true), [setVisible])

  const address = useMemo(
    () => (publicKey ? shorten(publicKey.toBase58()) : null),
    [publicKey],
  )

  return {
    connected,
    connecting,
    address,
    publicKey,
    connect,
    disconnect,
    signTransaction: signTransaction ?? undefined,
    connection,
  }
}
