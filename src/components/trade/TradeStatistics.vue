<template>
  <div class="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <button
          @click="$emit('openMarketSelect')"
          class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white transition hover:bg-gray-800"
        >
          <span class="text-lg font-semibold">{{ selectedMarket }}</span>
          <svg class="h-4 w-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
 
      <div class="h-8 w-px bg-gray-800"></div>

      <div class="flex flex-col">
        <div class="text-xs text-gray-400">Mark Price</div>
        <div class="flex items-baseline gap-2">
          <div
            v-if="isLoadingMarkPrice && !isMarketClosed"
            class="h-7 w-24 animate-pulse rounded bg-gray-700"
          ></div>
          <span
            v-else-if="isMarketClosed"
            class="text-xl font-semibold text-gray-400"
          >
            Closed
          </span>
          <span
            v-else
            class="text-xl font-semibold text-white"
          >
            ${{ formattedPrice }}
          </span>
          <span
            v-if="!isMarketClosed && !isLoadingPriceChange && !isLoadingMarkPrice"
            :class="[
              'text-sm font-medium',
              priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
            ]"
          >
            {{ priceChange24h >= 0 ? '+' : '' }}{{ priceChange24h.toFixed(2) }}%
          </span>
          <div
            v-else-if="!isMarketClosed && isLoadingPriceChange"
            class="h-4 w-12 animate-pulse rounded bg-gray-700"
          ></div>
        </div>
      </div>

      <div class="h-8 w-px bg-gray-800"></div>

      <!-- 24h High/Low -->
      <div class="flex gap-4">
        <div class="flex flex-col">
          <div class="text-xs text-gray-400">24h High</div>
          <div
            v-if="!isLoadingHighLow"
            class="text-sm font-medium text-white"
          >
            ${{ high24h }}
          </div>
          <div
            v-else
            class="h-4 w-16 animate-pulse rounded bg-gray-700"
          ></div>
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-gray-400">24h Low</div>
          <div
            v-if="!isLoadingHighLow"
            class="text-sm font-medium text-white"
          >
            ${{ low24h }}
          </div>
          <div
            v-else
            class="h-4 w-16 animate-pulse rounded bg-gray-700"
          ></div>
        </div>
      </div>
    </div>

    <OracleSelect
      :options="allOracleOptions"
      :selected-value="selectedOracleName"
      label="Chart Source"
      @select="handleOracleSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatPrice } from '@/utils/bigint'
import { useMarket24hRates } from '@/composables/useMarket24hRates'
import { usePrice24hHighLow } from '@/composables/usePrice24hHighLow'
import { useMarketStatus } from '@/composables/useMarketStatus'
import OracleSelect from './OracleSelect.vue'

const tradeStore = useTradeStore()
const marketStatus = useMarketStatus()

const selectedMarket = computed(() => tradeStore.selectedMarket)
const isMarketClosed = computed(() => marketStatus.checkMarketClosed(selectedMarket.value))
const oracleSources = computed(() => tradeStore.oracleSources)

const selectedOracleName = computed(() => tradeStore.currentOracleName)

const allOracleOptions = computed(() => {
  return oracleSources.value.map(oracle => {
    return {
      label: oracle,
      value: oracle,
      disabled: false
    }
  })
})

function handleOracleSelect(value: string) {
  tradeStore.setOracleByName(value)
}

const selectedOracleId = computed(() => tradeStore.selectedOracle)

const isLoadingMarkPrice = computed(() => {
  const marketPrice = tradeStore.marketPrices[selectedMarket.value]
  return !marketPrice
})

const formattedPrice = computed(() => {
  const price = tradeStore.currentMarketPrice
  return price ? formatPrice(price, 0) : '0'
})


const { rates: market24hRates, isLoading: isLoadingPriceChange } = useMarket24hRates(computed(() => [selectedMarket.value]), {
  autoRefresh: true,
  onMounted: true,
})

const priceChange24h = computed(() => {
  const market = selectedMarket.value
  if (!market) return 0
  return market24hRates.value[market] || 0
})

const price24hHighLowState = usePrice24hHighLow(selectedMarket, selectedOracleId)

const isLoadingHighLow = computed(() => price24hHighLowState.isLoading.value)

const high24h = computed(() => {
  const data = price24hHighLowState.data.value
  return data?.high ? formatPrice(data.high, 0) : formattedPrice.value
})

const low24h = computed(() => {
  const data = price24hHighLowState.data.value
  return data?.low ? formatPrice(data.low, 0) : formattedPrice.value
})


defineEmits(['openMarketSelect'])
</script>

