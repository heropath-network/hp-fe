<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <div class="overflow-x-auto">
      <table class="w-full text-sm"> 
        <thead class="border-b border-gray-800">
          <tr class="text-xs text-gray-400">
            <th class="px-4 py-3 text-left font-medium">Market</th>
            <th class="px-4 py-3 text-left font-medium">Type</th>
            <th class="px-4 py-3 text-left font-medium">Side</th>
            <th class="px-4 py-3 text-right font-medium">Size</th>
            <th class="px-4 py-3 text-right font-medium">Trigger Price</th>
            <th class="px-4 py-3 text-right font-medium">Mark Price</th>
            <th class="px-4 py-3 text-left font-medium">Created</th>
            <th class="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-if="orders.length === 0">
            <td colspan="8" class="px-4 py-0">
              <div class="flex flex-col items-center justify-center gap-2 py-16">
                <img :src="noDataIcon" alt="No data" class="w-20 h-20" />
                <p class="text-sm text-[#9b9b9b] text-center">No Open Orders</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="transition hover:bg-gray-900/50"
          >
            <td class="px-4 py-3">
              <div class="font-medium text-white">{{ order.market }}</div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-block rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-500"
              >
                {{ order.orderType.toUpperCase() }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-block rounded px-2 py-0.5 text-xs font-semibold',
                  order.side === 'long'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
                ]"
              >
                {{ order.side.toUpperCase() }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-white">
              {{ formatNumber(order.size, 4) }}
            </td>
            <td class="px-4 py-3 text-right text-white">
              ${{ formatNumber(order.triggerPrice, 2) }}
            </td>
            <td class="px-4 py-3 text-right text-white">
              ${{ getMarkPrice(order.market) }}
            </td>
            <td class="px-4 py-3 text-gray-400">
              {{ formatTimestamp(order.timestamp) }}
            </td>
            <td class="px-4 py-3 text-center">
              <button
                @click="cancelOrder(order.id)"
                class="rounded bg-gray-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-600"
              >
                Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatNumber, fromBigInt } from '@/utils/bigint'
import noDataIcon from '@/assets/img/no-data.svg'

const tradeStore = useTradeStore()

const orders = computed(() => tradeStore.orders)

function getMarkPrice(market: string): string {
  const price = tradeStore.marketPrices[market]?.price
  return price ? fromBigInt(price, 2) : '0.00'
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function cancelOrder(orderId: string) {
  if (confirm('Are you sure you want to cancel this order?')) {
    tradeStore.cancelOrder(orderId)
  }
}
</script>

