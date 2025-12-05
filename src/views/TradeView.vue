<template>
  <div class="trade-view flex h-screen flex-col bg-[var(--hp-bg-dark)]" :class="{ 'is-resizing': isResizing }">
    <TradeHeader />
   
    <div class="layout-container" 
      :style="{ 'grid-template-rows': `${statisticsChartHeight} 4px 1fr` }"
      @mousemove="onMouseMove($event)"
      @mouseup="onMouseUp">
      <div class="left-column flex flex-col border-r border-gray-800">
        <div class="statistics-container">
          <TradeStatistics @open-market-select="showMarketSelect = true" />
        </div>

        <div class="chart-container overflow-hidden">
          <PriceChart />
        </div>
      </div>

      <div class="resizer-line" @mousedown="onResizerLineMouseDown"></div>

      <!-- Positions and Orders -->
      <div class="position-order-container border-t border-gray-800">
        <PositionsAndOrders />
      </div>

      <!-- Right: Trading Form -->
      <div class="trading-form-container border-l border-gray-700">
        <MemeTradingForm v-if="isMemeMarket" />
        <TradingForm v-else />
      </div>
    </div>

    <MarketSelect :show="showMarketSelect" @close="showMarketSelect = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import TradeHeader from '@/components/trade/TradeHeader.vue'
import TradeStatistics from '@/components/trade/TradeStatistics.vue'
import PriceChart from '@/components/trade/PriceChart.vue'
import TradingForm from '@/components/trade/TradingForm.vue'
import MemeTradingForm from '@/components/trade/MemeTradingForm.vue'
import PositionsAndOrders from '@/components/trade/PositionsAndOrders.vue'
import MarketSelect from '@/components/trade/MarketSelect.vue'
import { usePriceOrchestrator } from '@/composables/usePriceOrchestrator'
import { useTradeStore } from '@/stores/tradeStore'
import { isMarketAvailableInFourMeme } from '@/utils/oracleMatching'

usePriceOrchestrator()

const tradeStore = useTradeStore()
const { selectedMarket } = storeToRefs(tradeStore)

const showMarketSelect = ref(false)

const isMemeMarket = computed(() => {
  return isMarketAvailableInFourMeme(selectedMarket.value)
})

const STATISTICS_CHART_HEIGHT = 'STATISTICS_CHART_HEIGHT'
const mainMinHeightRate = 55 // 55vh
const isResizing = ref(false)
const statisticsChartHeight = ref(localStorage.getItem(STATISTICS_CHART_HEIGHT) || '55vh')

function onMouseMove(event: MouseEvent) {
  if (!isResizing.value) {
    return
  }
  const scrollTop = document.documentElement.scrollTop
  const innerHeight = window.innerHeight
  // Use event.y if available (Vue might provide it), otherwise fallback to clientY
  const clientY = (event as any).y ?? event.clientY
  const statisticsChartMinHeight = (innerHeight * mainMinHeightRate) / 100
  let height = clientY - 65 + scrollTop // The height of header is 65px
  if (height < statisticsChartMinHeight) {
    height = statisticsChartMinHeight
  }
  statisticsChartHeight.value = height + 'px'
}

function onResizerLineMouseDown() {
  isResizing.value = true
}

function onMouseUp() {
  isResizing.value = false
  localStorage.setItem(STATISTICS_CHART_HEIGHT, statisticsChartHeight.value)
}
</script>

<style scoped>
.trade-view {
  .layout-container {
    display: grid;
    min-height: calc(100vh - 65px); /* Account for header height */
    grid-template-columns: 1fr minmax(343px, min(25%, 343px));
    grid-template-areas:
      'statistics-chart trading-form'
      'resizer trading-form'
      'position trading-form';

    .left-column {
      grid-area: statistics-chart;
      display: flex;
      flex-direction: column;
    }

    .statistics-container {
      flex-shrink: 0;
    }

    .chart-container {
      flex: 1;
      overflow: hidden;
    }

    .resizer-line {
      grid-area: resizer;
      width: 100%;
      height: 4px;
      cursor: ns-resize;
      background-color: transparent;

      &:hover {
        background-color: #272727;
      }
    }

    .position-order-container {
      grid-area: position;
    }

    .trading-form-container {
      grid-area: trading-form;
    }
  }

  &.is-resizing {
    user-select: none;
    -webkit-user-drag: none;

    .chart-container {
      pointer-events: none;
    }

    .resizer-line {
      background-color: var(--muxing-line-color-dark);
    }
  }
}
</style>