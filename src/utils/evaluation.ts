import { TradeHistory } from '@/types/trading'
import * as _ from 'lodash-es'

export function getAccountHistoryPnl(history: TradeHistory[]): bigint {
  return history.reduce((acc, trade) => acc + (!trade.isOpen ? trade.pnl : BigInt(0)), BigInt(0))
}

export function getAccountTotalVolume(history: TradeHistory[]): bigint {
  return history.reduce(
    (acc, trade) => acc + (trade.isOpen ? trade.entryPrice * trade.size : trade.exitPrice * trade.size),
    BigInt(0),
  )
}

export function countTradesWinRate(history: TradeHistory[]): {
  market: string
  tradeCount: number
  winCount: number
  winRate: number
}[] {
  const newHistory = history.filter((trade) => !trade.isOpen)

  const grouped = _.groupBy(newHistory, (trade) => trade.market)

  const result = Object.entries(grouped).map(([market, trades]) => {
    const tradeCount = trades.length
    const winCount = trades.filter((trade) => !trade.isOpen && trade.pnl > BigInt(0)).length
    const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0
    return {
      market,
      tradeCount,
      winCount,
      winRate: parseFloat(winRate.toFixed(2)),
    }
  })
  return result
}
