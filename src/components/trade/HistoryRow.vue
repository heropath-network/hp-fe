<template>
  <tr class="transition hover:bg-gray-700/50">
    <!-- Market Column -->
    <td class="px-4 py-6 relative">
      <div class="flex items-center gap-2">
        <MarketIcon :symbol="trade.market" :size="24" />
        <div class="flex flex-col gap-1">
          <div class="text-[13px] leading-[18px] text-white font-normal">
            {{ trade.market }}
          </div>
          <div class="flex items-center gap-2">
            <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal">
              {{ formatDate(trade.timestamp) }}
            </div>
            <ChainLabel :chain-id="trade.chainId" :liquidity-source="trade.liquiditySource" />
          </div>
        </div>
      </div>
    </td>
    
    <!-- Side Column -->
    <td class="px-4 py-6">
      <span
        :class="[
          'inline-block px-2 py-0.5 text-xs font-semibold',
          trade.side === 'long'
            ? 'bg-green-success/20 text-green-success'
            : 'bg-red-error/20 text-red-error'
        ]"
      >
        {{ trade.side.toUpperCase() }}
      </span>
    </td>
    
    <!-- Size Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        {{ formatNumber(trade.size, 4) }}
      </div>
    </td>
    
    <!-- Entry Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        ${{ formatNumber(trade.entryPrice, 2) }}
      </div>
    </td>
    
    <!-- Exit Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        ${{ formatNumber(trade.exitPrice, 2) }}
      </div>
    </td>
    
    <!-- PnL Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div
          :class="[
            'text-[13px] leading-[18px] font-normal',
            trade.pnl >= 0 ? 'text-white' : 'text-[#ff4e59]'
          ]"
        >
          {{ trade.pnl >= 0 ? '' : '- ' }}{{ formatCurrency(trade.pnl >= 0 ? trade.pnl : trade.pnl * BigInt(-1)) }}
        </div>
        <div
          :class="[
            'text-[13px] leading-[18px] font-normal',
            trade.pnl >= 0 ? 'text-white' : 'text-[#9b9b9b]'
          ]"
        >
          {{ getPnLPercent() >= 0 ? '' : '- ' }}{{ formatPercentage(Math.abs(getPnLPercent()), 2) }}
        </div>
      </div>
    </td>
    
    <!-- Opened Column -->
    <td class="px-4 py-6">
      <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal">
        {{ formatDate(trade.timestamp) }}
      </div>
    </td>
    
    <!-- Closed Column -->
    <td class="px-4 py-6">
      <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal">
        {{ formatDate(trade.closeTimestamp) }}
      </div>
    </td>
    
    <!-- Duration Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal">
        {{ formatDuration(trade.timestamp, trade.closeTimestamp) }}
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useTradeStore } from '@/stores/tradeStore'
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/bigint'
import type { TradeHistory } from '@/stores/tradeStore'
import MarketIcon from '@/components/common/MarketIcon.vue'
import ChainLabel from '@/components/common/ChainLabel.vue'

const props = defineProps<{
  trade: TradeHistory
}>()

const tradeStore = useTradeStore()

function getPnLPercent(): number {
  if (props.trade.entryPrice === BigInt(0)) return 0
  const priceDiff = props.trade.exitPrice - props.trade.entryPrice
  const multiplier = props.trade.side === 'long' ? 1 : -1
  return (Number(priceDiff) / Number(props.trade.entryPrice)) * 100 * multiplier
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

