<template>
  <div class="relative flex h-full w-full flex-col bg-gray-950">
    <!-- Loading State -->
    <div v-if="!showChart" class="absolute inset-0 flex items-center justify-center bg-gray-950">
      <div class="text-center">
        <div class="mb-2 text-sm text-gray-400">Loading chart...</div>
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-600 mx-auto"></div>
      </div>
    </div>

    <!-- TradingView Chart Container -->
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
import { useMuxPrice24h, useMuxRealtimePrice } from '@/packages/mux-v3'
import { ProjectId } from '@/constants'
import type { Bar } from '@/types/tradingview'

const tradeStore = useTradeStore()

const selectedMarket = computed(() => tradeStore.selectedMarket)
const selectedOracle = computed(() => tradeStore.selectedOracle)

const gainsPrice24h = useGainsPrice24h()
const muxPrice24h = useMuxPrice24h()

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

const maxGetLatestBarCount = 3 // Max retry attempts to fetch latest bar

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

    widget.value = markRaw(new Widget(2)) // 2 decimal places
    

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
              change24hRate = muxPrice24h.calculate24hChangeRate(latestBar.close, symbolName)
            }

            // Update store with both price and change24h
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
      
      // Subscribe to resolution changes
      widget.value?.tvWidget
        ?.activeChart()
        .onIntervalChanged()
        .subscribe(null, (interval: string) => {
          dataResolution.value = convertResolutionStrToNum(interval)
          // Reset latestBarData for new resolution
          latestBarData.value = {
            chartSymbol: undefined,
            bar: undefined,
            isFetching: false,
            fetchCount: 0,
          }
        })
      
      // Start real-time price updates with oracle-specific logic
      startRealtimePriceUpdates(selectedOracle.value, selectedMarket.value)
    }
    
    // Initialize the chart AFTER setting up the data fetcher
    widget.value.init(
      'TV-chart',
      selectedMarket.value,
      'en',
      'Etc/UTC',
      '5' // default 5min resolution
    )
  } catch (e) {
    console.error('Failed to initialize chart:', e)
  }
}

/**
 * Build candle bar for TradingView chart (following mux-fe pattern)
 */
function buildCandle(
  price: number,
  resolution: number,
  chartSymbol: string,
  timestamp?: number
): Bar | undefined {
  // If no latest bar and not currently fetching, try to fetch it
  if (
    !latestBarData.value.bar &&
    !latestBarData.value.isFetching &&
    latestBarData.value.fetchCount < maxGetLatestBarCount
  ) {
    getLatestCandleBarData(resolution, chartSymbol).then(() => {})
    return undefined
  }

  // Don't update while fetching
  if (latestBarData.value.isFetching) {
    return undefined
  }

  const newPrice = price
  const newTime = alignTimeToResolution(resolution, timestamp)
  const lastBarData = latestBarData.value

  // Validate chartSymbol matches and bar exists
  if (lastBarData.chartSymbol && lastBarData.chartSymbol === chartSymbol && lastBarData.bar) {
    const resolutionMs = resolution * 60 * 1000
    const lastBarTime = lastBarData.bar.time
    
    // Ensure newTime is not in the past (should be >= last bar time)
    if (newTime < lastBarTime) {
      return undefined
    }
    
    // Calculate the current expected bar time (current time aligned to resolution)
    const currentAlignedTime = alignTimeToResolution(resolution)
    
    // Only allow updating the current bar or the immediate next bar
    // This prevents sending bars that are too far ahead, which causes TradingView errors
    const allowedMaxTime = Math.max(currentAlignedTime, lastBarTime + resolutionMs)
    
    if (newTime > allowedMaxTime) {
      return undefined
    }
    
    const barData = {
      ...lastBarData.bar,
      time: newTime,
    }
    
    if (newTime === lastBarTime) {
      // Update existing bar (same candle period)
      barData.close = newPrice
      barData.low = Math.min(lastBarData.bar.low, newPrice)
      barData.high = Math.max(lastBarData.bar.high, newPrice)
    } else {
      // New bar (new candle period) - must be exactly one period ahead
      const expectedNextTime = lastBarTime + resolutionMs
      
      // Only allow the immediate next period
      if (newTime !== expectedNextTime && newTime !== currentAlignedTime) {
        return undefined
      }
      
      barData.open = lastBarData.bar.close
      barData.low = Math.min(barData.open, newPrice)
      barData.high = Math.max(barData.open, newPrice)
      barData.close = newPrice
    }
    
    // Update latestBarData
    latestBarData.value = {
      ...lastBarData,
      bar: barData
    }
    
    return barData
  }
  
  return undefined
}

async function getLatestCandleBarData(resolution: number, chartSymbol: string) {
  // Set fetching state
  latestBarData.value = {
    ...latestBarData.value,
    isFetching: true,
  }
  
  let bar: Bar | undefined = undefined
  
  try {
    // Fetch the most recent candles from oracle
    const now = Math.floor(Date.now() / 1000)
    const from = now - resolution * 60 * 4 // Last 4 candle periods
    
    const candles = await fetchOracleCandles(resolution, from, now, chartSymbol, selectedOracle.value)
    
    if (candles.length > 0) {
      bar = candles[candles.length - 1]
    }
  } catch (error) {
    console.error('Failed to fetch latest candle bar:', error)
  }
  
  // Update latestBarData with all fields
  latestBarData.value = {
    chartSymbol: chartSymbol,
    bar: bar,
    isFetching: false,
    fetchCount: latestBarData.value.fetchCount + 1,
  }
}

/**
 * MUX V3 realtime price watcher (following mux-fe pattern)
 */
function useMuxV3RealtimePrices(chartSymbol: string) {
  clearUpdateRealtimePriceTimer()
  
  const marketSymbol = chartSymbol.split('/')[0] // BTC/USD -> BTC
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
      
      // Update chart with resolution
      updateRealtimePrice(priceNum, dataResolution.value, chartSymbol, timestamp)
      
      // Calculate 24h change and update store
      const change24hRate = muxPrice24h.calculate24hChangeRate(priceNum, marketSymbol)
      tradeStore.setCurrentPrice(priceNum, change24hRate)
    }
  }, 300)
}

/**
 * GTrade realtime price watcher (following mux-fe pattern)
 */
function useGainsRealtimePrices(chartSymbol: string) {
  clearUpdateRealtimePriceTimer()
  
  const pairIndex = GAINS_PAIR_INDEX_MAP[chartSymbol]
  // Check for undefined/null, but allow 0 (BTC is pair index 0!)
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
    
      
      // Update chart with resolution (GTrade uses current timestamp)
      updateRealtimePrice(priceNum, dataResolution.value, chartSymbol)
      
      // Calculate 24h change and update store
      const change24hRate = gainsPrice24h.calculate24hChangeRate(priceNum, chartSymbol)
      tradeStore.setCurrentPrice(priceNum, change24hRate)
    }
  }, 300)
}

/**
 * Update chart with realtime price (following mux-fe pattern)
 */
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
      // Silently handle realtime price update errors
    }
  }
}

/**
 * Start realtime price updates based on oracle type (following mux-fe pattern)
 */
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

// Watch for market changes
watch(selectedMarket, (newMarket, oldMarket) => {
  if (newMarket !== oldMarket && widget.value?.tvWidget) {
    widget.value.onMarketChanged(newMarket, () => {
      // Reset latestBarData for new market
      latestBarData.value = {
        chartSymbol: undefined,
        bar: undefined,
        isFetching: false,
        fetchCount: 0,
      }
    })
    
    // Restart realtime updates for new market
    stopRealtimePriceUpdates()
    startRealtimePriceUpdates(selectedOracle.value, newMarket)
  }
})

onMounted(() => {
  // Start auto-refresh of 24h ago prices only for selected oracle
  // Stop the other oracle's fetching first
  if (selectedOracle.value === ProjectId.GAINS) {
    muxPrice24h.stopAutoRefresh() // Stop MUX fetching
    gainsPrice24h.startAutoRefresh() // Start GTrade fetching
  } else if (selectedOracle.value === ProjectId.MUX_V3) {
    gainsPrice24h.stopAutoRefresh() // Stop GTrade fetching
    const symbolName = selectedMarket.value.split('/')[0]
    muxPrice24h.startAutoRefresh([symbolName]) // Start MUX fetching
  }
  
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initChartWidget()
  }, 100)
})

onUnmounted(() => {
  stopRealtimePriceUpdates()
  gainsPrice24h.stopAutoRefresh()
  muxPrice24h.stopAutoRefresh()
  
  if (widget.value) {
    widget.value.onDestroyed()
  }
})

// Watch for market changes and update 24h ago price symbols
watch(selectedMarket, (newMarket) => {
  // Only update if the oracle is selected
  if (selectedOracle.value === ProjectId.GAINS) {
    // GTrade: already fetches all prices, no need to update
    // But make sure MUX is stopped
    muxPrice24h.stopAutoRefresh()
    gainsPrice24h.startAutoRefresh()
  } else if (selectedOracle.value === ProjectId.MUX_V3) {
    // MUX V3: update specific symbol
    // But make sure GTrade is stopped
    gainsPrice24h.stopAutoRefresh()
    const symbolName = newMarket.split('/')[0]
    muxPrice24h.startAutoRefresh([symbolName])
  } else {
    // No oracle selected, stop both
    gainsPrice24h.stopAutoRefresh()
    muxPrice24h.stopAutoRefresh()
  }
})

// Watch for oracle changes and restart price updates
watch(selectedOracle, (newOracle, oldOracle) => {
  if (newOracle !== oldOracle) {
    // Stop fetching for the old oracle
    if (oldOracle === ProjectId.GAINS) {
      gainsPrice24h.stopAutoRefresh()
    } else if (oldOracle === ProjectId.MUX_V3) {
      muxPrice24h.stopAutoRefresh()
    }
    
    // Stop realtime price updates
    stopRealtimePriceUpdates()
    
    // Reset latestBarData completely to clear old oracle's data
    latestBarData.value = {
      chartSymbol: undefined,
      bar: undefined,
      isFetching: false,
      fetchCount: 0,
    }
    
    // Start fetching for the new oracle
    if (newOracle === ProjectId.GAINS) {
      gainsPrice24h.startAutoRefresh()
    } else if (newOracle === ProjectId.MUX_V3) {
      const symbolName = selectedMarket.value.split('/')[0]
      muxPrice24h.startAutoRefresh([symbolName])
    }
    
    // Reinitialize chart widget to force complete reload with new oracle data
    // This ensures old data is cleared and fresh data is loaded
    if (widget.value?.tvWidget) {
      // Destroy widget first, then wait a bit longer to ensure DOM is clean
      widget.value.onDestroyed()
      widget.value = null
      
      // Longer delay to ensure old widget is fully destroyed and DOM is ready
      setTimeout(() => {
        if (selectedMarket.value) {
          initChartWidget()
        }
      }, 300)
    } else if (selectedMarket.value) {
      // If widget doesn't exist yet, initialize it
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
