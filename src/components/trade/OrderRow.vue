<template>
  <tr class="transition hover:bg-gray-700/50">
    <!-- Market Column -->
    <td class="px-4 py-6 relative">
      <div class="flex items-center gap-2">
        <MarketIcon :symbol="order.market" :size="24" />
        <div class="flex flex-col gap-1">
          <div class="text-[13px] leading-[18px] text-white font-normal">
            {{ order.market }}
          </div>
          <div class="flex items-center gap-2">
            <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal">
              {{ getTimeframe() }}
            </div>
            <ChainLabel :chain-id="order.chainId" :liquidity-source="order.liquiditySource" />
          </div>
        </div>
      </div>
    </td>
    
    <!-- Type Column -->
    <td class="px-4 py-6">
      <span
        class="inline-block bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-500"
      >
        {{ order.orderType.toUpperCase() }}
      </span>
    </td>
    
    <!-- Side Column -->
    <td class="px-4 py-6">
      <span
        :class="[
          'inline-block px-2 py-0.5 text-xs font-semibold',
          order.side === 'long'
            ? 'bg-green-success/20 text-green-success'
            : 'bg-red-error/20 text-red-error'
        ]"
      >
        {{ order.side.toUpperCase() }}
      </span>
    </td>
    
    <!-- Size Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        {{ formatNumber(order.size, 4) }}
      </div>
    </td>
    
    <!-- Trigger Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        ${{ formatNumber(order.triggerPrice, 2) }}
      </div>
    </td>
    
    <!-- Mark Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        ${{ getMarkPrice(order.market) }}
      </div>
    </td>
    
    <!-- Created Column -->
    <td class="px-4 py-6">
      <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal">
        {{ formatTimestamp(order.timestamp) }}
      </div>
    </td>
    
    <!-- Actions Column -->
    <td class="px-4 py-6 text-center">
      <button
        @click="cancelOrder(order.id)"
        class="flex items-center justify-center gap-1 bg-[#272727] px-4 py-2 transition hover:bg-[#333333]"
      >
        <span class="text-[12px] leading-[16px] text-[#ff4e59] font-medium text-center whitespace-nowrap">
          Cancel
        </span>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useTradeStore } from '@/stores/tradeStore'
import { formatNumber, fromBigInt } from '@/utils/bigint'
import type { Order } from '@/storages/trading'
import MarketIcon from '@/components/common/MarketIcon.vue'
import ChainLabel from '@/components/common/ChainLabel.vue'

const props = defineProps<{
  order: Order
}>()

const tradeStore = useTradeStore()

function getMarkPrice(market: string): string {
  const price = tradeStore.marketPrices[market]?.price
  return price ? fromBigInt(price, 2) : '0.00'
}

function getTimeframe(): string {
  // Calculate time since order was created
  const now = Date.now()
  const created = props.order.timestamp
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
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

