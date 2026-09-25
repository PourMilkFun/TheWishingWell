import { useMemo, type ReactNode } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SOLANA_RPC } from '../lib/constants'
import '@solana/wallet-adapter-react-ui/styles.css'

/** Real Solana wallets via Wallet Standard (Phantom, Solflare, …). */
export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC, [])
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
