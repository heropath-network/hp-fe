import { onMounted, onUnmounted, watch } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { useAllGainsPrices } from '@/packages/gains/composables/useAllGainsPrices'
import { useAllMuxV3Prices } from '@/packages/mux-v3/composables/useAllMuxV3Prices'
import { isMarketAvailableInMuxV3 } from '@/utils/oracleMatching'
import { ProjectId } from '@/constants'

export function usePriceOrchestrator() {
  const tradeStore = useTradeStore()
  const gainsPrices = useAllGainsPrices()
  const muxV3Prices = useAllMuxV3Prices()

  let gainsApiInterval: ReturnType<typeof setInterval> | null = null
  let gainsWsInterval: ReturnType<typeof setInterval> | null = null
  let muxV3Interval: ReturnType<typeof setInterval> | null = null

  async function updateGainsPrices() {
    const prices = await gainsPrices.fetchAllPrices()

    prices.forEach((priceData, symbol) => {
      if (isMarketAvailableInMuxV3(symbol) && tradeStore.selectedOracle === ProjectId.MUX_V3) {
        return
      }

      tradeStore.updateMarketPrice(symbol, priceData.price, priceData.change24h)
    })
  }

  function updateGainsWebSocketPrices() {
    const prices = gainsPrices.getCurrentWebSocketPrices()

    prices.forEach((priceData, symbol) => {
      if (isMarketAvailableInMuxV3(symbol) && tradeStore.selectedOracle === ProjectId.MUX_V3) {
        return
      }

      const currentMarketPrice = tradeStore.marketPrices[symbol]
      const change24h = currentMarketPrice?.change24h ?? priceData.change24h

      tradeStore.updateMarketPrice(symbol, priceData.price, change24h)
    })
  }

  function updateMuxV3Prices() {
    if (tradeStore.selectedOracle !== ProjectId.MUX_V3) {
      return
    }

    const prices = muxV3Prices.getCurrentMqttPrices()

    prices.forEach((priceData, symbol) => {
      tradeStore.updateMarketPrice(symbol, priceData.price, priceData.change24h)
    })
  }

  function refreshPricesOnOracleChange() {
    updateGainsPrices()

    if (tradeStore.selectedOracle === ProjectId.MUX_V3) {
      updateMuxV3Prices()
    }
  }

  onMounted(() => {
    updateGainsPrices()

    gainsWsInterval = setInterval(updateGainsWebSocketPrices, 200)
    gainsApiInterval = setInterval(updateGainsPrices, 5 * 60 * 1000)
    muxV3Interval = setInterval(updateMuxV3Prices, 200)

    watch(() => tradeStore.selectedOracle, refreshPricesOnOracleChange)
  })

  onUnmounted(() => {
    if (gainsApiInterval) {
      clearInterval(gainsApiInterval)
      gainsApiInterval = null
    }
    if (gainsWsInterval) {
      clearInterval(gainsWsInterval)
      gainsWsInterval = null
    }
    if (muxV3Interval) {
      clearInterval(muxV3Interval)
      muxV3Interval = null
    }
  })

  return {
    updateGainsPrices,
    updateMuxV3Prices,
    refreshPricesOnOracleChange,
  }
}

