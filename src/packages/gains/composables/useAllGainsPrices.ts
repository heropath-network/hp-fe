import { computed } from 'vue'
import { getAllGainsMarketPrices } from '../api/oracle'
import { useAllGainsWebSocketPrices } from './useGainsWebSocketPrice'
import { GAINS_PAIR_INDEX_MAP } from '../constants'

export interface GainsPriceData {
  symbol: string
  price: bigint
  change24h: number
}

export function useAllGainsPrices() {
  const wsPrices = useAllGainsWebSocketPrices()

  async function fetchAllPrices(): Promise<Map<string, GainsPriceData>> {
    try {
      const pricesMap = await getAllGainsMarketPrices()
      const result = new Map<string, GainsPriceData>()

      for (const [symbol, priceData] of pricesMap.entries()) {
        if (priceData.price !== null && priceData.price > 0) {
          const priceBigInt = BigInt(Math.floor(priceData.price * 10 ** 18))
          result.set(symbol, {
            symbol,
            price: priceBigInt,
            change24h: priceData.change24h,
          })
        }
      }

      return result
    } catch (error) {
      console.error('Gains: Failed to fetch prices:', error)
      return new Map()
    }
  }

  function getCurrentWebSocketPrices(): Map<string, GainsPriceData> {
    const result = new Map<string, GainsPriceData>()

    for (const [symbol, pairIndex] of Object.entries(GAINS_PAIR_INDEX_MAP)) {
      const wsPrice = wsPrices.pairPrices.value.get(pairIndex)

      if (wsPrice !== undefined && wsPrice !== null && wsPrice > 0) {
        const priceBigInt = BigInt(Math.floor(wsPrice * 10 ** 18))
        result.set(symbol, {
          symbol,
          price: priceBigInt,
          change24h: 0,
        })
      }
    }

    return result
  }

  return {
    fetchAllPrices,
    getCurrentWebSocketPrices,
    isConnected: computed(() => wsPrices.isConnected.value),
    status: computed(() => wsPrices.status.value),
  }
}
