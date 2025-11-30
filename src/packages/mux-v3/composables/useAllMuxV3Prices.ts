import { ref, onMounted, onUnmounted } from 'vue'
import { MUX_V3_SUPPORTED_MARKETS } from '../constants'
import { useMux3AssetPriceComposition } from '../compositions/mux3MqttPriceServiceComposition'
import { useMuxV3Price24h } from './useMuxPrice24h'

export interface MuxV3PriceData {
  symbol: string
  price: bigint
  change24h: number
}

export function useAllMuxV3Prices() {
  const muxV3Price24h = useMuxV3Price24h()
  const priceSubscriptions: Map<string, ReturnType<typeof useMux3AssetPriceComposition>> = new Map()

  onMounted(() => {
    const symbols = Array.from(MUX_V3_SUPPORTED_MARKETS).map(market => market.split('/')[0])
    muxV3Price24h.startAutoRefresh(symbols)

    MUX_V3_SUPPORTED_MARKETS.forEach((market) => {
      const marketSymbol = market.split('/')[0]
      const symbolRef = ref(marketSymbol)
      const subscription = useMux3AssetPriceComposition(symbolRef, true, 200)
      priceSubscriptions.set(market, subscription)
    })
  })

  onUnmounted(() => {
    muxV3Price24h.stopAutoRefresh()
    priceSubscriptions.clear()
  })

  function getCurrentMqttPrices(): Map<string, MuxV3PriceData> {
    const result = new Map<string, MuxV3PriceData>()

    priceSubscriptions.forEach((subscription, market) => {
      const price = subscription.price.value

      if (price !== null && price > 0) {
        const marketSymbol = market.split('/')[0]
        const change24hRate = muxV3Price24h.calculate24hChangeRate(price, marketSymbol)
        const priceBigInt = BigInt(Math.floor(price * 10 ** 18))

        result.set(market, {
          symbol: market,
          price: priceBigInt,
          change24h: change24hRate * 100,
        })
      }
    })

    return result
  }

  return {
    getCurrentMqttPrices,
    priceSubscriptions,
  }
}

