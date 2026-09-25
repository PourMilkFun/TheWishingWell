import type { Coin } from '../data/coins'
import type { LaunchSort } from '../components/LaunchSortFilters'

function createdAtValue(value: string): number {
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : 0
}

export function sortLaunches(coins: Coin[], sort: LaunchSort): Coin[] {
  const list = [...coins]
  if (sort === 'recent') {
    return list.sort((a, b) => createdAtValue(b.createdAt) - createdAtValue(a.createdAt))
  }
  if (sort === 'marketCap') {
    return list.sort((a, b) => b.marketCap - a.marketCap)
  }
  return list.sort((a, b) => (b.liquidity ?? 0) - (a.liquidity ?? 0))
}
