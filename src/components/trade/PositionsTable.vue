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
            <th class="px-4 py-3 text-right font-medium">Mark Price</th>
            <th class="px-4 py-3 text-right font-medium">Liq. Price</th>
            <th class="px-4 py-3 text-center font-medium">Leverage</th>
            <th class="px-4 py-3 text-right font-medium">Collateral</th>
            <th class="px-4 py-3 text-right font-medium">PnL</th>
            <th class="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-if="positions.length === 0">
            <td colspan="10" class="px-4 py-0">
              <div class="flex flex-col items-center justify-center gap-2 py-16">
                <img :src="noDataIcon" alt="No data" class="w-20 h-20" />
                <p class="text-sm text-[#9b9b9b] text-center">No Active Positions</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="position in positions"
            :key="position.id"
            class="transition hover:bg-gray-900/50"
          >
            <td class="px-4 py-3">
              <div class="font-medium text-white">{{ position.market }}</div>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-block rounded px-2 py-0.5 text-xs font-semibold',
                  position.side === 'long'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
                ]"
              >
                {{ position.side.toUpperCase() }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-white">
              {{ formatNumber(position.size, 4) }}
            </td>
            <td class="px-4 py-3 text-right text-white">
              ${{ formatNumber(position.entryPrice, 2) }}
            </td>
            <td class="px-4 py-3 text-right text-white">
              ${{ getMarkPrice(position.market) }}
            </td>
            <td class="px-4 py-3 text-right text-white">
              ${{ formatNumber(position.liquidationPrice, 2) }}
            </td>
            <td class="px-4 py-3 text-center text-white">
              {{ position.leverage }}x
            </td>
            <td class="px-4 py-3 text-right text-white">
              {{ formatCurrency(position.collateral) }}
            </td>
            <td class="px-4 py-3 text-right">
              <div
                :class="[
                  'font-semibold',
                  getPositionPnL(position) >= 0 ? 'text-green-500' : 'text-red-500'
                ]"
              >
                {{ formatCurrency(getPositionPnL(position)) }}
              </div>
              <div
                :class="[
                  'text-xs',
                  getPositionPnLPercent(position) >= 0 ? 'text-green-500' : 'text-red-500'
                ]"
              >
                {{ formatPercentage(getPositionPnLPercent(position)) }}
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <button
                @click="closePosition(position.id)"
                class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-500"
              >
                Close
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
import { formatNumber, formatCurrency, formatPercentage, calculatePnLPercentage, fromBigInt } from '@/utils/bigint'
import type { Position } from '@/stores/tradeStore'
import noDataIcon from '@/assets/img/no-data.svg'

const tradeStore = useTradeStore()

const positions = computed(() => tradeStore.positions)

function getMarkPrice(market: string): string {
  const price = tradeStore.marketPrices[market]?.price
  return price ? fromBigInt(price, 2) : '0.00'
}

function getPositionPnL(position: Position): bigint {
  const currentPrice = tradeStore.marketPrices[position.market]?.price || position.entryPrice
  const priceDiff = currentPrice - position.entryPrice
  const multiplier = position.side === 'long' ? BigInt(1) : BigInt(-1)
  return (priceDiff * position.size) / position.entryPrice * multiplier
}

function getPositionPnLPercent(position: Position): number {
  const currentPrice = tradeStore.marketPrices[position.market]?.price || position.entryPrice
  return calculatePnLPercentage(position.entryPrice, currentPrice, position.side) * position.leverage
}

function closePosition(positionId: string) {
  if (confirm('Are you sure you want to close this position?')) {
    tradeStore.closePosition(positionId)
  }
}
</script>

