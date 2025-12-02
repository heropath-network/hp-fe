/**
 * Demo data  for testing the trading interface
 */

import { useTradeStore } from '@/stores/tradeStore'
import { toBigInt } from '@/utils/bigint'

export function useDemoData() {
  const tradeStore = useTradeStore()

  function loadDemoPositions() {
    // Add some demo positions
    tradeStore.openPosition(
      'BTC/USD',
      'long',
      toBigInt('0.5'),
      toBigInt('48500'),
      10,
      toBigInt('2425'),
      56, // BNB Chain
      'aster' // Aster liquidity source
    )

    tradeStore.openPosition(
      'ETH/USD',
      'short',
      toBigInt('2'),
      toBigInt('3100'),
      15,
      toBigInt('413'),
      42161, // Arbitrum
      'four' // Four liquidity source
    )
  }

  function loadDemoOrders() {
    // Add some demo orders
    tradeStore.placeOrder(
      'BTC/USD',
      'long',
      toBigInt('0.2'),
      toBigInt('49000'),
      'limit'
    )

    tradeStore.placeOrder(
      'ETH/USD',
      'short',
      toBigInt('1'),
      toBigInt('2950'),
      'stop'
    )

    tradeStore.placeOrder(
      'SOL/USD',
      'long',
      toBigInt('10'),
      toBigInt('98'),
      'limit'
    )
  }

  function loadDemoHistory() {
    // Add some demo trade history
    const now = Date.now()
    const oneHour = 3600000
    const oneDay = 86400000

    // Winning trade
    tradeStore.tradeHistory.push({
      id: 'demo-1',
      market: 'BTC/USD',
      side: 'long',
      size: toBigInt('0.3'),
      entryPrice: toBigInt('47500'),
      exitPrice: toBigInt('48200'),
      pnl: toBigInt('210'),
      timestamp: now - oneDay * 2,
      closeTimestamp: now - oneDay * 2 + oneHour * 3
    })

    // Losing trade
    tradeStore.tradeHistory.push({
      id: 'demo-2',
      market: 'ETH/USD',
      side: 'short',
      size: toBigInt('1.5'),
      entryPrice: toBigInt('3150'),
      exitPrice: toBigInt('3200'),
      pnl: toBigInt('-75'),
      timestamp: now - oneDay,
      closeTimestamp: now - oneDay + oneHour * 5
    })

    // Another winning trade
    tradeStore.tradeHistory.push({
      id: 'demo-3',
      market: 'SOL/USD',
      side: 'long',
      size: toBigInt('50'),
      entryPrice: toBigInt('95'),
      exitPrice: toBigInt('102'),
      pnl: toBigInt('350'),
      timestamp: now - oneHour * 8,
      closeTimestamp: now - oneHour * 2
    })
  }

  function loadAllDemoData() {
    loadDemoPositions()
    loadDemoOrders()
    loadDemoHistory()
  }

  function clearAllData() {
    tradeStore.positions = []
    tradeStore.orders = []
    tradeStore.tradeHistory = []
    tradeStore.accountBalance = toBigInt('10000')
  }

  return {
    loadDemoPositions,
    loadDemoOrders,
    loadDemoHistory,
    loadAllDemoData,
    clearAllData
  }
}

