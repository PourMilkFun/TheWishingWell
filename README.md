# MILK — Liquidity you can pour

Pump.fun-style launchpad UI with **real Solana mainnet launches** (create_v2) and **SOL / USDC / stock-custom quote pairs**.

> Soft cream & rose theme · live quote registry · vault meters (pending for new launches) · fee → buyback narrative.

## Quick start

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

```bash
npm run build
npm run preview
```

## Env

| Variable | Purpose |
|----------|---------|
| `VITE_SOLANA_RPC` | Mainnet RPC URL (default: `https://solana-rpc.publicnode.com`) |
| `VITE_FEE_VAULT_WALLET` | Vault wallet for claimed-fee metering |
| `VITE_FEE_VAULT_TARGET_SOL` | Soft fill target for the vault meter (default 10) |
| `VITE_FEE_VAULT_CLAIM_SINCE` | Unix/ISO cutoff; only `CollectCreatorFee` credits after this count (default `2026-09-26T00:00:00Z`) |
| `VITE_FEE_VAULT_WISH_MINT` | Optional mint filter for claim txs (default Wish mint) |

## Wallet

- `@solana/wallet-adapter-react` + Wallet Standard (Phantom, Solflare, etc. auto-detected)
- Connect opens the wallet modal; disconnect from the nav chip

## Quotes

- Live: `https://launchondeep.com/api/quotes` (proxied as `/api/live-quotes` in Vite)
- Fallback: bundled `public/pump-quotes.json` (pump-live-registry snapshot)
- Launch UI pair modes: **SOL** · **USDC** · **Stock / Custom** (searchable stock grid + crypto/other tabs)

## Launch flow

1. Connect wallet
2. Upload art → metadata via pump.fun IPFS (`/pump-ipfs` → `https://pump.fun/api/ipfs`)
3. Build + sign + send `@pump-fun/pump-sdk` `createV2Instruction` / `createV2AndBuyInstructions` on **mainnet**
4. Custom pairs pass `quoteMint` + `quoteTokenProgram`; stock pairs encode creator fee as bps (~0.05%–1%)
5. On success: mint + Solscan + pump.fun links; saved to `localStorage` (`milk.myLaunches.v1`)

Failures surface the real error — no fake success.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/launches` | Mock showcase + your real launches |
| `/launch` | Functional create form |
| `/coin/:id` | Inspect (real mints show mint/quote/links; vault may be pending) |
| `/mechanics` | Fee → vault explainer |

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · React Router 7 · `@solana/web3.js` · `@pump-fun/pump-sdk` · wallet-adapter

## Disclaimer

Tokenized stock quotes are third-party tokens, **not equity**. MILK does not sell stocks. Not financial advice. DYOR.
