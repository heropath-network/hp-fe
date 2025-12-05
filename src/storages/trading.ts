import { computed, readonly, Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { UserPositionsKey, UserOrdersKey, UserTradeHistory } from './keys'
import { EMPTY_ADDRESS } from '@/constants'
import type { LiquiditySourceId } from '@/constants/liquiditySources'

// Main type definitions - source of truth
export interface Position {
  id: string
  accountId: string
  market: string
  side: 'long' | 'short'
  size: bigint
  entryPrice: bigint
  leverage: number
  collateral: bigint
  liquidationPrice: bigint
  timestamp: number
  chainId: number
  isIsolatedMargin?: boolean
  liquiditySource: LiquiditySourceId
}

export interface Order {
  id: string
  accountId: string
  market: string
  side: 'long' | 'short'
  size: bigint
  triggerPrice: bigint
  orderType: 'limit' | 'stop'
  timestamp: number
  chainId: number
  liquiditySource: LiquiditySourceId
}

export interface TradeHistory {
  id: string
  accountId: string
  market: string
  side: 'long' | 'short'
  size: bigint
  entryPrice: bigint
  exitPrice: bigint
  pnl: bigint
  collateral: bigint
  leverage: number
  timestamp: number
  closeTimestamp: number
  chainId: number
  liquiditySource: LiquiditySourceId
}

// Internal storage format (BigInt as strings for LocalStorage)
type StoredPosition = Omit<Position, 'size' | 'entryPrice' | 'collateral' | 'liquidationPrice'> & {
  size: string
  entryPrice: string
  collateral: string
  liquidationPrice: string
}

type StoredOrder = Omit<Order, 'size' | 'triggerPrice'> & {
  size: string
  triggerPrice: string
}

type StoredTradeHistory = Omit<
  TradeHistory,
  'size' | 'entryPrice' | 'exitPrice' | 'pnl' | 'collateral' | 'leverage'
> & {
  size: string
  entryPrice: string
  exitPrice: string
  pnl: string
  collateral?: string // Optional for backward compatibility
  leverage?: number // Optional for backward compatibility
}

export function useUserPositionsStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserPositionsKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<StoredPosition[]>(key, [])

  function toStored(position: Position): StoredPosition {
    return {
      ...position,
      size: position.size.toString(),
      entryPrice: position.entryPrice.toString(),
      collateral: position.collateral.toString(),
      liquidationPrice: position.liquidationPrice.toString(),
    }
  }

  function fromStored(stored: StoredPosition): Position {
    return {
      ...stored,
      size: BigInt(stored.size),
      entryPrice: BigInt(stored.entryPrice),
      collateral: BigInt(stored.collateral),
      liquidationPrice: BigInt(stored.liquidationPrice),
    }
  }

  function clear() {
    storage.value = []
  }

  function addPosition(position: Position) {
    storage.value = [...storage.value, toStored(position)]
  }

  function updatePositions(positions: Position[]) {
    storage.value = positions.map(toStored)
  }

  function removePosition(positionId: string) {
    storage.value = storage.value.filter((p) => p.id !== positionId)
  }

  function removePositionsByMarket(market: string) {
    storage.value = storage.value.filter((p) => p.market !== market)
  }

  function removePositionsByAccountId(accountId: string) {
    storage.value = storage.value.filter((p) => p.accountId !== accountId)
  }

  function removePositionsByChainId(chainId: number) {
    storage.value = storage.value.filter((p) => p.chainId !== chainId)
  }

  const positions = computed(() => {
    return storage.value.map(fromStored)
  })

  return {
    data: readonly(positions),
    clear,
    addPosition,
    updatePositions,
    removePosition,
    removePositionsByMarket,
    removePositionsByAccountId,
    removePositionsByChainId,
  }
}

export function useUserOrdersStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserOrdersKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<StoredOrder[]>(key, [])

  function toStored(order: Order): StoredOrder {
    return {
      ...order,
      size: order.size.toString(),
      triggerPrice: order.triggerPrice.toString(),
    }
  }

  function fromStored(stored: StoredOrder): Order {
    return {
      ...stored,
      size: BigInt(stored.size),
      triggerPrice: BigInt(stored.triggerPrice),
    }
  }

  function clear() {
    storage.value = []
  }

  function addOrder(order: Order) {
    storage.value = [...storage.value, toStored(order)]
  }

  function updateOrders(orders: Order[]) {
    storage.value = orders.map(toStored)
  }

  function removeOrder(orderId: string) {
    storage.value = storage.value.filter((o) => o.id !== orderId)
  }

  function removeOrdersByMarket(market: string) {
    storage.value = storage.value.filter((o) => o.market !== market)
  }

  function removeOrdersByAccountId(accountId: string) {
    storage.value = storage.value.filter((o) => o.accountId !== accountId)
  }

  function removeOrdersByChainId(chainId: number) {
    storage.value = storage.value.filter((o) => o.chainId !== chainId)
  }

  const orders = computed(() => {
    return storage.value.map(fromStored)
  })

  return {
    data: readonly(orders),
    clear,
    addOrder,
    updateOrders,
    removeOrder,
    removeOrdersByMarket,
    removeOrdersByAccountId,
    removeOrdersByChainId,
  }
}

export function useUserTradeHistoryStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserTradeHistory.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<StoredTradeHistory[]>(key, [])

  function toStored(history: TradeHistory): StoredTradeHistory {
    return {
      ...history,
      size: history.size.toString(),
      entryPrice: history.entryPrice.toString(),
      exitPrice: history.exitPrice.toString(),
      pnl: history.pnl.toString(),
      collateral: history.collateral.toString(),
    }
  }

  function fromStored(stored: StoredTradeHistory): TradeHistory {
    // Calculate default collateral from size if not present (for backward compatibility)
    // Estimate collateral as size / leverage, default leverage to 1 if not present
    const defaultLeverage = stored.leverage ?? 1
    const defaultCollateral = stored.collateral
      ? BigInt(stored.collateral)
      : BigInt(stored.size) / BigInt(defaultLeverage)

    return {
      ...stored,
      size: BigInt(stored.size),
      entryPrice: BigInt(stored.entryPrice),
      exitPrice: BigInt(stored.exitPrice),
      pnl: BigInt(stored.pnl),
      collateral: defaultCollateral,
      leverage: defaultLeverage,
    }
  }

  function clear() {
    storage.value = []
  }

  function addTradeHistory(tradeHistory: TradeHistory) {
    storage.value = [toStored(tradeHistory), ...storage.value]
  }

  function updateTradeHistory(history: TradeHistory[]) {
    storage.value = history.map(toStored)
  }

  const tradeHistory = computed(() => {
    return storage.value.map(fromStored)
  })

  return {
    data: readonly(tradeHistory),
    clear,
    addTradeHistory,
    updateTradeHistory,
  }
}
