<template>
  <div class="border-b border-gray-800 bg-gray-900 px-4 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6 text-sm">
        <div>
          <span class="text-gray-400">Balance:</span>
          <span class="ml-2 font-semibold text-white">{{ formatCurrency(accountBalance) }}</span>
        </div>
        <div class="h-4 w-px bg-gray-700"></div>
        <div>
          <span class="text-gray-400">Total Position:</span>
          <span class="ml-2 font-semibold text-white">{{ formatCurrency(totalPositionValue) }}</span>
        </div>
        <div class="h-4 w-px bg-gray-700"></div>
        <div>
          <span class="text-gray-400">Unrealized PnL:</span>
          <span
            :class="[
              'ml-2 font-semibold',
              totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
            ]"
          >
            {{ formatCurrency(totalPnL) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="loadDemo"
          class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
        >
          Load Demo
        </button>
        <button
          @click="clearAll"
          class="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-600"
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatCurrency } from '@/utils/bigint'
import { useDemoData } from '@/composables/useDemoData'

const tradeStore = useTradeStore()
const { loadAllDemoData, clearAllData } = useDemoData()

const accountBalance = computed(() => tradeStore.accountBalance)
const totalPositionValue = computed(() => tradeStore.totalPositionValue)
const totalPnL = computed(() => tradeStore.totalPnL)

function loadDemo() {
  clearAllData()
  loadAllDemoData()
}

function clearAll() {
  if (confirm('Are you sure you want to clear all positions, orders, and history?')) {
    clearAllData()
  }
}
</script>

