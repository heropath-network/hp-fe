<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-800">
          <tr class="text-xs text-gray-400">
            <th class="px-4 py-3 text-left font-medium">Market</th>
            <th class="px-4 py-3 text-left font-medium">Side</th>
            <th class="px-4 py-3 text-right font-medium">Size</th>
            <th class="px-4 py-3 text-right font-medium">Entry Price</th>
            <th class="px-4 py-3 text-right font-medium">Exit Price</th>
            <th class="px-4 py-3 text-right font-medium">PnL</th>
            <th class="px-4 py-3 text-left font-medium">Opened</th>
            <th class="px-4 py-3 text-left font-medium">Closed</th>
            <th class="px-4 py-3 text-right font-medium">Duration</th>
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
          <tr
            v-for="trade in history"
            :key="trade.id"
            class="transition hover:bg-gray-900/50"
          >
            <td class="px-4 py-3">
              <div class="font-medium text-white">{{ trade.market }}</div>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-block rounded px-2 py-0.5 text-xs font-semibold',
                  trade.side === 'long'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
                ]"
              >
                {{ trade.side.toUpperCase() }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-white">
              {{ formatNumber(trade.size, 4) }}
            </td>
            <td class="px-4 py-3 text-right text-white">
              ${{ formatNumber(trade.entryPrice, 2) }}
            </td>
            <td class="px-4 py-3 text-right text-white">
              ${{ formatNumber(trade.exitPrice, 2) }}
            </td>
            <td class="px-4 py-3 text-right">
              <div
                :class="[
                  'font-semibold',
                  trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                ]"
              >
                {{ formatCurrency(trade.pnl) }}
              </div>
              <div
                :class="[
                  'text-xs',
                  trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                ]"
              >
                {{ formatPercentage(getPnLPercent(trade)) }}
              </div>
            </td>
            <td class="px-4 py-3 text-gray-400">
              {{ formatDate(trade.timestamp) }}
            </td>
            <td class="px-4 py-3 text-gray-400">
              {{ formatDate(trade.closeTimestamp) }}
            </td>
            <td class="px-4 py-3 text-right text-gray-400">
              {{ formatDuration(trade.timestamp, trade.closeTimestamp) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <div
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/bigint'
import type { TradeHistory } from '@/stores/tradeStore'
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

function getPnLPercent(trade: TradeHistory): number {
  if (trade.entryPrice === BigInt(0)) return 0
  const priceDiff = trade.exitPrice - trade.entryPrice
  const multiplier = trade.side === 'long' ? 1 : -1
  return (Number(priceDiff) / Number(trade.entryPrice)) * 100 * multiplier
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDuration(start: number, end: number): string {
  const diff = end - start
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  return `${days}d ${hours % 24}h`
}
</script>

