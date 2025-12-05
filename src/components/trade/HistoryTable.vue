<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-800">
          <tr class="text-xs text-gray-400">
            <th class="px-4 py-3 text-left font-medium">Time</th>
            <th class="px-4 py-3 text-left font-medium">Market</th>
            <th class="px-4 py-3 text-left font-medium">Operation</th>
            <th class="px-4 py-3 text-left font-medium">Side</th>
            <th class="px-4 py-3 text-left font-medium">Size</th>
            <th class="px-4 py-3 text-left font-medium">Amount</th>
            <th class="px-4 py-3 text-left font-medium">Fee</th>
            <!-- <th class="px-4 py-3 text-right font-medium">Exit Price</th> -->
            <th class="px-4 py-3 text-left font-medium">Realized PNL & ROE</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-if="history.length === 0">
            <td colspan="9" class="px-4 py-0">
              <div class="flex flex-col items-center justify-center gap-2 py-16">
                <img :src="noDataIcon" alt="No data" class="w-20 h-20" />
                <p class="text-sm text-[#9b9b9b] text-center">No Trade History</p>
              </div>
            </td>
          </tr>
          <HistoryRow
            v-for="trade in history"
            :key="trade.id"
            :trade="trade"
          />
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <!-- <div
      v-if="history.length > 0"
      class="mt-auto border-t border-gray-800 bg-gray-900 px-4 py-3"
    >
      <div class="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div class="text-xs text-gray-400">Total Trades</div>
          <div class="font-semibold text-white">{{ history.length }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-400">Win Rate</div>
          <div class="font-semibold text-white">{{ winRate }}%</div>
        </div>
        <div>
          <div class="text-xs text-gray-400">Total PnL</div>
          <div
            :class="[
              'font-semibold',
              totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
            ]"
          >
            {{ formatCurrency(totalPnL) }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-400">Avg PnL</div>
          <div
            :class="[
              'font-semibold',
              averagePnL >= 0 ? 'text-green-500' : 'text-red-500'
            ]"
          >
            {{ formatCurrency(averagePnL) }}
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatCurrency } from '@/utils/bigint'
import HistoryRow from './HistoryRow.vue'
import noDataIcon from '@/assets/img/no-data.svg'

const tradeStore = useTradeStore()

const history = computed(() => tradeStore.tradeHistory)

const totalPnL = computed(() => {
  return history.value.reduce((sum, trade) => sum + trade.pnl, BigInt(0))
})

const averagePnL = computed(() => {
  if (history.value.length === 0) return BigInt(0)
  return totalPnL.value / BigInt(history.value.length)
})

const winRate = computed(() => {
  if (history.value.length === 0) return 0
  const wins = history.value.filter(trade => trade.pnl > 0).length
  return ((wins / history.value.length) * 100).toFixed(1)
})
</script>

