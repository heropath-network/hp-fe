<template>
  <tr class="transition hover:bg-gray-700/50">
    <!-- Market Column -->
    <td class="px-4 py-6 relative">
      <div class="flex items-center gap-2">
        <MarketIcon :symbol="position.market" :size="24" />
        <div class="flex flex-col gap-1">
          <div class="text-[13px] leading-[18px] text-white font-normal">
            {{ position.market }}
          </div>
          <div class="flex items-center gap-2">
            <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal">
              {{ getTimeframe() }}
            </div>
            <ChainLabel :chain-id="position.chainId" :liquidity-source="position.liquiditySource" />
          </div>
        </div>
      </div>
    </td>
    
    <!-- Side Column -->
    <td class="px-4 py-6">
      <span
        :class="[
          'inline-block px-2 py-0.5 text-xs font-semibold',
          position.side === 'long'
            ? 'bg-green-success/20 text-green-success'
            : 'bg-red-error/20 text-red-error'
        ]"
      >
        {{ position.side.toUpperCase() }}
      </span>
    </td>
    
    <!-- Size Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div class="text-[13px] leading-[18px] text-white font-normal">
          ${{ getPositionSizeUSD() }}
        </div>
        <div class="text-[13px] leading-[18px] text-[#9b9b9b] font-normal whitespace-nowrap">
          {{ formatNumber(position.size, 4) }}
        </div>
      </div>
    </td>
    
    <!-- Entry Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div class="text-[13px] leading-[18px] text-white font-normal">
          ${{ formatNumber(position.entryPrice, 2) }}
        </div>
      </div>
    </td>
    
    <!-- Mark Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div class="text-[13px] leading-[18px] text-white font-normal">
          ${{ getMarkPrice(position.market) }}
        </div>
      </div>
    </td>
    
    <!-- Liq. Price Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        ${{ formatNumber(position.liquidationPrice, 2) }}
      </div>
    </td>
    
    <!-- Leverage Column -->
    <td class="px-4 py-6 text-center">
      <div class="text-[13px] leading-[18px] text-white font-normal">
        {{ position.leverage }}x
      </div>
    </td>
    
    <!-- Collateral Column -->
    <td class="px-4 py-6 text-right">
      <div class="text-[13px] leading-[18px] text-white font-normal whitespace-nowrap">
        {{ formatCurrency(position.collateral) }}
      </div>
    </td>
    
    <!-- PnL Column -->
    <td class="px-4 py-6 text-right">
      <div class="flex flex-col gap-1 items-end">
        <div
          :class="[
            'text-[13px] leading-[18px] font-normal',
            getPositionPnL() >= 0 ? 'text-white' : 'text-[#ff4e59]'
          ]"
          :title="`Gross PnL: ${formatCurrency(pnlBreakdown.grossPnl)}\nFees: ${formatCurrency(pnlBreakdown.totalFees)}\nNet PnL: ${formatCurrency(pnlBreakdown.netPnl)}`"
        >
          {{ formatCurrency(getPositionPnL()) }}
        </div>
        <div
          :class="[
            'text-[13px] leading-[18px] font-normal',
            getPositionPnLPercent() >= 0 ? 'text-white' : 'text-[#9b9b9b]'
          ]"
        >
          {{ formatPnLPercentage(getPositionPnLPercent()) }}
        </div>
      </div>
    </td>
    
    <!-- Actions Column -->
    <td class="px-4 py-6 text-center">
      <button
        @click="closePosition(position.id)"
        class="flex items-center justify-center gap-1 bg-[#272727] px-4 py-2 transition hover:bg-[#333333]"
      >
        <!-- <svg class="w-4 h-4 text-[#ff4e59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg> -->
        <span class="text-[12px] leading-[16px] text-[#ff4e59] font-medium text-center whitespace-nowrap">
            Close
        </span>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatNumber, formatCurrency, fromBigInt } from '@/utils/bigint'
import { calculatePositionPnL } from '@/utils/pnl'
import type { Position } from '@/storages/trading'
import MarketIcon from '@/components/common/MarketIcon.vue'
import ChainLabel from '@/components/common/ChainLabel.vue'

const props = defineProps<{
  position: Position
}>()

const tradeStore = useTradeStore()

function getMarkPrice(market: string): string {
  const price = tradeStore.marketPrices[market]?.price
  return price ? fromBigInt(price, 2) : '0.00'
}

function getPositionSizeUSD(): string {
  // Position value in USD = collateral * leverage
  // This matches the calculation used in PnL and represents the notional position value
  const positionValue = props.position.collateral * BigInt(props.position.leverage)
  return formatCurrency(positionValue, 2).replace('$', '')
}

// Calculate comprehensive PnL with fees
const pnlBreakdown = computed(() => {
  const currentPrice = tradeStore.marketPrices[props.position.market]?.price || props.position.entryPrice
  return calculatePositionPnL(
    props.position.entryPrice,
    currentPrice,
    props.position.side,
    props.position.size,
    props.position.leverage,
    props.position.collateral,
    props.position.timestamp,
    true // Include fees
  )
})

function getPositionPnL(): bigint {
  return pnlBreakdown.value.netPnl
}

function getPositionPnLPercent(): number {
  return pnlBreakdown.value.netPnlPercent
}

function formatPnLPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function getTimeframe(): string {
  // Calculate time since position was opened
  const now = Date.now()
  const opened = props.position.timestamp
  const diffMs = now - opened
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

/**
 * Closes a position and removes it from storage
 * This calculates PnL and updates account balance, then removes from LocalStorage
 */
function closePosition(positionId: string) {
  if (confirm('Are you sure you want to close this position?')) {
    // closePosition automatically updates storage via tradeStore
    tradeStore.closePosition(positionId)
  }
}
</script>

