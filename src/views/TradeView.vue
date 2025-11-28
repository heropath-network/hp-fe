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

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showMarketSelect"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          @click.self="showMarketSelect = false"
        >
          <div class="w-full max-w-md rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">Select Market</h3>
              <button
                @click="showMarketSelect = false"
                class="text-gray-400 transition hover:text-white"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-2">
              <button
                v-for="market in availableMarkets"
                :key="market"
                @click="selectMarket(market)"
                :class="[
                  'w-full rounded-lg border px-4 py-3 text-left transition',
                  selectedMarket === market
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-900'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ market }}</span>
                  <span
                    v-if="marketPrices[market]"
                    :class="[
                      'text-sm',
                      marketPrices[market].change24h >= 0 ? 'text-green-500' : 'text-red-500'
                    ]"
                  >
                    {{ marketPrices[market].change24h >= 0 ? '+' : '' }}
                    {{ marketPrices[market].change24h.toFixed(2) }}%
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import TradeStatistics from '@/components/trade/TradeStatistics.vue'
import AccountInfo from '@/components/trade/AccountInfo.vue'
import PriceChart from '@/components/trade/PriceChart.vue'
import TradingForm from '@/components/trade/TradingForm.vue'
import PositionsAndOrders from '@/components/trade/PositionsAndOrders.vue'

const tradeStore = useTradeStore()
const showMarketSelect = ref(false)

const selectedMarket = computed(() => tradeStore.selectedMarket)
const marketPrices = computed(() => tradeStore.marketPrices)

const availableMarkets = computed(() => ['BTC/USD', 'ETH/USD', 'ARB/USD', 'AVAX/USD', 'MATIC/USD', 'OP/USD'])

function selectMarket(market: string) {
  tradeStore.selectedMarket = market
  showMarketSelect.value = false
}
</script>

<style scoped>
.trade-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
