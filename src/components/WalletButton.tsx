import { useWallet } from '../hooks/useWallet'

export function WalletButton() {
  const { connected, connecting, address, connect, disconnect } = useWallet()

  if (connected) {
    return (
      <button
        type="button"
        onClick={() => void disconnect()}
        className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-milk/90 px-3.5 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vault opacity-40" />
          <span className="relative h-2 w-2 rounded-full bg-vault" />
        </span>
        <span className="font-mono text-xs tracking-tight">{address}</span>
        <span className="hidden text-ink-300 text-xs sm:inline">· Disconnect</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={connecting}
      className="btn-primary !px-4 !py-2 !text-sm disabled:opacity-60"
    >
      {connecting ? 'Connecting…' : 'Connect wallet'}
    </button>
  )
}
