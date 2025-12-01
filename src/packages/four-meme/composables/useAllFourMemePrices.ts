import { onMounted, onUnmounted } from 'vue'
import { FOUR_MEME_MARKETS } from '../constants'
import { getAllFourMemePricesFromCache, ensureWebSocketInitialized, subscribeToAllTokenIds } from './useFourMemeWebSocket'
import { useFourMemePrice24h } from './useFourMemePrice24h'
import { useBnbUsdPrice } from '@/packages/gains'
import { getAllFourMemeMarketPrices } from '../api/oracle'
import type { FourMemeMarket } from '../constants'

export interface FourMemePriceData {
  symbol: string
  price: bigint
  change24h: number
}

export function useAllFourMemePrices() {
  const fourMemePrice24h = useFourMemePrice24h()
  const { price: bnbUsdPrice } = useBnbUsdPrice()

  onMounted(() => {
    ensureWebSocketInitialized()
    // Subscribe to all token IDs to ensure we receive price updates
    const tokenIds = FOUR_MEME_MARKETS.map((market) => market.tokenId)
    subscribeToAllTokenIds(tokenIds)
    fourMemePrice24h.startAutoRefresh(FOUR_MEME_MARKETS)
  })

  onUnmounted(() => {
    fourMemePrice24h.stopAutoRefresh()
  })

  async function fetchAllPrices(): Promise<Map<string, FourMemePriceData>> {
    const result = new Map<string, FourMemePriceData>()

    try {
      const apiPrices = await getAllFourMemeMarketPrices(FOUR_MEME_MARKETS)

      apiPrices.forEach((priceData, symbol) => {
        const priceBigInt = BigInt(Math.floor(priceData.price * 10 ** 18))
        result.set(symbol, {
          symbol,
          price: priceBigInt,
          change24h: priceData.change24h,
        })
      })
    } catch (error) {
      console.error('Four.meme: Failed to fetch all prices:', error)
    }

    return result
  }

  function getCurrentWebSocketPrices(): Map<string, FourMemePriceData> {
    const result = new Map<string, FourMemePriceData>()
    const priceCache = getAllFourMemePricesFromCache()
    const bnbPrice = bnbUsdPrice.value

    if (!bnbPrice || bnbPrice <= 0) {
      return result
    }

    FOUR_MEME_MARKETS.forEach((market: FourMemeMarket) => {
      const priceUpdate = priceCache.get(market.tokenId)

      if (priceUpdate && priceUpdate.price) {
        const priceInBnb = parseFloat(priceUpdate.price)
        if (!isNaN(priceInBnb) && priceInBnb > 0) {
          const priceInUsd = priceInBnb * bnbPrice
          const change24hRate = fourMemePrice24h.calculate24hChangeRate(priceInUsd, market.tokenId)
          const priceBigInt = BigInt(Math.floor(priceInUsd * 10 ** 18))

          result.set(market.id, {
            symbol: market.id,
            price: priceBigInt,
            change24h: change24hRate * 100, // Convert to percentage
          })
        }
      }
    })

    return result
  }

  return {
    fetchAllPrices,
    getCurrentWebSocketPrices,
  }
}
