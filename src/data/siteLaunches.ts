import type { MyLaunch } from '../lib/myLaunches'

/** Curated launches every visitor sees (merged with browser-local saves). */
export const SITE_LAUNCHES: MyLaunch[] = [
  {
    id: 'wish-seed-placeholder',
    mint: 'Wish11111111111111111111111111111111111111',
    name: 'Wish',
    ticker: 'WISH',
    description: 'Wish — liquidity in the well. Gold fees drop into The Well.',
    imageUrl: '/tokens/wish-well-logo.jpg',
    imageThumb: undefined,
    creatorFee: 1,
    quoteMint: 'So11111111111111111111111111111111111111112',
    quoteTicker: 'SOL',
    pairMode: 'sol',
    signature: 'site-seeded',
    createdAt: '2026-09-25T21:00:00.000Z',
    socials: { website: 'https://wish.well' },
  },
]
