<template>
  <div class="trade-view flex h-screen flex-col overflow-hidden bg-[var(--hp-bg-dark)]">
    <TradeHeader />
   
    <div class="flex flex-1 overflow-hidden">
      <div class="flex flex-1 flex-col border-r border-gray-800">

        <TradeStatistics @open-market-select="showMarketSelect = true" />

        <AccountInfo />

        <div class="flex-1 overflow-hidden">
          <PriceChart />
        </div>

        <!-- Positions and Orders -->
        <div class="h-[40%] border-t border-gray-800">
          <PositionsAndOrders />
        </div>
      </div>

      <!-- Right: Trading Form -->
      <div class="w-[343px] overflow-hidden border-l border-gray-800">
        <TradingForm />
      </div>
    </div>

    <MarketSelect :show="showMarketSelect" @close="showMarketSelect = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TradeHeader from '@/components/trade/TradeHeader.vue'
import TradeStatistics from '@/components/trade/TradeStatistics.vue'
import AccountInfo from '@/components/trade/AccountInfo.vue'
import PriceChart from '@/components/trade/PriceChart.vue'
import TradingForm from '@/components/trade/TradingForm.vue'
import PositionsAndOrders from '@/components/trade/PositionsAndOrders.vue'
import MarketSelect from '@/components/trade/MarketSelect.vue'
import { usePriceOrchestrator } from '@/composables/usePriceOrchestrator'

usePriceOrchestrator()

const showMarketSelect = ref(false)
</script>

<style scoped>
.trade-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
