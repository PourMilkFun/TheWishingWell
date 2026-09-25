export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; tone: 'info' | 'warn' | 'tip'; title?: string; text: string }
  | { type: 'code'; text: string }

export interface DocPage {
  slug: string
  title: string
  description: string
  group: string
  blocks: DocBlock[]
}

export const DOC_GROUPS = ['Start here', 'Product', 'Launching', 'Reference'] as const

export const DOC_PAGES: DocPage[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    description: 'What Wish is and what it is not.',
    group: 'Start here',
    blocks: [
      {
        type: 'p',
        text: 'Wish is a Pump.fun launchpad with a simple idea: liquidity should be part of the launch, not an afterthought. The name is the metaphor — a wishing well for liquidity.',
      },
      {
        type: 'p',
        text: 'You can connect a wallet, pick a quote pair (SOL, USDC, or stock/custom quotes), upload metadata, and create a real coin on Pump mainnet.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'What works today',
        text: 'Wallet connect, live Pump quote pairs, metadata upload, and mainnet create (create_v2 / create + buy) are live. Fee routing into a Wish vault, automated Buyback & Burn, and Locked LP are the product direction described in these docs.',
      },
      {
        type: 'h2',
        text: 'How Wish differs from a plain Pump frontend',
      },
      {
        type: 'ul',
        items: [
          'One place to launch with stock and custom quote pairs that Pump already supports.',
          'A public vault story: fees → vault → Buyback & Burn + Locked LP, with badges only when the vault is real.',
          'A launches board that shows real creates from this app — no fake demo tickers.',
        ],
      },
      {
        type: 'h2',
        text: 'What Wish is not',
      },
      {
        type: 'ul',
        items: [
          'Not a stock broker. Tokenized stock quotes are third-party tokens, not equity.',
          'Not an audit or endorsement of any coin that launches here.',
          'Not financial advice. Markets are volatile — always DYOR.',
        ],
      },
    ],
  },
  {
    slug: 'quickstart',
    title: 'Quickstart',
    description: 'Launch a coin in a few minutes.',
    group: 'Start here',
    blocks: [
      {
        type: 'p',
        text: 'You need a Solana wallet (Phantom or Solflare work well), a little SOL for fees, and optionally SOL or another quote for an initial buy.',
      },
      {
        type: 'ol',
        items: [
          'Open Launch and connect your wallet on Solana mainnet.',
          'Enter name, ticker, and description. Upload an image.',
          'Choose a quote pair: SOL, USDC, or a stock/custom mint from the live list.',
          'Set creator fee (within Pump’s allowed range) and optional socials.',
          'Confirm the create transaction. On success, the coin is saved to your launches list.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Tip',
        text: 'After create, open the coin page for mint, signature, and links out to pump.fun. Your browser keeps a local list of launches from this device.',
      },
    ],
  },
  {
    slug: 'how-it-works',
    title: 'How it works',
    description: 'Fees, vault, Buyback & Burn, and Locked LP at a high level.',
    group: 'Product',
    blocks: [
      {
        type: 'p',
        text: 'Pump bonding curves skim a creator fee on trades. On a normal Pump launch that fee can go to a private wallet. Wish’s design routes that fee into a public vault instead.',
      },
      {
        type: 'h2',
        text: 'Flow',
      },
      {
        type: 'ol',
        items: [
          'Traders buy and sell on the bonding curve.',
          'Creator fees are meant to land in a public Wish vault.',
          'As the vault fills, Buyback & Burn can recycle SOL into the token.',
          'After graduation, remaining vault liquidity can seed Locked LP.',
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Honest status',
        text: 'Pump create is live. The on-chain vault program, automatic fee routing, Buyback & Burn, and Locked LP are the roadmap. UI meters and “fee vault” labels describe that design. Do not treat them as proof that fees already move on-chain until the vault program is deployed and linked.',
      },
      {
        type: 'h2',
        text: 'Badges',
      },
      {
        type: 'ul',
        items: [
          'VAULT LIVE — only when a real vault is attached and verifiable.',
          'Wish-INDEXED — board listing once vault criteria are met.',
          'BONDING — still on the Pump curve.',
        ],
      },
    ],
  },
  {
    slug: 'vault',
    title: 'Vault',
    description: 'Public fee vault, Buyback & Burn, and Locked LP.',
    group: 'Product',
    blocks: [
      {
        type: 'p',
        text: 'The vault is the core differentiator versus a marker-only launchpad. Anyone should be able to inspect balances and understand where fees go.',
      },
      {
        type: 'h2',
        text: 'Design goals',
      },
      {
        type: 'ul',
        items: [
          'Public address and readable meter on each coin page.',
          'No opaque private sink for creator fees when vault routing is enabled.',
          'Threshold-based Buyback & Burn while bonding.',
          'Locked LP after graduation so liquidity is harder to rug.',
        ],
      },
      {
        type: 'h2',
        text: 'What you see in the UI today',
      },
      {
        type: 'p',
        text: 'Inspect pages and home meters preview the vault fill experience. New launches are stored as vault-pending until an on-chain vault is wired to that mint.',
      },
    ],
  },
  {
    slug: 'launching',
    title: 'Launching a coin',
    description: 'Fields, fees, and what happens on-chain.',
    group: 'Launching',
    blocks: [
      {
        type: 'h2',
        text: 'Required fields',
      },
      {
        type: 'ul',
        items: [
          'Name and ticker',
          'Image (uploaded to Pump IPFS)',
          'Quote mint (SOL, USDC, or stock/custom)',
          'Connected wallet to sign create',
        ],
      },
      {
        type: 'h2',
        text: 'Creator fee',
      },
      {
        type: 'p',
        text: 'Creator fee is set at launch within Pump’s allowed band (commonly around 0.25%–3%). That fee is what Wish intends to route into the vault once vault programs are live.',
      },
      {
        type: 'h2',
        text: 'On-chain result',
      },
      {
        type: 'p',
        text: 'A successful launch returns a mint address and transaction signature. Wish stores that locally so it appears under Launches and Recent launches on this device.',
      },
    ],
  },
  {
    slug: 'quote-pairs',
    title: 'Quote pairs',
    description: 'SOL, USDC, and stock / custom quotes.',
    group: 'Launching',
    blocks: [
      {
        type: 'p',
        text: 'Wish pulls live quote options from Pump’s registry (with a local fallback list). That includes classic SOL/USDC and tokenized stock or other custom quote mints Pump already supports.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Not equity',
        text: 'A “stock” quote mint is a crypto token that tracks or references an underlying ticker. It is not shares of the company. Wish does not sell stocks.',
      },
      {
        type: 'h2',
        text: 'Choosing a pair',
      },
      {
        type: 'ul',
        items: [
          'SOL — default Pump experience.',
          'USDC — stable quote for buyers who prefer dollars.',
          'Stock / custom — pick from the live list; search by ticker when available.',
        ],
      },
    ],
  },
  {
    slug: 'faq',
    title: 'FAQ',
    description: 'Common questions.',
    group: 'Reference',
    blocks: [
      {
        type: 'h3',
        text: 'Where are my launches stored?',
      },
      {
        type: 'p',
        text: 'In this browser’s local storage after a successful create. Clearing site data removes the list; the on-chain mint still exists.',
      },
      {
        type: 'h3',
        text: 'Can I launch on devnet?',
      },
      {
        type: 'p',
        text: 'The current build targets Pump mainnet create. Use a funded mainnet wallet.',
      },
      {
        type: 'h3',
        text: 'Why is the vault meter not moving?',
      },
      {
        type: 'p',
        text: 'Meters can show demo fill until fee routing is attached on-chain. Sort and market stats for listed coins come from Pump when available.',
      },
      {
        type: 'h3',
        text: 'Is a Wish badge an endorsement?',
      },
      {
        type: 'p',
        text: 'No. Markers and index status are mechanical signals, not investment advice.',
      },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    description: 'Risks and non-endorsement.',
    group: 'Reference',
    blocks: [
      {
        type: 'p',
        text: 'Wish is experimental software. Tokens launched through Pump are highly volatile and can go to zero. Nothing on this site is an offer to sell securities or an endorsement of any project.',
      },
      {
        type: 'ul',
        items: [
          'Do your own research.',
          'Never invest more than you can afford to lose.',
          'Verify mint addresses and transactions yourself on a block explorer.',
          'Tokenized stock quotes are not equity ownership.',
        ],
      },
    ],
  },
]

export function getDoc(slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.slug === slug)
}

export function getDocNav(): { group: string; pages: DocPage[] }[] {
  return DOC_GROUPS.map((group) => ({
    group,
    pages: DOC_PAGES.filter((p) => p.group === group),
  })).filter((g) => g.pages.length > 0)
}

export function getAdjacentDocs(slug: string): {
  prev?: DocPage
  next?: DocPage
} {
  const i = DOC_PAGES.findIndex((p) => p.slug === slug)
  if (i < 0) return {}
  return {
    prev: i > 0 ? DOC_PAGES[i - 1] : undefined,
    next: i < DOC_PAGES.length - 1 ? DOC_PAGES[i + 1] : undefined,
  }
}
