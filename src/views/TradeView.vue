<template>
  <div class="trade-view h-screen overflow-hidden bg-gray-950">
    <TradeStatistics @open-market-select="showMarketSelect = true" />

    <AccountInfo />

    <div class="grid h-[calc(100vh-108px)] grid-cols-[1fr_400px]">

      <div class="flex flex-col">
        <div class="h-[60%] border-r border-gray-800">
          <PriceChart />
        </div>

        <div class="h-[40%] border-r border-t border-gray-800">
          <PositionsAndOrders />
        </div>
      </div>

      <div class="overflow-hidden">
        <TradingForm />
      </div>
    </div>

    <MarketSelect :show="showMarketSelect" @close="showMarketSelect = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TradeStatistics from '@/components/trade/TradeStatistics.vue'
import AccountInfo from '@/components/trade/AccountInfo.vue'
import PriceChart from '@/components/trade/PriceChart.vue'
import TradingForm from '@/components/trade/TradingForm.vue'
import PositionsAndOrders from '@/components/trade/PositionsAndOrders.vue'
import MarketSelect from '@/components/trade/MarketSelect.vue'

const showMarketSelect = ref(false)
</script>

<style scoped>
.trade-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
