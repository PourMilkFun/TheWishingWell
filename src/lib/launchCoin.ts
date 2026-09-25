import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  type TransactionInstruction,
} from '@solana/web3.js'
import {
  OnlinePumpSdk,
  PUMP_SDK,
  bondingCurvePda,
  getBuyTokenAmountFromSolAmount,
} from '@pump-fun/pump-sdk'
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'
import BN from 'bn.js'
import { NATIVE_MINT, USDC_MINT } from './constants'

export type PairMode = 'sol' | 'usdc' | 'stock'

export interface LaunchParams {
  connection: Connection
  user: PublicKey
  signTransaction: (tx: Transaction) => Promise<Transaction>
  name: string
  symbol: string
  metadataUri: string
  pairMode: PairMode
  quoteMint?: PublicKey
  quoteTicker?: string
  /** UI percent, e.g. 0.5 for 0.5%. Encoded as bps for stock pairs. */
  creatorFeePercent: number
  initialBuy?: number
  /** Optional UI status (wallet approve / confirm). */
  onStatus?: (msg: string) => void
}

export interface LaunchResult {
  mint: string
  signature: string
  quoteMint: string
  quoteTicker: string
  buyWarning?: string
}

/** Thrown only when create failed with no mint on-chain. If mint exists we return LaunchResult. */
export class LaunchFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LaunchFailedError'
  }
}

async function userTokenBalance(
  connection: Connection,
  mint: PublicKey,
  user: PublicKey,
): Promise<bigint> {
  const ata = getAssociatedTokenAddressSync(mint, user, true, TOKEN_2022_PROGRAM_ID)
  try {
    const bal = await connection.getTokenAccountBalance(ata, 'confirmed')
    return BigInt(bal.value.amount)
  } catch {
    return 0n
  }
}

/**
 * After a combined create+buy, ONLY poll wallet balance — never send a second buy tx
 * (that would open a sniper window between create and buy).
 */
async function verifyCombinedBuyBalance(opts: {
  connection: Connection
  mint: PublicKey
  user: PublicKey
  onStatus?: (msg: string) => void
}): Promise<string | undefined> {
  opts.onStatus?.('Confirming dev buy in wallet…')
  const deadline = Date.now() + 5_000
  while (Date.now() < deadline) {
    const bal = await userTokenBalance(opts.connection, opts.mint, opts.user)
    if (bal > 0n) {
      opts.onStatus?.('Dev buy confirmed in wallet.')
      return undefined
    }
    await sleep(800)
  }
  const after = await userTokenBalance(opts.connection, opts.mint, opts.user)
  if (after > 0n) {
    opts.onStatus?.('Dev buy confirmed in wallet.')
    return undefined
  }
  return 'Coin created with block-0 create+buy, but wallet still shows 0 tokens after ~5s. Check pump.fun / Solscan — refusing a second buy tx (that opens a sniper window).'
}

function asError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return 'Unknown launch error'
  }
}

function stockFeeBps(percent: number): BN {
  const bps = Math.round(percent * 100)
  return new BN(Math.min(100, Math.max(5, bps)))
}

function isTxTooLarge(err: unknown): boolean {
  const msg = asError(err).toLowerCase()
  return (
    msg.includes('too large') ||
    msg.includes('transaction too large') ||
    msg.includes('encoding overruns') ||
    msg.includes('>1232') ||
    msg.includes('> 1232')
  )
}

function isExpiredBlockhash(err: unknown): boolean {
  const msg = asError(err).toLowerCase()
  return (
    msg.includes('block height exceeded') ||
    msg.includes('blockhash not found') ||
    msg.includes('has expired') ||
    msg.includes('transaction expired')
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** True if sig landed successfully. Throws if it landed with an on-chain error. */
async function signatureLanded(connection: Connection, sig: string): Promise<boolean> {
  const st = await connection.getSignatureStatuses([sig], { searchTransactionHistory: true })
  const v = st.value[0]
  if (v) {
    if (v.err) throw new Error(`On-chain error: ${JSON.stringify(v.err)}`)
    // Accept processed — public RPCs often lag on confirmed.
    if (
      v.confirmationStatus === 'processed' ||
      v.confirmationStatus === 'confirmed' ||
      v.confirmationStatus === 'finalized'
    ) {
      return true
    }
  }
  try {
    const tx = await connection.getTransaction(sig, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })
    if (tx) {
      if (tx.meta?.err) throw new Error(`On-chain error: ${JSON.stringify(tx.meta.err)}`)
      return true
    }
  } catch (e) {
    if (asError(e).startsWith('On-chain error:')) throw e
  }
  return false
}

async function mintExists(connection: Connection, mint: PublicKey): Promise<boolean> {
  const info = await connection.getAccountInfo(mint, 'confirmed')
  return !!info
}

/**
 * Confirm by polling + rebroadcasting the SAME signed bytes.
 * Never ask the wallet to resign while this is running — that is what drained SOL
 * when create already landed but confirmTransaction threw "block height exceeded".
 */
async function confirmWithRebroadcast(
  connection: Connection,
  sig: string,
  raw: Buffer | Uint8Array,
  latest: { blockhash: string; lastValidBlockHeight: number },
  onStatus?: (msg: string) => void,
): Promise<void> {
  const deadline = Date.now() + 120_000
  let lastBroadcast = 0

  while (Date.now() < deadline) {
    if (await signatureLanded(connection, sig)) return

    const height = await connection.getBlockHeight('confirmed')
    const stillValid = height <= latest.lastValidBlockHeight

    if (stillValid && Date.now() - lastBroadcast > 2_000) {
      onStatus?.('Waiting for Solana confirmation…')
      try {
        await connection.sendRawTransaction(raw, {
          skipPreflight: true,
          maxRetries: 0,
        })
      } catch {
        // Duplicate / already processed is fine.
      }
      lastBroadcast = Date.now()
    } else if (!stillValid) {
      onStatus?.('Blockhash expired — checking if the tx already landed…')
    }

    await sleep(1_200)
  }

  if (await signatureLanded(connection, sig)) return
  throw new Error(
    'Transaction not confirmed (block height exceeded). If SOL left your wallet, the coin may already exist — check Solscan for the mint before retrying.',
  )
}

/** Hard Solana legacy packet limit for non-versioned txs. */
const TX_SIZE_SAFE_LIMIT = 1232

/**
 * Shorter on-chain URI = smaller create ix. Pump stores the string as-is;
 * ipfs://CID resolves the same content as https://…/ipfs/CID.
 */
function compactMetadataUri(uri: string): string {
  const trimmed = uri.trim()
  const m =
    trimmed.match(/\/ipfs\/([a-zA-Z0-9]+)/) ||
    trimmed.match(/^ipfs:\/\/([a-zA-Z0-9]+)/i)
  if (m) return `ipfs://${m[1]}`
  return trimmed
}


/** Serialized size with fee payer + optional mint cosigner (no wallet sig yet). */
function estimateTxSize(
  ixs: TransactionInstruction[],
  user: PublicKey,
  mint: Keypair | null,
  opts: { cuLimit: number | null; cuPrice: number | null },
): number {
  const tx = new Transaction()
  if (opts.cuLimit != null) {
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: opts.cuLimit }))
  }
  if (opts.cuPrice != null) {
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: opts.cuPrice }))
  }
  for (const ix of ixs) tx.add(ix)
  tx.feePayer = user
  tx.recentBlockhash = 'EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N'
  if (mint) tx.partialSign(mint)
  // Wallet sig slot is reserved as 64 zero bytes — matches post-Phantom size.
  return tx.serialize({ requireAllSignatures: false, verifySignatures: false }).length
}

async function sendTx(
  connection: Connection,
  user: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  ixs: TransactionInstruction[],
  signers: Keypair[],
  computeUnits: number | null,
  opts?: { cuPrice?: number | null; onStatus?: (msg: string) => void },
): Promise<string> {
  // Phantom warnings can burn the blockhash window. After the wallet signs once we
  // rebroadcast that same tx and poll — we only ask for a new signature if the mint
  // still does not exist (avoids draining SOL on a create that already landed).
  const maxAttempts = 3
  const cuPrice =
      opts?.cuPrice === undefined
        ? computeUnits == null
          ? null
          : 1_000_000
        : opts.cuPrice
  const mintPk = signers[0]?.publicKey
  let lastErr: unknown
  let lastSig: string | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (mintPk && (await mintExists(connection, mintPk))) {
      opts?.onStatus?.('Coin already on-chain — recovering…')
      return lastSig ?? 'recovered-mint-exists'
    }

    const tx = new Transaction()
    if (computeUnits != null) {
      tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits }))
    }
    if (cuPrice != null) {
      tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: cuPrice }))
    }
    for (const ix of ixs) tx.add(ix)

    const latest = await connection.getLatestBlockhash('confirmed')
    tx.recentBlockhash = latest.blockhash
    tx.feePayer = user

    opts?.onStatus?.(
      attempt === 1
        ? 'Approve in Phantom within ~60 seconds…'
        : `Previous tx did not land — approve again (try ${attempt}/${maxAttempts})…`,
    )

    const walletSigned = await signTransaction(tx)
    if (signers.length) walletSigned.partialSign(...signers)
    const raw = walletSigned.serialize()

    opts?.onStatus?.('Submitting transaction…')

    let sig: string
    try {
      sig = await connection.sendRawTransaction(raw, {
        skipPreflight: true,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      })
      lastSig = sig
    } catch (e) {
      lastErr = e
      // Create may have landed even if send threw (RPC flake).
      if (mintPk && (await mintExists(connection, mintPk))) {
        opts?.onStatus?.('Create landed despite send error — recovering…')
        return 'recovered-mint-exists'
      }
      if (isExpiredBlockhash(e) && attempt < maxAttempts) continue
      throw e
    }

    try {
      opts?.onStatus?.('Confirming on Solana…')
      await confirmWithRebroadcast(connection, sig, raw, latest, opts?.onStatus)
      return sig
    } catch (e) {
      lastErr = e
      try {
        if (await signatureLanded(connection, sig)) return sig
      } catch (landErr) {
        throw landErr
      }
      if (mintPk && (await mintExists(connection, mintPk))) {
        opts?.onStatus?.('Create landed — recovering…')
        return sig
      }
      // Only resign when we are sure nothing landed.
      if (attempt < maxAttempts) continue
      throw e
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(asError(lastErr))
}


async function recoverIfMintExists(
  connection: Connection,
  mint: PublicKey,
  signature: string | undefined,
  quoteMint: string,
  quoteTicker: string,
  onStatus?: (msg: string) => void,
): Promise<LaunchResult | null> {
  if (!(await mintExists(connection, mint))) return null
  onStatus?.('Coin is on-chain — launch succeeded.')
  return {
    mint: mint.toBase58(),
    signature: signature ?? 'recovered-mint-exists',
    quoteMint,
    quoteTicker,
    buyWarning:
      signature === undefined
        ? 'Create landed but confirmation timed out. Check pump.fun / Solscan before launching again.'
        : undefined,
  }
}

export async function launchPumpCoin(params: LaunchParams): Promise<LaunchResult> {
  try {
    if (params.pairMode === 'sol') return await launchSol(params)
    return await launchQuoted(params)
  } catch (e) {
    throw new Error(asError(e))
  }
}

async function launchSol(params: LaunchParams): Promise<LaunchResult> {
  const { connection, user, signTransaction, name, symbol, metadataUri, onStatus } = params
  const mint = Keypair.generate()

  // Block 0: when initialBuy > 0, create_v2 + buy MUST be ONE tx (dev buy first on curve).
  // Never fall through to create-then-buy — that leaves a sniper window.
  // SOL/USDC ignore custom creatorFeeBps; do not pass pretend fees.
  if (params.initialBuy && params.initialBuy > 0) {
    const online = new OnlinePumpSdk(connection)
    const global = await online.fetchGlobal()
    const feeConfig = await online.fetchFeeConfig()
    const quoteControl = await online.fetchQuoteControl()
    const solAmount = new BN(Math.floor(params.initialBuy * 1e9))
    const amount = getBuyTokenAmountFromSolAmount({
      global,
      feeConfig,
      mintSupply: null,
      bondingCurve: null,
      amount: solAmount,
      quoteMint: NATIVE_MINT,
      quoteControl,
    })
    const uri = compactMetadataUri(metadataUri)
    const combinedIxs = await PUMP_SDK.createV2AndBuyInstructions({
      global,
      mint: mint.publicKey,
      name,
      symbol,
      uri,
      creator: user,
      user,
      amount,
      solAmount,
      mayhemMode: false,
    })

    // Smallest first: no CU ixs → CU limit only (never priority fee — that ix blows the cap).
    const attempts: { cuLimit: number | null; cuPrice: number | null }[] = [
      { cuLimit: null, cuPrice: null },
      { cuLimit: 350_000, cuPrice: null },
      { cuLimit: 400_000, cuPrice: null },
    ]
    let sawTooLarge = false
    for (const cu of attempts) {
      const bytes = estimateTxSize(combinedIxs, user, mint, cu)
      onStatus?.(`Block-0 create+buy size ${bytes}/${TX_SIZE_SAFE_LIMIT}…`)
      if (bytes > TX_SIZE_SAFE_LIMIT) {
        sawTooLarge = true
        continue
      }
      onStatus?.('Approve create + buy in one signature (block 0)…')
      try {
        const signature = await sendTx(
          connection,
          user,
          signTransaction,
          combinedIxs,
          [mint],
          cu.cuLimit,
          { cuPrice: cu.cuPrice, onStatus },
        )
        const buyWarning = await verifyCombinedBuyBalance({
          connection,
          mint: mint.publicKey,
          user,
          onStatus,
        })
        return {
          mint: mint.publicKey.toBase58(),
          signature,
          quoteMint: NATIVE_MINT.toBase58(),
          quoteTicker: 'SOL',
          buyWarning,
        }
      } catch (e) {
        const recovered = await recoverIfMintExists(
          connection,
          mint.publicKey,
          undefined,
          NATIVE_MINT.toBase58(),
          'SOL',
          onStatus,
        )
        if (recovered) {
          // Mint landed from a combined attempt — verify only, never second buy.
          const buyWarning = await verifyCombinedBuyBalance({
            connection,
            mint: mint.publicKey,
            user,
            onStatus,
          })
          return { ...recovered, buyWarning: buyWarning ?? recovered.buyWarning }
        }
        if (isTxTooLarge(e)) {
          sawTooLarge = true
          onStatus?.('Combined tx too large — trying a smaller config…')
          continue
        }
        throw e
      }
    }
    throw new Error(
      sawTooLarge
        ? 'Block-0 create+buy exceeds Solana’s 1232-byte limit even with compacted metadata. Refusing create-then-buy — that would leave a sniper window. Shorten name/symbol or try again without initial buy.'
        : 'Block-0 create+buy failed after all size attempts. Refusing create-then-buy — that would leave a sniper window.',
    )
  }

  // Create-only (no initial buy) — no sniper concern.
  const createIx = await PUMP_SDK.createV2Instruction({
    mint: mint.publicKey,
    name,
    symbol,
    uri: compactMetadataUri(metadataUri),
    creator: user,
    user,
    mayhemMode: false,
  })

  let signature: string
  try {
    signature = await sendTx(
      connection,
      user,
      signTransaction,
      [createIx],
      [mint],
      400_000,
      { onStatus },
    )
  } catch (e) {
    const recovered = await recoverIfMintExists(
      connection,
      mint.publicKey,
      undefined,
      NATIVE_MINT.toBase58(),
      'SOL',
      onStatus,
    )
    if (recovered) {
      signature = recovered.signature
    } else {
      throw e
    }
  }

  return {
    mint: mint.publicKey.toBase58(),
    signature,
    quoteMint: NATIVE_MINT.toBase58(),
    quoteTicker: 'SOL',
  }
}

async function launchQuoted(params: LaunchParams): Promise<LaunchResult> {
  const { connection, user, signTransaction, name, symbol, metadataUri, pairMode } = params
  const online = new OnlinePumpSdk(connection)
  const mint = Keypair.generate()

  const quoteMint = pairMode === 'usdc' ? USDC_MINT : params.quoteMint
  if (!quoteMint) throw new Error('Pick a stock / custom quote from the registry')

  const quoteTicker =
    pairMode === 'usdc' ? 'USDC' : params.quoteTicker || quoteMint.toBase58().slice(0, 6)

  const quoteTokenProgram = await online.fetchQuoteTokenProgram(quoteMint)
  const creatorFeeBps = pairMode === 'stock' ? stockFeeBps(params.creatorFeePercent) : undefined

  const createIx = await PUMP_SDK.createV2Instruction({
    mint: mint.publicKey,
    name,
    symbol,
    uri: metadataUri,
    creator: user,
    user,
    mayhemMode: false,
    quoteMint,
    quoteTokenProgram,
    creatorFeeBps,
  })

  let signature: string
  try {
    signature = await sendTx(connection, user, signTransaction, [createIx], [mint], 500_000, {
      onStatus: params.onStatus,
    })
  } catch (e) {
    const recovered = await recoverIfMintExists(
      connection,
      mint.publicKey,
      undefined,
      quoteMint.toBase58(),
      quoteTicker,
      params.onStatus,
    )
    if (recovered) signature = recovered.signature
    else throw e
  }

  let buyWarning: string | undefined
  if (params.initialBuy && params.initialBuy > 0) {
    try {
      await buyQuoted({
        connection,
        online,
        user,
        signTransaction,
        mint: mint.publicKey,
        quoteMint,
        quoteTokenProgram,
        quoteAmountUi: params.initialBuy,
        creatorFeeBps,
      })
    } catch (e) {
      buyWarning = `Coin created, but initial buy failed: ${asError(e)}`
    }
  }

  return {
    mint: mint.publicKey.toBase58(),
    signature,
    quoteMint: quoteMint.toBase58(),
    quoteTicker,
    buyWarning,
  }
}

async function buyQuoted(opts: {
  connection: Connection
  online: OnlinePumpSdk
  user: PublicKey
  signTransaction: (tx: Transaction) => Promise<Transaction>
  mint: PublicKey
  quoteMint: PublicKey
  quoteTokenProgram: PublicKey
  quoteAmountUi: number
  creatorFeeBps?: BN
}): Promise<void> {
  const global = await opts.online.fetchGlobal()
  const feeConfig = await opts.online.fetchFeeConfig()
  const quoteControl = await opts.online.fetchQuoteControl()
  const bondingCurve = await opts.online.fetchBondingCurve(opts.mint)
  const bcPda = bondingCurvePda(opts.mint)
  const bondingCurveAccountInfo = await opts.connection.getAccountInfo(bcPda)
  if (!bondingCurveAccountInfo) throw new Error('Bonding curve account missing after create')

  const quoteAmount = new BN(Math.floor(opts.quoteAmountUi * 1e6))
  const amount = getBuyTokenAmountFromSolAmount({
    global,
    feeConfig,
    mintSupply: bondingCurve.tokenTotalSupply,
    bondingCurve,
    amount: quoteAmount,
    quoteMint: opts.quoteMint,
    quoteControl,
    creatorFeeBps: opts.creatorFeeBps,
  })

  const userAta = getAssociatedTokenAddressSync(
    opts.mint,
    opts.user,
    true,
    TOKEN_2022_PROGRAM_ID,
  )
  const associatedUserAccountInfo = await opts.connection.getAccountInfo(userAta)

  const buyIxs = await PUMP_SDK.buyV2Instructions({
    global,
    bondingCurveAccountInfo,
    bondingCurve,
    associatedUserAccountInfo,
    mint: opts.mint,
    user: opts.user,
    amount,
    quoteAmount,
    slippage: 5,
    quoteTokenProgram: opts.quoteTokenProgram,
  })

  await sendTx(opts.connection, opts.user, opts.signTransaction, buyIxs, [], 400_000)
}
