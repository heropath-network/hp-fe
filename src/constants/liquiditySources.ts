export type LiquiditySourceId = 'aster' | 'four' | 'standx' | 'gtrade'
export type SupportedLiquidityAsset = 'BTC' | 'ETH'

export interface LiquidityCapacity {
  maxLong: number | null
  maxShort: number | null
}

export interface LiquiditySourceInfo {
  id: LiquiditySourceId
  name: string
  capacities: Partial<Record<SupportedLiquidityAsset, LiquidityCapacity>>
  enabledByDefault?: boolean
}

export const LIQUIDITY_SOURCES: LiquiditySourceInfo[] = [
  {
    id: 'aster',
    name: 'Aster',
    capacities: {
      ETH: {
        maxLong: 9198,
        maxShort: null,
      },
      BTC: {
        maxLong: 55.234,
        maxShort: 12.936,
      },
    },
    enabledByDefault: true,
  },
  {
    id: 'four',
    name: 'Four',
    capacities: {
      ETH: {
        maxLong: 10198,
        maxShort: 845,
      },
      BTC: {
        maxLong: 4.88,
        maxShort: 2.47317,
      },
    },
    enabledByDefault: true,
  },
  {
    id: 'standx',
    name: 'StandX',
    capacities: {
      ETH: {
        maxLong: null,
        maxShort: 345,
      },
      BTC: {
        maxLong: 3.234,
        maxShort: null,
      },
    },
    enabledByDefault: true,
  },
  {
    id: 'gtrade',
    name: 'gTrade',
    capacities: {
      ETH: {
        maxLong: 9670,
        maxShort: 2845,
      },
      BTC: {
        maxLong: 9.93,
        maxShort: 8.45,
      },
    },
    enabledByDefault: true,
  },
]
