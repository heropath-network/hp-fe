export interface Position {
  accountId: string
  id: string
  market: string
  side: 'long' | 'short'
  size: bigint
  entryPrice: bigint
  leverage: number
  collateral: bigint
  liquidationPrice: bigint
  timestamp: number
}

export interface Order {
  accountId: string
  id: string
  market: string
  side: 'long' | 'short'
  size: bigint
  triggerPrice: bigint
  orderType: 'limit' | 'stop'
  timestamp: number
}

export interface TradeHistory {
  accountId: string
  id: string
  market: string
  side: 'long' | 'short'
  size: bigint
  isOpen: boolean
  entryPrice: bigint
  exitPrice: bigint
  pnl: bigint
  timestamp: number
  closeTimestamp: number
}
