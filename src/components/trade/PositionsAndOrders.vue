<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <!-- Content Tabs (Positions/Orders/History) -->
    <div class="flex items-center pr-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="selectedTab = tab.key"
        :class="[
          'relative px-4 py-4 text-sm font-semibold transition',
          selectedTab === tab.key
            ? 'text-white'
            : 'text-gray-400 hover:text-white'
        ]"
      >
        {{ tab.label }}
        <span
          v-if="getTabCount(tab.key) > 0"
        >
          ({{ getTabCount(tab.key) }})
        </span>
      </button>

      <!-- Right side actions -->
      <div class="ml-auto flex items-center gap-3">
        <template v-if="selectedTab === 'positions'">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">Label Positions</span>
            <Switch :enabled="chartShowPositions" @update:enabled="chartShowPositions = $event" />
          </div>
          <div v-if="filteredPositions.length > 0" class="h-4 w-px bg-gray-800"></div>
          <button
            v-if="filteredPositions.length > 0"
            @click="closeAllPositions"
            class="bg-red-error px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-error/90"
          >
            Close All
          </button>
        </template>
        <template v-if="selectedTab === 'orders'">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">Label Orders</span>
            <Switch :enabled="chartShowOrders" @update:enabled="chartShowOrders = $event" />
          </div>
          <div v-if="filteredOrders.length > 0" class="h-4 w-px bg-gray-800"></div>
          <button
            v-if="filteredOrders.length > 0"
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

    <!-- Market Type Tabs (Perps/Meme) -->
    <div class="flex items-center  px-4">
      <button
        @click="selectedMarketType = 'perps'"
        :class="[
          'flex h-full items-center justify-center shrink-0  px-[23px] py-[7px]',
          selectedMarketType === 'perps'
            ? 'bg-[#272727] text-white'
            : 'bg-[#1d1d1d] text-[#9b9b9b]  hover:text-white'
        ]"
      >
        <p class="text-[13px] font-medium leading-[18px]">Perps</p>
      </button>
      <button
        @click="selectedMarketType = 'meme'"
        :class="[
          'flex h-full items-center justify-center shrink-0 px-[23px] py-[7px]',
          selectedMarketType === 'meme'
            ? 'bg-[#272727] text-white'
            : 'bg-[#1d1d1d] text-[#9b9b9b] hover:text-white'
        ]"
      >
        <p class="text-[13px] font-medium leading-[18px]">Spot</p>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <PositionsTable v-show="selectedTab === 'positions'" :positions="filteredPositions" />
      <OrdersTable v-show="selectedTab === 'orders'" :orders="filteredOrders" />
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
import Switch from '@/components/Switch.vue'
import { CHART_SHOW_POSITION_STORAGE, CHART_SHOW_ORDER_STORAGE } from '@/storages/chart'
import { PERP_MARKETS } from '@/constants/markets'

const tradeStore = useTradeStore()

const selectedMarketType = ref<'perps' | 'meme'>('perps')
const selectedTab = ref<'positions' | 'orders' | 'history'>('positions')

const chartShowPositions = CHART_SHOW_POSITION_STORAGE
const chartShowOrders = CHART_SHOW_ORDER_STORAGE

const tabs = [
  { key: 'positions' as const, label: 'Positions' },
  { key: 'orders' as const, label: 'Orders' },
  { key: 'history' as const, label: 'History' }
]

const allPositions = computed(() => tradeStore.positions)
const allOrders = computed(() => tradeStore.orders)
const tradeHistory = computed(() => tradeStore.tradeHistory)

// Filter positions and orders based on selected market type
const filteredPositions = computed(() => {
  if (selectedMarketType.value === 'meme') {
    // Return empty array for meme (not implemented yet as per user's note)
    return []
  }
  
  // Filter for perps markets
  return allPositions.value
})

const filteredOrders = computed(() => {
  if (selectedMarketType.value === 'meme') {
    // Return empty array for meme (not implemented yet as per user's note)
    return []
  }
  
  return allOrders.value
})

function getTabCount(key: 'positions' | 'orders' | 'history'): number {
  if (key === 'positions') return filteredPositions.value.length
  if (key === 'orders') return filteredOrders.value.length
  return 0
}

/**
 * Closes all positions and removes them from storage
 * Each position is closed individually, calculating PnL and updating storage
 */
function closeAllPositions() {
  if (confirm('Are you sure you want to close all positions?')) {
    const positionIds = filteredPositions.value.map(p => p.id)
    positionIds.forEach(id => tradeStore.closePosition(id))
  }
}

/**
 * Cancels all orders and removes them from storage
 * Each order is cancelled individually and removed from LocalStorage
 */
function cancelAllOrders() {
  if (confirm('Are you sure you want to cancel all orders?')) {
    const orderIds = filteredOrders.value.map(o => o.id)
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

