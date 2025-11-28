import { ref, computed, watch, onUnmounted, type Ref } from 'vue'
import { fetchOracleCandles } from '@/components/trade/chart/utils'
import { ProjectId } from '@/constants'
import { useTradeStore } from '@/stores/tradeStore'

const priceInfoMap = new Map<string, { price: string; timestamp: number }>()

export function useMuxRealtimePrice(
  symbol: Ref<string | null | undefined>,
  refreshInterval = 200
) {
  const tradeStore = useTradeStore()
  const priceInfo: Ref<[string | null, number | null]> = ref([null, null])
  let timer: number | undefined

  const price = computed(() => {
    if (!priceInfo.value[0]) return null
    return parseFloat(priceInfo.value[0])
  })

  async function fetchPrice(symbolValue: string) {
    if (tradeStore.selectedOracle !== ProjectId.MUX_V3) {
      return
    }
    
    try {
      const resolution = 5 // Use 5min resolution
      const now = Math.floor(Date.now() / 1000)
      const from = now - resolution * 60 * 2

      const candles = await fetchOracleCandles(
        resolution,
        from,
        now,
        symbolValue,
        ProjectId.MUX_V3
      )

      if (candles.length > 0) {
        const latestCandle = candles[candles.length - 1]
        const priceValue = latestCandle.close.toString()
        const timestamp = Math.floor(latestCandle.time / 1000)


        priceInfoMap.set(symbolValue, { price: priceValue, timestamp })

        priceInfo.value = [priceValue, timestamp]
      }
    } catch (error) {
      console.error(`MUX V3: Failed to fetch realtime price for ${symbolValue}:`, error)
    }
  }

  watch(
    [symbol, () => tradeStore.selectedOracle],
    ([newSymbol, selectedOracle]) => {
      if (timer) {
        window.clearInterval(timer)
        timer = undefined
      }


      if (newSymbol && selectedOracle === ProjectId.MUX_V3) {
        const cached = priceInfoMap.get(newSymbol)
        if (cached) {
          priceInfo.value = [cached.price, cached.timestamp]
        }

        fetchPrice(newSymbol)

        timer = window.setInterval(() => {
          if (newSymbol && tradeStore.selectedOracle === ProjectId.MUX_V3) {
            fetchPrice(newSymbol)
          }
        }, refreshInterval)
      } else {
        priceInfo.value = [null, null]
      }
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  })

  return {
    price,
    priceInfo,
  }
}

