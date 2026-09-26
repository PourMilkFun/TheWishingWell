import type { MyLaunch } from '../lib/myLaunches'

/** Curated launches every visitor sees (merged with browser-local saves). */
export const SITE_LAUNCHES: MyLaunch[] = [
  {
    id: 'FxqmVuCGriC53qGsm8E8CeUAZiE5BRLc7kY8CYTXpump',
    mint: 'FxqmVuCGriC53qGsm8E8CeUAZiE5BRLc7kY8CYTXpump',
    name: 'Wishing Well',
    ticker: 'Wish',
    description: 'Wishing Well — liquidity in the well. Gold fees drop into The Well.',
    imageUrl: '/tokens/wish-token.png',
    imageThumb: undefined,
    creatorFee: 1,
    quoteMint: 'So11111111111111111111111111111111111111112',
    quoteTicker: 'SOL',
    pairMode: 'sol',
    signature: 'site-seeded',
    createdAt: '2026-09-26T00:30:00.000Z',
    socials: { website: 'https://thewishingwell.lol' },
  },
  {
    id: 'EF9gREJLEhZ1TugfjufJJjSHWYZe4xUrFaMt6QeNqE86',
    mint: 'EF9gREJLEhZ1TugfjufJJjSHWYZe4xUrFaMt6QeNqE86',
    name: 'Test the Wish',
    ticker: 'TEST',
    description: 'Test — launched on The Wishing Well.',
    imageUrl: '/tokens/test-token.jpg',
    imageThumb: undefined,
    metadataUri: 'ipfs://bafkreif6w3s2qfhbyfpskjh2yohy5tlae3o7ld57sanbcfqit4mjgy2mv4',
    creatorFee: 1,
    quoteMint: 'So11111111111111111111111111111111111111112',
    quoteTicker: 'SOL',
    pairMode: 'sol',
    signature: 'site-seeded',
    createdAt: '2026-09-26T00:16:11.000Z',
    socials: { website: 'https://thewishingwell.lol' },
  },
]
