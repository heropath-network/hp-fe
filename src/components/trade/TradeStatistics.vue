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
            v-if="isLoadingMarkPrice"
            class="h-7 w-24 animate-pulse rounded bg-gray-700"
          ></div>
          <span
            v-else
            class="text-xl font-semibold text-white"
          >
            ${{ formattedPrice }}
          </span>
          <span
            v-if="!isLoadingPriceChange && !isLoadingMarkPrice"
            :class="[
              'text-sm font-medium',
              priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
            ]"
          >
            {{ priceChange24h >= 0 ? '+' : '' }}{{ priceChange24h.toFixed(2) }}%
          </span>
          <div
            v-else-if="isLoadingPriceChange"
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

    <div class="flex items-center gap-3">
      <div class="text-xs text-gray-400">Oracle</div>
      <select
        v-model="selectedOracleName"
        class="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-sm text-white transition hover:border-gray-700 focus:border-blue-500 focus:outline-none"
      >
        <option v-for="oracle in oracleSources" :key="oracle" :value="oracle">
          {{ oracle }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatPrice } from '@/utils/bigint'
import { useMarketPrice24hRate } from '@/composables/useMarketPrice24h'
import { usePrice24hHighLow } from '@/composables/usePrice24hHighLow'

const tradeStore = useTradeStore()

const selectedMarket = computed(() => tradeStore.selectedMarket)
const oracleSources = computed(() => tradeStore.oracleSources)

const selectedOracleName = computed({
  get: () => tradeStore.currentOracleName,
  set: (value) => { tradeStore.setOracleByName(value) }
})

const selectedOracleId = computed(() => tradeStore.selectedOracle)

const isLoadingMarkPrice = computed(() => {
  const marketPrice = tradeStore.marketPrices[selectedMarket.value]
  return !marketPrice
})

const formattedPrice = computed(() => {
  const price = tradeStore.currentMarketPrice
  return price ? formatPrice(price, 0) : '0'
})

const price24hState = useMarketPrice24hRate(selectedMarket)

const isLoadingPriceChange = computed(() => price24hState.value.isLoading)

const priceChange24h = computed(() => {
  const rate = price24hState.value.price24hRate
  return rate !== null ? rate * 100 : 0
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

