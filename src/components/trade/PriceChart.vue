<template>
  <div class="relative flex h-full w-full flex-col bg-gray-950">
    <div v-if="!showChart" class="absolute inset-0 flex items-center justify-center bg-gray-950">
      <div class="text-center">
        <div class="mb-2 text-sm text-gray-400">Loading chart...</div>
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-600 mx-auto"></div>
      </div>
    </div>

    <div id="TV-chart" class="h-full w-full" :class="{ 'opacity-0': !showChart }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, markRaw, effectScope, type EffectScope } from 'vue'
import { computedEager } from '@vueuse/core'
import { useTradeStore } from '@/stores/tradeStore'
import Widget from './chart/widget'
import { convertResolutionStrToNum, alignTimeToResolution, fetchOracleCandles } from './chart/utils'
import { useGainsWebSocketPrice, useGainsPrice24h, GAINS_PAIR_INDEX_MAP } from '@/packages/gains'
import { useMuxV3Price24h, useMuxRealtimePrice } from '@/packages/mux-v3'
import { ProjectId } from '@/constants'
import type { Bar } from '@/types/tradingview'

const tradeStore = useTradeStore()

const selectedMarket = computed(() => tradeStore.selectedMarket)
const selectedOracle = computed(() => tradeStore.selectedOracle)

const gainsPrice24h = useGainsPrice24h()
const muxV3Price24h = useMuxV3Price24h()

const showChart = ref(false)
const widget = ref<Widget | null>(null)
const dataResolution = ref(5)

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

function clearUpdateRealtimePriceTimer() {
  if (updateRealtimePriceTimer.value) {
    clearInterval(updateRealtimePriceTimer.value)
    updateRealtimePriceTimer.value = null
  }
}

function initChartWidget() {
  showChart.value = false
  
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

    widget.value = markRaw(new Widget(2))
    

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
          

          if (candles.length > 0) {
            const latestBar = candles[candles.length - 1]

            if (!latestBar.close || isNaN(latestBar.close) || latestBar.close <= 0) {
              console.error('Invalid latestBar.close:', latestBar.close)
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
            if (selectedOracle.value === ProjectId.GAINS) {
              change24hRate = gainsPrice24h.calculate24hChangeRate(latestBar.close, selectedMarket.value)
            } else {
              const symbolName = selectedMarket.value.split('/')[0]
              change24hRate = muxV3Price24h.calculate24hChangeRate(latestBar.close, symbolName)
            }

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
    return undefined
  }

  if (latestBarData.value.isFetching) {
    return undefined
  }

  const newPrice = price
  const newTime = alignTimeToResolution(resolution, timestamp)
  const lastBarData = latestBarData.value

  if (lastBarData.chartSymbol && lastBarData.chartSymbol === chartSymbol && lastBarData.bar) {
    const resolutionMs = resolution * 60 * 1000
    const lastBarTime = lastBarData.bar.time
    
    if (newTime < lastBarTime) {
      return undefined
    }
    
    const currentAlignedTime = alignTimeToResolution(resolution)
    
    const allowedMaxTime = Math.max(currentAlignedTime, lastBarTime + resolutionMs)
    
    if (newTime > allowedMaxTime) {
      return undefined
    }
    
    const barData = {
      ...lastBarData.bar,
      time: newTime,
    }
    
    if (newTime === lastBarTime) {
      barData.close = newPrice
      barData.low = Math.min(lastBarData.bar.low, newPrice)
      barData.high = Math.max(lastBarData.bar.high, newPrice)
    } else {
      const expectedNextTime = lastBarTime + resolutionMs
      
      if (newTime !== expectedNextTime && newTime !== currentAlignedTime) {
        return undefined
      }
      
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
    const now = Math.floor(Date.now() / 1000)
    const from = now - resolution * 60 * 4
    
    const candles = await fetchOracleCandles(resolution, from, now, chartSymbol, selectedOracle.value)
    
    if (candles.length > 0) {
      bar = candles[candles.length - 1]
    }
  } catch (error) {
    console.error('Failed to fetch latest candle bar:', error)
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
    if (price.value) {
      const [newPrice, newPriceTime] = price.value.split('-')
      const priceNum = parseFloat(newPrice)
      const timestamp = Number(newPriceTime)
      
      updateRealtimePrice(priceNum, dataResolution.value, chartSymbol, timestamp)
      
      const change24hRate = muxV3Price24h.calculate24hChangeRate(priceNum, marketSymbol)
      tradeStore.setCurrentPrice(priceNum, change24hRate)
    }
  }, 1000)
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
    if (price.value) {
      const priceNum = price.value
    
      
      updateRealtimePrice(priceNum, dataResolution.value, chartSymbol)
      
      const change24hRate = gainsPrice24h.calculate24hChangeRate(priceNum, chartSymbol)
      tradeStore.setCurrentPrice(priceNum, change24hRate)
    }
  }, 1000)
}

function updateRealtimePrice(
  price: number,
  resolution: number,
  chartSymbol: string,
  timestamp?: number
) {
  if (!widget.value || !widget.value.tvWidget || latestBarData.value.isFetching) {
    return
  }
  
  const bar = buildCandle(price, resolution, chartSymbol, timestamp)
  
  if (bar && widget.value) {
    try {
      widget.value.updateRealtimePrice(bar, chartSymbol)
    } catch (e) { 
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
      if (projectId === ProjectId.MUX_V3) {
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

onMounted(() => {
  if (selectedOracle.value === ProjectId.GAINS) {
    muxV3Price24h.stopAutoRefresh()
    gainsPrice24h.startAutoRefresh()
  } else if (selectedOracle.value === ProjectId.MUX_V3) {
    gainsPrice24h.stopAutoRefresh()
    const symbolName = selectedMarket.value.split('/')[0]
    muxV3Price24h.startAutoRefresh([symbolName])
  }
  
  setTimeout(() => {
    initChartWidget()
  }, 100)
})

onUnmounted(() => {
  stopRealtimePriceUpdates()
  gainsPrice24h.stopAutoRefresh()
  muxV3Price24h.stopAutoRefresh()
  
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
    }
    
    if (widget.value?.tvWidget) {
      widget.value.onDestroyed()
      widget.value = null
      
      setTimeout(() => {
        if (selectedMarket.value) {
          initChartWidget()
        }
      }, 300)
    } else if (selectedMarket.value) {
      initChartWidget()
    }
  }
})
</script>

<style scoped>
.price-chart {
  height: 100%;
  border-top: 1px solid #1e263f;
}
</style>
