import { TradeHistory, Position } from '@/storages/trading'
import * as _ from 'lodash-es'

export function getAccountHistoryPnl(history: TradeHistory[]): bigint {
  return history.reduce((acc, trade) => acc + (!!trade.closeTimestamp ? trade.pnl : BigInt(0)), BigInt(0))
}

export function getAccountTotalVolume(history: TradeHistory[]): bigint {
  return history.reduce(
    (acc, trade) => acc + (!!trade.closeTimestamp ? trade.exitPrice * trade.size : trade.entryPrice * trade.size),
    BigInt(0),
  )
}

export function countTradesWinRate(history: TradeHistory[]): {
  market: string
  tradeCount: number
  winCount: number
  winRate: number
}[] {
  const newHistory = history.filter((trade) => !!trade.closeTimestamp)

  const grouped = _.groupBy(newHistory, (trade) => trade.market)

  const result = Object.entries(grouped).map(([market, trades]) => {
    const tradeCount = trades.length
    const winCount = trades.filter((trade) => !!trade.closeTimestamp && trade.pnl > BigInt(0)).length
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

export function getPositionsUnrealizedPnl(positions: Position[], price: Record<string, number>): bigint {
  return positions.reduce((acc, position) => {
    const market = position.market.split('/')[0]
    const marketPrice = price[market ?? '']
    if (!marketPrice) {
      return acc
    }

    const entryPriceNum = Number(position.entryPrice.toString())
    const sizeNum = Number(position.size.toString())

    let pnl = 0
    if (position.side === 'long') {
      pnl = (marketPrice - entryPriceNum) * sizeNum
    } else {
      pnl = (entryPriceNum - marketPrice) * sizeNum
    }

    return acc + BigInt(Math.floor(pnl))
  }, BigInt(0))
}
