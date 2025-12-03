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
          :title="`Gross PnL: ${formatCurrency(pnlBreakdown.grossPnl)}\nFees: ${formatCurrency(pnlBreakdown.totalFees)}\nNet PnL: ${formatCurrency(pnlBreakdown.netPnl)}`"
        >
          {{ formatCurrency(trade.pnl) }}
        </div>
        <div
          :class="[
            'text-[13px] leading-[18px] font-normal',
            getPnLPercent() >= 0 ? 'text-white' : 'text-[#9b9b9b]'
          ]"
        >
          {{ formatPnLPercentage(getPnLPercent()) }}
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
import { computed } from 'vue'
import { formatNumber, formatCurrency } from '@/utils/bigint'
import { calculateTradeHistoryPnL } from '@/utils/pnl'
import type { TradeHistory } from '@/storages/trading'
import MarketIcon from '@/components/common/MarketIcon.vue'
import ChainLabel from '@/components/common/ChainLabel.vue'

const props = defineProps<{
  trade: TradeHistory
}>()

// Calculate comprehensive PnL breakdown (for display purposes, trade.pnl already has net PnL)
const pnlBreakdown = computed(() => {
  // Use stored values if available, otherwise calculate
  if (props.trade.collateral && props.trade.leverage) {
    return calculateTradeHistoryPnL(
      props.trade.entryPrice,
      props.trade.exitPrice,
      props.trade.side,
      props.trade.size,
      props.trade.leverage,
      props.trade.collateral,
      props.trade.timestamp,
      props.trade.closeTimestamp,
      true // Include fees
    )
  }
  // Fallback for old trades without collateral/leverage
  return {
    grossPnl: props.trade.pnl,
    grossPnlPercent: 0,
    fundingFee: BigInt(0),
    borrowingFee: BigInt(0),
    closingFee: BigInt(0),
    totalFees: BigInt(0),
    netPnl: props.trade.pnl,
    netPnlPercent: 0,
  }
})

function getPnLPercent(): number {
  // Use calculated net PnL percentage if available
  if (pnlBreakdown.value.netPnlPercent !== 0) {
    return pnlBreakdown.value.netPnlPercent
  }
  // Fallback calculation for old trades
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

function formatPnLPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
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

