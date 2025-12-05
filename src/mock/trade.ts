import { watch, ref } from 'vue'
import { useConnection } from '@wagmi/vue'
import { useUserTradeHistoryStorage } from '@/storages/trading'
import { TradeHistory } from '@/storages/trading'

export const mockTradeHistory: Record<string, TradeHistory[]> = {
  ['0xadda9017fd0e032001f6c3520770d922606c096d'.toLowerCase()]: [
    {
      id: 'pos-1764957207575-qe2smrhia',
      accountId: '890332',
      market: 'BTC/USD',
      side: 'long',
      size: 10000000000000000000n,
      entryPrice: 89405999999999996329984n,
      exitPrice: 109359000000000002359296n,
      pnl: 1206490825924629889284n,
      collateral: 17880599999999998164992n,
      leverage: 5,
      timestamp: 1764957207575,
      closeTimestamp: 1764957285752,
      chainId: 42161,
      liquiditySource: 'aster',
      fee: 829492402999999990814n,
      isIsolatedMargin: false,
    },
  ],
}

export function useInitialSetMockTradeHistories() {
  const { address } = useConnection()

  function initialSetMockTradeHistories(addr: string) {
    const { data: userTradeHistories, addTradeHistory } = useUserTradeHistoryStorage(ref(addr))
    const existedIds = userTradeHistories.value.map((e) => e.id)
    const mockTrades = mockTradeHistory[addr.toLowerCase()] || []
    mockTrades.forEach((tradeItem) => {
      if (!existedIds.includes(tradeItem.id)) {
        addTradeHistory(tradeItem)
      }
    })
  }

  watch(
    () => address.value,
    (newAddress) => {
      if (newAddress) {
        initialSetMockTradeHistories(newAddress.toLowerCase())
      }
    },
    { immediate: true },
  )
}
