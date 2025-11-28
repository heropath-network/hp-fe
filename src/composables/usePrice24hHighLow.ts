import { ref, watch, Ref, computed } from 'vue'
import { queryAssetOracleCandle } from '@/api/oracle'
import { tryOnScopeDispose } from '@vueuse/core'
import { ProjectId } from '@/constants'

export interface Price24hHighLow {
  high: number
  low: number
}

async function fetchPrice24hHighLow(symbol: string, projectId: ProjectId): Promise<Price24hHighLow | null> {
  try {
    const toTime = Math.floor(Date.now() / 1000)
    const fromTime = toTime - 86400 // 24 hours ago
    
    const candles = await queryAssetOracleCandle(60, fromTime, toTime, symbol, projectId)
    
    if (!candles || candles.length === 0) {
      return null
    }
    

    const prices: number[] = []
    candles.forEach((candle) => {
      prices.push(parseFloat(candle.open))
      prices.push(parseFloat(candle.close))
      prices.push(parseFloat(candle.high))
      prices.push(parseFloat(candle.low))
    })
    

    const validPrices = prices.filter(p => !isNaN(p) && p > 0)
    
    if (validPrices.length === 0) {
      return null
    }
    
    const high = Math.max(...validPrices)
    const low = Math.min(...validPrices)
    
    return { high, low }
  } catch (error) {
    console.error('Failed to fetch 24h high/low:', error)
    return null
  }
}

export function usePrice24hHighLow(symbol: Ref<string | null | undefined>, projectId: Ref<ProjectId>) {
  const data = ref<Price24hHighLow | null>(null)
  const isLoading = ref(true)
  let updateTimer: ReturnType<typeof setInterval> | null = null
  
  const update = async () => {
    const currentSymbol = symbol.value
    const currentProjectId = projectId.value
    
    if (!currentSymbol) {
      data.value = null
      isLoading.value = false
      return
    }

    let symbolToQuery = currentSymbol
    if (currentProjectId !== ProjectId.GAINS) {
      // MUX V3: Extract just base symbol (e.g., "BTC/USD" -> "BTC")
      symbolToQuery = currentSymbol.split('/')[0]
    }
    // GTrade: Keep full symbol (e.g., "BTC/USD")
    
    isLoading.value = true
    data.value = await fetchPrice24hHighLow(symbolToQuery, currentProjectId)
    isLoading.value = false
  }
  

  watch([symbol, projectId], () => {
    if (updateTimer) {
      clearInterval(updateTimer)
      updateTimer = null
    }
    
    if (!symbol.value) {
      data.value = null
      isLoading.value = false
      return
    }

    update()

    updateTimer = setInterval(() => {
      update()
    }, 60 * 1000)
  }, { immediate: true })

  tryOnScopeDispose(() => {
    if (updateTimer) {
      clearInterval(updateTimer)
    }
  })
  
  return {
    data: computed(() => data.value),
    isLoading: computed(() => isLoading.value)
  }
}
