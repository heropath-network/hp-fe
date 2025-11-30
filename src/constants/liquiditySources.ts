export type LiquiditySourceId = 'aster' | 'four' | 'standx' | 'gtrade'

export interface LiquiditySourceInfo {
  id: LiquiditySourceId
  name: string
  maxLongAmount: number | null
  assetSymbol: string
  enabledByDefault?: boolean
}

export const LIQUIDITY_SOURCES: LiquiditySourceInfo[] = [
  {
    id: 'aster',
    name: 'Aster',
    maxLongAmount: 9198,
    assetSymbol: 'ETH',
    enabledByDefault: true
  },
  {
    id: 'four',
    name: 'Four',
    maxLongAmount: 9198,
    assetSymbol: 'ETH',
    enabledByDefault: true
  },
  {
    id: 'standx',
    name: 'StandX',
    maxLongAmount: null,
    assetSymbol: 'ETH',
    enabledByDefault: true
  },
  {
    id: 'gtrade',
    name: 'gTrade',
    maxLongAmount: 90000,
    assetSymbol: 'ETH',
    enabledByDefault: false
  }
]
