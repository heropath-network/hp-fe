<template>
  <div class="trade-view flex h-screen flex-col bg-[var(--hp-bg-dark)]">
    <TradeHeader />
   
    <div class="flex flex-1 ">
      <div class="flex flex-1 flex-col border-r border-gray-800">

        <TradeStatistics @open-market-select="showMarketSelect = true" />

        <div class="flex-1 overflow-hidden min-h-[50vh] max-h-[50vh]">
          <PriceChart />
        </div>

        <!-- Positions and Orders -->
        <div class="flex-1 border-t border-gray-800 max-h-[calc(100vh-300px)]">
          <PositionsAndOrders />
        </div>
      </div>

      <!-- Right: Trading Form -->
      <div class="w-[343px]  border-l border-gray-800">
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
</script>

<style scoped>
.trade-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
