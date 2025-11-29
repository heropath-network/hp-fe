import { onMounted, onUnmounted } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { getAllGainsMarketPrices } from '../api/oracle'
import { useAllGainsWebSocketPrices } from './useGainsWebSocketPrice'
import { GAINS_PAIR_INDEX_MAP } from '../constants'

/**
 * Composable to load and update prices for all Gains markets
 * Fetches initial prices from API and then updates from WebSocket
 */
export function useAllGainsPrices() {
  const tradeStore = useTradeStore()
  const wsPrices = useAllGainsWebSocketPrices()
  
  let updateInterval: ReturnType<typeof setInterval> | null = null
  let wsUpdateInterval: ReturnType<typeof setInterval> | null = null
  let isUpdating = false

  async function loadInitialPrices() {
    if (isUpdating) return
    isUpdating = true

    try {
      const pricesMap = await getAllGainsMarketPrices()
      
      // Update trade store with all prices
      for (const [symbol, priceData] of pricesMap.entries()) {
        if (priceData.price !== null && priceData.price > 0) {
          const priceBigInt = BigInt(Math.floor(priceData.price * (10 ** 18)))
          tradeStore.updateMarketPrice(symbol, priceBigInt, priceData.change24h)
        }
      }
    } catch (error) {
      console.error('Failed to load initial Gains prices:', error)
    } finally {
      isUpdating = false
    }
  }

  function updatePricesFromWebSocket() {
    // Update prices from WebSocket for all pairs
    for (const [symbol, pairIndex] of Object.entries(GAINS_PAIR_INDEX_MAP)) {
      const wsPrice = wsPrices.pairPrices.value.get(pairIndex)
      
      if (wsPrice !== undefined && wsPrice !== null && wsPrice > 0) {
        // Get current market price to preserve 24h change if available
        const currentMarketPrice = tradeStore.marketPrices[symbol]
        const change24h = currentMarketPrice?.change24h ?? 0
        
        const priceBigInt = BigInt(Math.floor(wsPrice * (10 ** 18)))
        tradeStore.updateMarketPrice(symbol, priceBigInt, change24h)
      }
    }
  }

  // Load initial prices on mount
  onMounted(() => {
    loadInitialPrices()
    
    // Poll WebSocket prices every 200ms to update store
    wsUpdateInterval = setInterval(() => {
      updatePricesFromWebSocket()
    }, 200)
    
    // Refresh prices from API periodically (every 5 minutes) to update 24h change
    updateInterval = setInterval(() => {
      loadInitialPrices()
    }, 5 * 60 * 1000)
  })

  onUnmounted(() => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
    if (wsUpdateInterval) {
      clearInterval(wsUpdateInterval)
      wsUpdateInterval = null
    }
  })

  return {
    loadInitialPrices,
    isConnected: wsPrices.isConnected,
    status: wsPrices.status
  }
}

