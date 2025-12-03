import { TradeHistory } from '@/types/trading'

export function getAccountHistoryPnl(history: TradeHistory[]): bigint {
  return history.reduce((acc, trade) => acc + (!trade.isOpen ? trade.pnl : BigInt(0)), BigInt(0))
}

export function getAccountTotalVolume(history: TradeHistory[]): bigint {
  return history.reduce(
    (acc, trade) => acc + (trade.isOpen ? trade.entryPrice * trade.size : trade.exitPrice * trade.size),
    BigInt(0),
  )
}
