<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <!-- Tabs -->
    <div class="flex items-center border-b border-gray-800 px-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="selectedTab = tab.key"
        :class="[
          'relative px-4 py-3 text-sm font-semibold transition',
          selectedTab === tab.key
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-300'
        ]"
      >
        {{ tab.label }}
        <span
          v-if="getTabCount(tab.key) > 0"
          class="ml-1.5 text-xs"
        >
          ({{ getTabCount(tab.key) }})
        </span>
        <div
          v-if="selectedTab === tab.key"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        ></div>
      </button>

      <!-- Right side actions -->
      <div class="ml-auto flex items-center gap-3">
        <template v-if="selectedTab === 'positions' && positions.length > 0">
          <button
            @click="closeAllPositions"
            class="bg-red-error px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-error/90"
          >
            Close All
          </button>
        </template>
        <template v-if="selectedTab === 'orders' && orders.length > 0">
          <button
            @click="cancelAllOrders"
            class="bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-600"
          >
            Cancel All
          </button>
        </template>
        <template v-if="selectedTab === 'history' && tradeHistory.length > 0">
          <button
            @click="exportHistory"
            class="flex items-center gap-1.5 bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-600"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </template>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <PositionsTable v-show="selectedTab === 'positions'" />
      <OrdersTable v-show="selectedTab === 'orders'" />
      <HistoryTable v-show="selectedTab === 'history'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import PositionsTable from './PositionsTable.vue'
import OrdersTable from './OrdersTable.vue'
import HistoryTable from './HistoryTable.vue'
import { fromBigInt } from '@/utils/bigint'

const tradeStore = useTradeStore()

const selectedTab = ref<'positions' | 'orders' | 'history'>('positions')

const tabs = [
  { key: 'positions' as const, label: 'Positions' },
  { key: 'orders' as const, label: 'Orders' },
  { key: 'history' as const, label: 'History' }
]

const positions = computed(() => tradeStore.positions)
const orders = computed(() => tradeStore.orders)
const tradeHistory = computed(() => tradeStore.tradeHistory)

function getTabCount(key: 'positions' | 'orders' | 'history'): number {
  if (key === 'positions') return positions.value.length
  if (key === 'orders') return orders.value.length
  return 0
}

/**
 * Closes all positions and removes them from storage
 * Each position is closed individually, calculating PnL and updating storage
 */
function closeAllPositions() {
  if (confirm('Are you sure you want to close all positions?')) {
    const positionIds = positions.value.map(p => p.id)
    positionIds.forEach(id => tradeStore.closePosition(id))
  }
}

/**
 * Cancels all orders and removes them from storage
 * Each order is cancelled individually and removed from LocalStorage
 */
function cancelAllOrders() {
  if (confirm('Are you sure you want to cancel all orders?')) {
    const orderIds = orders.value.map(o => o.id)
    orderIds.forEach(id => tradeStore.cancelOrder(id))
  }
}

function exportHistory() {
  if (tradeHistory.value.length === 0) return

  // CSV headers
  const headers = ['Market', 'Side', 'Size', 'Entry Price', 'Exit Price', 'PnL', 'Opened', 'Closed']
  
  // CSV rows
  const rows = tradeHistory.value.map(trade => [
    trade.market,
    trade.side,
    fromBigInt(trade.size, 4),
    fromBigInt(trade.entryPrice, 2),
    fromBigInt(trade.exitPrice, 2),
    fromBigInt(trade.pnl, 2),
    new Date(trade.timestamp).toISOString(),
    new Date(trade.closeTimestamp).toISOString()
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trade-history-${Date.now()}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

