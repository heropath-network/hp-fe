export interface Position {
  accountId: number
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
  accountId: number
  id: string
  market: string
  side: 'long' | 'short'
  size: bigint
  triggerPrice: bigint
  orderType: 'limit' | 'stop'
  timestamp: number
}

export interface TradeHistory {
  accountId: number
  id: string
  market: string
  side: 'long' | 'short'
  size: bigint
  entryPrice: bigint
  exitPrice: bigint
  pnl: bigint
  timestamp: number
  closeTimestamp: number
}
