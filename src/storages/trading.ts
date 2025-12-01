import { computed, readonly, Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { UserPositionsKey, UserOrdersKey, UserTradeHistory } from './keys'
import { EMPTY_ADDRESS } from '@/constants'
import { Position, Order, TradeHistory } from '@/types/trading'

export function useUserPositionsStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserPositionsKey.replace('{addr}', address.value ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<Position[]>(key, [])

  function clear() {
    storage.value = []
  }

  function addPosition(position: Position) {
    storage.value = [...storage.value, position]
  }

  return {
    data: readonly(storage),
    clear,
    addPosition,
  }
}

export function useUserOrdersStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserOrdersKey.replace('{addr}', address.value ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<Order[]>(key, [])

  function clear() {
    storage.value = []
  }

  function addOrder(order: Order) {
    storage.value = [...storage.value, order]
  }

  return {
    data: readonly(storage),
    clear,
    addOrder,
  }
}

export function useUserTradeHistoryStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserTradeHistory.replace('{addr}', address.value ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<TradeHistory[]>(key, [])

  function clear() {
    storage.value = []
  }

  function addTradeHistory(tradeHistory: TradeHistory) {
    storage.value = [...storage.value, tradeHistory]
  }

  return {
    data: readonly(storage),
    clear,
    addTradeHistory,
  }
}
