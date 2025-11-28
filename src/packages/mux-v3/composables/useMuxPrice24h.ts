import { ref, computed } from 'vue'
import { getMux24hAgoPrices } from '../api/oracle'

const price24hAgoMap = ref<Map<string, number>>(new Map())
const isLoading = ref(false)
const lastFetchTime = ref<number>(0)

const REFRESH_INTERVAL = 60 * 1000

export function useMuxPrice24h() {
  let updateTimer: number | null = null


  async function fetchPrice24hAgo(symbols: string[]) {
    if (!symbols || symbols.length === 0) {
      return
    }

    try {
      isLoading.value = true
      
      const priceAgos = await getMux24hAgoPrices(symbols)



      if (priceAgos && priceAgos.length > 0) {
        priceAgos.forEach((item: any) => {
          const price = item.price ? parseFloat(item.price) : (item ? parseFloat(item) : 0)
          if (item.symbol && price > 0) {
            price24hAgoMap.value.set(item.symbol, price)
          }
        })
        lastFetchTime.value = Date.now()
      }
    } catch (error) {
      console.error('MUX V3: Failed to fetch 24h ago prices:', error)
    } finally {
      isLoading.value = false
    }
  }

 
  function getPrice24hAgo(symbol: string): number | null {
    return price24hAgoMap.value.get(symbol) ?? null
  }

  function calculate24hChangeRate(currentPrice: number, symbol: string): number {
    const price24hAgo = getPrice24hAgo(symbol)

    console.log('price24hAgo', price24hAgo, 'currentPrice', currentPrice)
    
    if (!price24hAgo || price24hAgo === 0) {
      return 0
    }

    return (currentPrice - price24hAgo) / price24hAgo
  }

  function startAutoRefresh(symbols: string[]) {
    stopAutoRefresh()
    
    fetchPrice24hAgo(symbols)
    
    updateTimer = window.setInterval(() => {
      fetchPrice24hAgo(symbols)
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

