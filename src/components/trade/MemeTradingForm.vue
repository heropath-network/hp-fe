<template>
  <div class="meme-trade-form relative flex h-full flex-col bg-gray-800 w-[343px]">
    <!-- Header Section -->
    <div class="flex items-center gap-4 px-4 pt-3 pb-2">
      <div class="flex items-center gap-4">
        <!-- Buy/Long and Sell/Short Tabs -->
        <div class="flex bg-[#272727]">
          <button
            @click="tradeSide = 'long'"
            :class="[
              'flex-1 px-0 py-2 text-sm font-medium transition w-[83px]',
              tradeSide === 'long'
                ? 'bg-green-success text-gray-1000 hover:bg-green-hover'
                : 'text-gray-400'
            ]"
          >
            Buy / Long
          </button>
          <button
            @click="tradeSide = 'short'"
            :class="[
              'flex-1 px-0 py-2 text-sm font-medium transition w-[83px]',
              tradeSide === 'short'
                ? 'bg-red-error text-gray-1000 hover:bg-red-hover'
                : 'text-gray-400'
            ]"
          >
            Sell / Short
          </button>
        </div>
      </div>
    </div>

    <!-- Divider Line -->
    <div class="h-px w-full bg-[#272727]"></div>

    <!-- Main Content -->
    <div class="flex-1 px-4 pt-4 flex flex-col gap-4">
      <div class="text-white text-center py-8">
        <p class="text-lg font-semibold mb-2">Meme Market Trading</p>
        <p class="text-sm text-gray-400">Trading form for meme markets</p>
        <p class="text-xs text-gray-500 mt-4">Selected Market: {{ selectedMarket }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTradeStore } from '@/stores/tradeStore'

const tradeStore = useTradeStore()
const { selectedMarket } = storeToRefs(tradeStore)

const tradeSide = ref<'long' | 'short'>('long')
</script>

<style scoped>
.meme-trade-form {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

