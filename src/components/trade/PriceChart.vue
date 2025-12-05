<template>
  <div class="relative flex h-full w-full flex-col bg-[var(--hp-bg-dark)]">
    <div v-if="!showChart" class="absolute inset-0 flex items-center justify-center bg-[var(--hp-bg-dark)]">
      <div class="text-center">
        <div class="mb-2 text-sm text-gray-400">Loading chart...</div>
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-600 mx-auto"></div>
      </div>
    </div>

    <div id="TV-chart" class="h-full w-full" :class="{ 'opacity-0': !showChart }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, markRaw, effectScope, type EffectScope, type WatchStopHandle } from 'vue'
import { computedEager } from '@vueuse/core'
import { useTradeStore } from '@/stores/tradeStore'
import Widget from './chart/widget'
import { convertResolutionStrToNum, alignTimeToResolution, fetchOracleCandles } from './chart/utils'
import { useGainsWebSocketPrice, useGainsPrice24h, useBnbUsdPrice, GAINS_PAIR_INDEX_MAP } from '@/packages/gains'
import { useMuxV3Price24h, useMuxRealtimePrice } from '@/packages/mux-v3'
import { useFourMemeWebSocketPrice, useFourMemePrice24h, getFourMemeMarket } from '@/packages/four-meme'
import { ProjectId } from '@/constants'
import type { Bar } from '@/types/tradingview'
import { useChartPositions } from './chart/useChartPositions'
import { useChartOrders } from './chart/useChartOrders'

const tradeStore = useTradeStore()

const selectedMarket = computed(() => tradeStore.selectedMarket)
const selectedOracle = computed(() => tradeStore.selectedOracle)

const DEFAULT_PRICE_PRECISION = 2

function derivePrecisionFromPrice(price?: number | null) {
  if (price === null || price === undefined || !isFinite(price) || price <= 0) {
    return DEFAULT_PRICE_PRECISION
  }

  if (price < 1) {
    return 6
  }

  if (price < 100) {
    return 4
  }

  return 2
}

function getStoredMarketPrice(market: string) {
  const marketPrice =
    (tradeStore.marketPrices as any)?.[market]?.price ??
    (tradeStore.marketPrices as any)?.value?.[market]?.price
  if (!marketPrice) {
    return null
  }

  const priceNumber = Number.parseFloat(marketPrice.toString()) / 1e18
  return Number.isFinite(priceNumber) ? priceNumber : null
}

const pricePrecision = ref(derivePrecisionFromPrice(getStoredMarketPrice(selectedMarket.value)))

const gainsPrice24h = useGainsPrice24h()
const muxV3Price24h = useMuxV3Price24h()
const fourMemePrice24h = useFourMemePrice24h()
const { price: bnbUsdPrice } = useBnbUsdPrice()

const showChart = ref(false)
const widget = ref<Widget | null>(null)
const dataResolution = ref(5)

// Initialize chart positions and orders compositions
useChartPositions(selectedMarket, widget)
useChartOrders(selectedMarket, widget)

const latestBarData = ref<{
  chartSymbol: string | undefined
  bar: Bar | undefined
  isFetching: boolean
  fetchCount: number
}>({
  chartSymbol: undefined,
  bar: undefined,
  isFetching: false,
  fetchCount: 0
})

const maxGetLatestBarCount = 3

const updateRealtimePriceTimer = ref<number | null>(null)

let realtimePricesScope: {
  symbol: string
  scope: EffectScope | null
} = {
  symbol: '',
  scope: null
}
let waitForBnbPriceStop: WatchStopHandle | null = null

function clearUpdateRealtimePriceTimer() {
  if (updateRealtimePriceTimer.value) {
    clearInterval(updateRealtimePriceTimer.value)
    updateRealtimePriceTimer.value = null
  }
}

function maybeUpdatePrecisionFromPrice(price: number) {
  const newPrecision = derivePrecisionFromPrice(price)
  if (newPrecision !== pricePrecision.value) {
    pricePrecision.value = newPrecision
    widget.value?.updatePricePrecision(newPrecision, selectedMarket.value)
  }
}

function initChartWidget() {
  showChart.value = false
  pricePrecision.value = derivePrecisionFromPrice(getStoredMarketPrice(selectedMarket.value))
  
  try {
    if (widget.value) {
      widget.value.onDestroyed()
      widget.value = null
    }

    stopRealtimePriceUpdates()

    latestBarData.value = {
      chartSymbol: undefined,
      bar: undefined,
      isFetching: false,
        fetchCount: 0,
    }

    widget.value = markRaw(new Widget(pricePrecision.value))
    

    widget.value.setCandlesGetter(
      async (
        _symbolInfo: any,
        resolution: number,
        from: number,
        to: number,
        _firstDataRequest: boolean,
        onResult: Function,
        onError: Function
      ) => {
        try {
          const candles = await fetchOracleCandles(
            resolution,
            from,
            to,
            selectedMarket.value,
            selectedOracle.value
          )
          
          // Only update latestBarData if this is current/latest data (to is close to now)
          // Don't update it for historical data requests to avoid wrong bar updates
          const now = Math.ceil(Date.now() / 1000)
          const isCurrentData = to >= now - resolution * 60 * 2 // Within 2 resolution periods of now
          
          if (candles.length > 0 && isCurrentData) {
            // Find the bar with maximum time (latest bar) - matching mux-fe logic
            const latestBar = candles.reduce((max, current) => (current.time > max.time ? current : max), candles[0])

            if (!latestBar.close || isNaN(latestBar.close) || latestBar.close <= 0) {
              onResult(candles, { noData: candles.length === 0 })
              return
            }
            
            latestBarData.value = {
              chartSymbol: selectedMarket.value,
              bar: latestBar,
              isFetching: false,
              fetchCount: 0,
            }
            
            let change24hRate = 0
            if (selectedOracle.value === ProjectId.FOUR_MEME) {
              const market = getFourMemeMarket(selectedMarket.value)
              if (market) {
                change24hRate = fourMemePrice24h.calculate24hChangeRate(latestBar.close, market.tokenId)
              }
            } else if (selectedOracle.value === ProjectId.GAINS) {
              change24hRate = gainsPrice24h.calculate24hChangeRate(latestBar.close, selectedMarket.value)
            } else {
              const symbolName = selectedMarket.value.split('/')[0]
              change24hRate = muxV3Price24h.calculate24hChangeRate(latestBar.close, symbolName)
            }

            maybeUpdatePrecisionFromPrice(latestBar.close)
            tradeStore.setCurrentPrice(latestBar.close, change24hRate)
          }
          
          onResult(candles, { noData: candles.length === 0 })
        } catch (e) {
          console.error('Error fetching oracle candles:', {
            error: e,
            oracle: selectedOracle.value,
            market: selectedMarket.value
          })
          onError(e)
        }
      },
      () => {}
    )
    
    widget.value.onChartReady = () => {
      showChart.value = true
      const resolution = widget.value?.tvWidget?.activeChart().resolution()
      dataResolution.value = convertResolutionStrToNum(resolution ?? '5')
      
      widget.value?.tvWidget
        ?.activeChart()
        .onIntervalChanged()
        .subscribe(null, (interval: string) => {
          dataResolution.value = convertResolutionStrToNum(interval)
          latestBarData.value = {
            chartSymbol: undefined,
            bar: undefined,
            isFetching: false,
            fetchCount: 0,
          }
        })
      
      startRealtimePriceUpdates(selectedOracle.value, selectedMarket.value)
    }
    
    widget.value.init(
      'TV-chart',
      selectedMarket.value,
      'en',
      'Etc/UTC',
      '5'
    )
  } catch (e) {
    console.error('Failed to initialize chart:', e)
  }
}

function initChartWidgetWhenReady() {
  if (waitForBnbPriceStop) {
    waitForBnbPriceStop()
    waitForBnbPriceStop = null
  }

  if (selectedOracle.value === ProjectId.FOUR_MEME) {
    const bnbPrice = bnbUsdPrice.value
    if (!bnbPrice || bnbPrice <= 0) {
      waitForBnbPriceStop = watch(bnbUsdPrice, (val) => {
        if (val && val > 0) {
          waitForBnbPriceStop?.()
          waitForBnbPriceStop = null
          initChartWidget()
        }
      })
      return
    }
  }

  initChartWidget()
}

function buildCandle(
  price: number,
  resolution: number,
  chartSymbol: string,
  timestamp?: number
): Bar | undefined {
  if (
    !latestBarData.value.bar &&
    !latestBarData.value.isFetching &&
    latestBarData.value.fetchCount < maxGetLatestBarCount
  ) {
    getLatestCandleBarData(resolution, chartSymbol).then(() => {})
  }

  if (latestBarData.value.isFetching) {
    return undefined
  }

  const newPrice = price
  const newTime = alignTimeToResolution(resolution, timestamp)
  const lastBarData = latestBarData.value

  if (lastBarData.chartSymbol && lastBarData.chartSymbol === chartSymbol && lastBarData.bar) {
    if (newTime < lastBarData.bar.time) {
      return undefined
    }
    
    const barData = {
      ...lastBarData.bar,
      time: newTime,
    }
    
    if (newTime === lastBarData.bar.time) {
      barData.close = newPrice
      barData.low = Math.min(lastBarData.bar.low, newPrice)
      barData.high = Math.max(lastBarData.bar.high, newPrice)
    } else {
      barData.open = lastBarData.bar.close
      barData.low = Math.min(barData.open, newPrice)
      barData.high = Math.max(barData.open, newPrice)
      barData.close = newPrice
    }
    
    latestBarData.value = {
      ...lastBarData,
      bar: barData
    }
    
    return barData
  }
  
  return undefined
}

async function getLatestCandleBarData(resolution: number, chartSymbol: string) {
  latestBarData.value = {
    ...latestBarData.value,
    isFetching: true,
  }
  
  let bar: Bar | undefined = undefined
  
  try {
    const to = Math.ceil(Date.now() / 1000)
    const from = to - resolution * 60 * 4
    
    const candles = await fetchOracleCandles(resolution, from, to, chartSymbol, selectedOracle.value)
    
    if (candles.length > 0) {
      // Find the bar with maximum time (latest bar) - matching mux-fe logic
      bar = candles.reduce((max, current) => (current.time > max.time ? current : max), candles[0])
    }
  } catch (error) {
    console.error('[PriceChart] getLatestCandleBarData: Failed to fetch latest candle bar:', error)
  }
  
  latestBarData.value = {
    chartSymbol: chartSymbol,
    bar: bar,
    isFetching: false,
    fetchCount: latestBarData.value.fetchCount + 1,
  }
}

function useMuxV3RealtimePrices(chartSymbol: string) {
  clearUpdateRealtimePriceTimer()
  
  const marketSymbol = chartSymbol.split('/')[0]
  const symbolRef = ref(chartSymbol)
  const { priceInfo } = useMuxRealtimePrice(symbolRef, 200)

  const price = computedEager(() => {
    if (!priceInfo.value || !priceInfo.value[0] || !priceInfo.value[1]) {
      return null
    }
    return `${priceInfo.value[0]}-${priceInfo.value[1]}`
  })

  updateRealtimePriceTimer.value = window.setInterval(() => {
    if (!!price.value) {
      const [newPrice, newPriceTime] = price.value.split('-')
      const timestamp = Number(newPriceTime)
      
      updateRealtimePrice(newPrice, dataResolution.value, chartSymbol, ProjectId.MUX_V3, timestamp)
      
      const priceNum = parseFloat(newPrice)
      const change24hRate = muxV3Price24h.calculate24hChangeRate(priceNum, marketSymbol)
      maybeUpdatePrecisionFromPrice(priceNum)
      tradeStore.setCurrentPrice(priceNum, change24hRate)
    }
  }, 300)
}

function useGainsRealtimePrices(chartSymbol: string) {
  clearUpdateRealtimePriceTimer()
  
  const pairIndex = GAINS_PAIR_INDEX_MAP[chartSymbol]
  if (pairIndex === undefined || pairIndex === null) {
    console.error(`GTrade: No pair index found for ${chartSymbol}`)
    console.error('GTrade: Available pairs:', Object.keys(GAINS_PAIR_INDEX_MAP))
    return
  }
  
  const pairIndexRef = ref(pairIndex)
  const { price } = useGainsWebSocketPrice(pairIndexRef, 200)

  updateRealtimePriceTimer.value = window.setInterval(() => {
    if (!!price.value) {
      const priceStr = price.value.toFixed ? price.value.toFixed() : price.value.toString()
  
      
      updateRealtimePrice(priceStr, dataResolution.value, chartSymbol, ProjectId.GAINS)
      
      const priceNum = typeof price.value === 'number' ? price.value : parseFloat(priceStr)
      const change24hRate = gainsPrice24h.calculate24hChangeRate(priceNum, chartSymbol)
      maybeUpdatePrecisionFromPrice(priceNum)
      tradeStore.setCurrentPrice(priceNum, change24hRate)
    }
  }, 300)
}

function useFourMemeRealtimePrices(chartSymbol: string) {
  clearUpdateRealtimePriceTimer()
  
  const market = getFourMemeMarket(chartSymbol)
  if (!market) {
    console.error(`Four.meme: Market not found for ${chartSymbol}`)
    return
  }
  
  const marketRef = ref(market)
  const { price } = useFourMemeWebSocketPrice(marketRef, 200)

  updateRealtimePriceTimer.value = window.setInterval(() => {
    if (!!price.value) {
      const priceStr = typeof price.value === 'number' ? price.value.toString() : price.value
      
      updateRealtimePrice(priceStr, dataResolution.value, chartSymbol, ProjectId.FOUR_MEME)
      
      const priceNum = typeof price.value === 'number' ? price.value : parseFloat(priceStr)
      const change24hRate = fourMemePrice24h.calculate24hChangeRate(priceNum, market.tokenId)
      maybeUpdatePrecisionFromPrice(priceNum)
      tradeStore.setCurrentPrice(priceNum, change24hRate)
    }
  }, 300)
}

function updateRealtimePrice(
  price: string | number,
  resolution: number,
  chartSymbol: string,
  projectId: ProjectId,
  timestamp?: number
) {
  if (!widget.value || !widget.value.tvWidget || !!latestBarData.value?.isFetching) {
    return
  }

  
  const bar = buildCandle(Number(price), resolution, chartSymbol, timestamp)
  
  if (bar && widget.value) {
    try {
      widget.value.updateRealtimePrice(bar, chartSymbol)
    } catch (e) {
      console.warn('[PriceChart] updateRealtimePrice: Error updating chart', e, { bar, chartSymbol })
    }
  }
}

function startRealtimePriceUpdates(projectId: ProjectId, chartSymbol: string) {
  if (realtimePricesScope.scope) {
    realtimePricesScope.scope.stop()
    clearUpdateRealtimePriceTimer()
  }
  
  realtimePricesScope = {
    symbol: chartSymbol,
    scope: effectScope()
  }
  
  if (realtimePricesScope.scope) {
    realtimePricesScope.scope.run(() => {
      if (projectId === ProjectId.FOUR_MEME) {
        useFourMemeRealtimePrices(chartSymbol)
      } else if (projectId === ProjectId.MUX_V3) {
        useMuxV3RealtimePrices(chartSymbol)
      } else if (projectId === ProjectId.GAINS) {
        useGainsRealtimePrices(chartSymbol)
      }
    })
  } else {
    console.error('❌ No realtimePricesScope.scope available!')
  }
}

function stopRealtimePriceUpdates() {
  if (realtimePricesScope.scope) {
    realtimePricesScope.scope.stop()
    realtimePricesScope = { symbol: '', scope: null }
  }
  clearUpdateRealtimePriceTimer()
}

watch(selectedMarket, (newMarket, oldMarket) => {
  if (newMarket !== oldMarket && widget.value?.tvWidget) {
    pricePrecision.value = derivePrecisionFromPrice(getStoredMarketPrice(newMarket))
    widget.value?.updatePricePrecision(pricePrecision.value, newMarket)

    widget.value.onMarketChanged(newMarket, () => {
      latestBarData.value = {
        chartSymbol: undefined,
        bar: undefined,
        isFetching: false,
        fetchCount: 0,
      }
    })
    
    stopRealtimePriceUpdates()
    startRealtimePriceUpdates(selectedOracle.value, newMarket)
  }
})

watch(
  bnbUsdPrice,
  (newPrice, oldPrice) => {
    if (
      selectedOracle.value === ProjectId.FOUR_MEME &&
      (!oldPrice || oldPrice <= 0) &&
      newPrice &&
      newPrice > 0
    ) {
      const market = getFourMemeMarket(selectedMarket.value)
      if (market) {
        fourMemePrice24h.fetchPrice24hAgo(market)
      }
    }
  }
)

onMounted(() => {
  if (selectedOracle.value === ProjectId.FOUR_MEME) {
    muxV3Price24h.stopAutoRefresh()
    gainsPrice24h.stopAutoRefresh()
    const market = getFourMemeMarket(selectedMarket.value)
    if (market && bnbUsdPrice.value && bnbUsdPrice.value > 0) {
      fourMemePrice24h.fetchPrice24hAgo(market)
    }
  } else if (selectedOracle.value === ProjectId.GAINS) {
    muxV3Price24h.stopAutoRefresh()
    fourMemePrice24h.stopAutoRefresh()
    gainsPrice24h.startAutoRefresh()
  } else if (selectedOracle.value === ProjectId.MUX_V3) {
    gainsPrice24h.stopAutoRefresh()
    fourMemePrice24h.stopAutoRefresh()
    const symbolName = selectedMarket.value.split('/')[0]
    muxV3Price24h.startAutoRefresh([symbolName])
  }
  
  setTimeout(() => {
    initChartWidgetWhenReady()
  }, 100)
})

onUnmounted(() => {
  stopRealtimePriceUpdates()
  gainsPrice24h.stopAutoRefresh()
  muxV3Price24h.stopAutoRefresh()
  fourMemePrice24h.stopAutoRefresh()
  if (waitForBnbPriceStop) {
    waitForBnbPriceStop()
    waitForBnbPriceStop = null
  }
  
  if (widget.value) {
    widget.value.onDestroyed()
  }
})

watch(selectedMarket, (newMarket) => {
  if (selectedOracle.value === ProjectId.GAINS) {
    muxV3Price24h.stopAutoRefresh()
    gainsPrice24h.startAutoRefresh()
  } else if (selectedOracle.value === ProjectId.MUX_V3) {
    gainsPrice24h.stopAutoRefresh()
    const symbolName = newMarket.split('/')[0]
    muxV3Price24h.startAutoRefresh([symbolName])
  } else {
    gainsPrice24h.stopAutoRefresh()
    muxV3Price24h.stopAutoRefresh()
  }
})

watch(selectedOracle, (newOracle, oldOracle) => {
  if (newOracle !== oldOracle) {
    pricePrecision.value = derivePrecisionFromPrice(getStoredMarketPrice(selectedMarket.value))
    widget.value?.updatePricePrecision(pricePrecision.value, selectedMarket.value)

    if (oldOracle === ProjectId.GAINS) {
      gainsPrice24h.stopAutoRefresh()
    } else if (oldOracle === ProjectId.MUX_V3) {
      muxV3Price24h.stopAutoRefresh()
    }
    
    stopRealtimePriceUpdates()
    
    latestBarData.value = {
      chartSymbol: undefined,
      bar: undefined,
      isFetching: false,
      fetchCount: 0,
    }
    
    if (newOracle === ProjectId.GAINS) {
      gainsPrice24h.startAutoRefresh()
    } else if (newOracle === ProjectId.MUX_V3) {
      const symbolName = selectedMarket.value.split('/')[0]
      muxV3Price24h.startAutoRefresh([symbolName])
    } else if (newOracle === ProjectId.FOUR_MEME) {
      gainsPrice24h.stopAutoRefresh()
      muxV3Price24h.stopAutoRefresh()
      const market = getFourMemeMarket(selectedMarket.value)
      if (market && bnbUsdPrice.value && bnbUsdPrice.value > 0) {
        fourMemePrice24h.fetchPrice24hAgo(market)
      }
    }
    
    if (widget.value?.tvWidget) {
      widget.value.onDestroyed()
      widget.value = null
      
      setTimeout(() => {
        if (selectedMarket.value) {
          initChartWidgetWhenReady()
        }
      }, 300)
    } else if (selectedMarket.value) {
      initChartWidgetWhenReady()
    }
  }
})
</script>

<style scoped>
.price-chart {
  height: 100%;
  border-top: 1px solid #1D1D1D;
}
</style>
