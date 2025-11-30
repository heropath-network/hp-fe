import { ref, computed } from 'vue'
import { getFourMemeTokenData } from '../api/oracle'
import type { FourMemeMarket } from '../constants'

const price24hAgoMap = ref<Map<number, number>>(new Map())
const isLoading = ref(false)
const lastFetchTime = ref<number>(0)

const REFRESH_INTERVAL = 60_000

export function useFourMemePrice24h() {
  let updateTimer: number | null = null

  async function fetchPrice24hAgo(market: FourMemeMarket) {
    try {
      isLoading.value = true

      const tokenData = await getFourMemeTokenData(market.address)

      if (tokenData && tokenData.tokenPrice) {
        // Calculate 24h ago price from current price and dayIncrease
        const currentPrice = parseFloat(tokenData.tokenPrice.price)
        const dayIncrease = parseFloat(tokenData.dayIncrease || '0')

        if (currentPrice > 0 && !isNaN(dayIncrease)) {
          // dayIncrease is the percentage change, so: current = past * (1 + dayIncrease)
          // past = current / (1 + dayIncrease)
          const price24hAgo = currentPrice / (1 + dayIncrease)
          price24hAgoMap.value.set(market.tokenId, price24hAgo)
          lastFetchTime.value = Date.now()
        }
      }
    } catch (error) {
      console.error('Four.meme: Failed to fetch 24h ago price:', error)
    } finally {
      isLoading.value = false
    }
  }

  function getPrice24hAgo(tokenId: number): number | null {
    return price24hAgoMap.value.get(tokenId) ?? null
  }

  function calculate24hChangeRate(currentPrice: number, tokenId: number): number {
    const price24hAgo = getPrice24hAgo(tokenId)

    if (!price24hAgo || price24hAgo === 0) {
      return 0
    }

    return (currentPrice - price24hAgo) / price24hAgo
  }

  function startAutoRefresh(markets: FourMemeMarket[]) {
    stopAutoRefresh()

    // Fetch for all markets
    markets.forEach((market) => {
      fetchPrice24hAgo(market)
    })

    updateTimer = window.setInterval(() => {
      markets.forEach((market) => {
        fetchPrice24hAgo(market)
      })
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
    stopAutoRefresh,
  }
}
