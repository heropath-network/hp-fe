import { computed, Ref, watch, onMounted, onUnmounted } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { fromBigInt } from '@/utils/bigint'
import { ProjectId } from '@/constants'
import { useGainsPrice24h } from '@/packages/gains'
import { useMuxV3Price24h } from '@/packages/mux-v3'
import { autoSelectOracle } from '@/utils/oracleMatching'

export interface Market24hRatesResult {
  rates: Record<string, number>
  isLoading: boolean
}

/**
 * Calculate 24h change rates for markets
 * Can be used for a single market or multiple markets
 * 
 * @param markets - Ref to array of market symbols, or a single market symbol ref
 * @param options - Optional configuration
 * @returns Computed object with rates and loading state
 */
export function useMarket24hRates(
  markets: Ref<string[]>,
  options?: {
    autoRefresh?: boolean
    onMounted?: boolean
  }
) {
  const tradeStore = useTradeStore()
  const gainsPrice24h = useGainsPrice24h()
  const muxV3Price24h = useMuxV3Price24h()

  const autoRefresh = options?.autoRefresh !== false 
  const refreshOnMounted = options?.onMounted !== false

  
  const marketsArray = computed(() => {
    const value = markets.value
    return value ? value : []
  })

  const result = computed<Market24hRatesResult>(() => {
    const rates: Record<string, number> = {}
    let isLoading = false

    marketsArray.value.forEach((market) => {
      const marketPrice = tradeStore.marketPrices[market]
      if (!marketPrice || !marketPrice.price) {
        rates[market] = 0
        return
      }

      const currentPrice = parseFloat(fromBigInt(marketPrice.price, 8))
      if (!currentPrice || currentPrice <= 0) {
        rates[market] = 0
        return
      }

    
      const oracle = autoSelectOracle(market)
      let rate = 0

      if (oracle === ProjectId.GAINS) {
        rate = gainsPrice24h.calculate24hChangeRate(currentPrice, market)
       
        if (gainsPrice24h.isLoading.value) {
          isLoading = true
        }
      } else if (oracle === ProjectId.MUX_V3) {
        const symbolName = market.split('/')[0]
        rate = muxV3Price24h.calculate24hChangeRate(currentPrice, symbolName)
       
        if (muxV3Price24h.isLoading.value) {
          isLoading = true
        }
      }

      rates[market] = rate * 100 
    })

    return { rates, isLoading }
  })

  
  function startAutoRefresh() {
    const marketsList = marketsArray.value
    if (marketsList.length === 0) return

   
    gainsPrice24h.startAutoRefresh()

   
    const muxV3Symbols = marketsList
      .filter(market => autoSelectOracle(market) === ProjectId.MUX_V3)
      .map(market => market.split('/')[0])
      .filter((symbol, index, arr) => arr.indexOf(symbol) === index) // Remove duplicates

    if (muxV3Symbols.length > 0) {
      muxV3Price24h.startAutoRefresh(muxV3Symbols)
    }
  }

  function stopAutoRefresh() {
    gainsPrice24h.stopAutoRefresh()
    muxV3Price24h.stopAutoRefresh()
  }

  watch(
    marketsArray,
    () => {
      if (autoRefresh) {
        stopAutoRefresh()
        startAutoRefresh()
      }
    },
    { immediate: false }
  )

  if (refreshOnMounted) {
    onMounted(() => {
      startAutoRefresh()
    })
  }

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    rates: computed(() => result.value.rates),
    isLoading: computed(() => result.value.isLoading),
    startAutoRefresh,
    stopAutoRefresh,
  }
}
