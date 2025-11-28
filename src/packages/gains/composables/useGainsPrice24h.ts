import { ref, computed } from 'vue'
import { getGains24hAgoPrices, getGainsPairIndex } from '../api/oracle'


const price24hAgoMap = ref<Map<number, number>>(new Map())
const isLoading = ref(false)
const lastFetchTime = ref<number>(0)

const REFRESH_INTERVAL = 60_000

export function useGainsPrice24h() {
  let updateTimer: number | null = null

  async function fetchPrice24hAgo() {
    try {
      isLoading.value = true
      
      const priceAgos = await getGains24hAgoPrices()
      
      if (priceAgos && priceAgos.length > 0) {
        // Update map with pairIndex -> price
        priceAgos.forEach((price, pairIndex) => {
          if (price !== null && price > 0) {
            price24hAgoMap.value.set(pairIndex, price)
          }
        })
        lastFetchTime.value = Date.now()
      }
    } catch (error) {
      console.error('GTrade: Failed to fetch 24h ago prices:', error)
    } finally {
      isLoading.value = false
    }
  }


  function getPrice24hAgo(symbol: string): number | null {
    const pairIndex = getGainsPairIndex(symbol)
    if (pairIndex === null) return null
    
    return price24hAgoMap.value.get(pairIndex) ?? null
  }


  function calculate24hChangeRate(currentPrice: number, symbol: string): number {
    const price24hAgo = getPrice24hAgo(symbol)
    
    if (!price24hAgo || price24hAgo === 0) {
      return 0
    }

    return (currentPrice - price24hAgo) / price24hAgo
  }


  function startAutoRefresh() {
    stopAutoRefresh()

    fetchPrice24hAgo()

    updateTimer = window.setInterval(() => {
      fetchPrice24hAgo()
    }, REFRESH_INTERVAL)
  }

  function stopAutoRefresh() {
    if (updateTimer) {
      clearInterval(updateTimer)
      updateTimer = null
    }
  }

  return {
    price24hAgoMap: computed(() => price24hAgoMap.value),
    isLoading: computed(() => isLoading.value),
    lastFetchTime: computed(() => lastFetchTime.value),
    fetchPrice24hAgo,
    getPrice24hAgo,
    calculate24hChangeRate,
    startAutoRefresh,
    stopAutoRefresh
  }
}

