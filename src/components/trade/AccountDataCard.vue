<template>
  <div class="rounded-xl border border-gray-800 bg-gray-900 p-4 text-xs">
    <p class="text-sm font-semibold text-white">Account Data</p>

    <div class="mt-3 space-y-2">
      <button
        type="button"
        class="flex w-full items-center justify-between text-[0.85rem] text-slate-300 outline-none transition hover:text-white"
        @click="showAccountBreakdown = !showAccountBreakdown"
      >
        <span class="font-medium text-slate-400">Account Equity</span>
        <span class="inline-flex items-center font-semibold text-slate-50">
          {{ formatCurrency(accountValueUsd) }}
        </span>
      </button>

      <div v-if="showAccountBreakdown" class="ml-4 space-y-2">
        <div class="flex w-full items-center justify-between text-[0.85rem] text-slate-300">
          <span class="font-medium text-slate-400">Your Balance</span>
          <span class="inline-flex items-center font-semibold text-slate-50">
            {{ formatCurrency(accountBalance) }}
          </span>
        </div>
        <div class="flex w-full items-center justify-between text-[0.85rem] text-slate-300">
          <span class="font-medium text-slate-400">Unrealized PnL</span>
          <span
            class="inline-flex items-center font-semibold"
            :class="[totalPnL >= 0n ? 'text-green-400' : 'text-red-400']"
          >
            {{ formatCurrency(totalPnL) }}
          </span>
        </div>
      </div>

      <div class="flex w-full items-center justify-between text-[0.85rem] text-slate-300">
        <span class="font-medium text-slate-400">Margin Usage</span>
        <span class="inline-flex items-center font-semibold text-slate-50">{{ formattedMarginUsage }}</span>
      </div>

      <div class="flex w-full items-center justify-between text-[0.85rem] text-slate-300">
        <span class="font-medium text-slate-400">Effective Leverage</span>
        <span class="inline-flex items-center font-semibold text-slate-50">{{ effectiveLeverageDisplay }}</span>
      </div>

      <button
        type="button"
        class="flex w-full items-center justify-between text-[0.85rem] text-slate-300 outline-none transition hover:text-white"
        @click="showCrossBreakdown = !showCrossBreakdown"
      >
        <span class="font-medium text-slate-400">Cross Margin Ratio</span>
        <span class="inline-flex items-center font-semibold text-slate-50">
          {{ formattedMarginRatio }}
        </span>
      </button>

      <div v-if="showCrossBreakdown" class="ml-4 space-y-2">
        <div class="flex w-full items-center justify-between text-[0.85rem] text-slate-300">
          <span class="font-medium text-slate-400">Maintenance Margin</span>
          <span class="inline-flex items-center font-semibold text-slate-50">
            {{ formatCurrency(maintenanceMarginUsd) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTradeStore } from '@/stores/tradeStore'
import { formatCurrency } from '@/utils/bigint'

const tradeStore = useTradeStore()
const { accountBalance, positions, totalPnL } = storeToRefs(tradeStore)

const showAccountBreakdown = ref(false)
const showCrossBreakdown = ref(false)

const collateralLocked = computed(() => {
  return positions.value.reduce((sum, pos) => sum + pos.collateral, BigInt(0))
})

const accountValueUsd = computed(() => collateralLocked.value + accountBalance.value + totalPnL.value)

function leverageToBigInt(value: number): bigint {
  const normalized = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1
  return BigInt(normalized)
}

const totalPositionNotional = computed(() => {
  if (!positions.value.length) return BigInt(0)
  return positions.value.reduce((sum, pos) => sum + pos.collateral * leverageToBigInt(pos.leverage), BigInt(0))
})

const MAINTENANCE_MARGIN_RATE_BPS = BigInt(500)
const BPS_DENOMINATOR = BigInt(10000)

const maintenanceMarginUsd = computed(() => {
  if (totalPositionNotional.value === BigInt(0)) return BigInt(0)
  return (totalPositionNotional.value * MAINTENANCE_MARGIN_RATE_BPS) / BPS_DENOMINATOR
})

function percentOf(numerator: bigint, denominator: bigint): number {
  if (numerator === BigInt(0)) {
    return 0
  }
  if (denominator <= BigInt(0)) {
    return 100
  }
  const scaled = (numerator * BigInt(10000)) / denominator
  return Math.min(Number(scaled) / 100, 999)
}

function ratioToNumber(numerator: bigint, denominator: bigint, decimals = 2): number {
  if (numerator === BigInt(0)) return 0
  if (denominator <= BigInt(0)) {
    return 999
  }
  const scale = BigInt(10 ** decimals)
  const scaled = (numerator * scale) / denominator
  return Number(scaled) / 10 ** decimals
}

const marginUsagePercent = computed(() => {
  if (!positions.value.length) return 0
  return percentOf(collateralLocked.value, accountValueUsd.value)
})

const marginRatioPercent = computed(() => {
  if (maintenanceMarginUsd.value === BigInt(0)) return 0
  return percentOf(maintenanceMarginUsd.value, accountValueUsd.value)
})

const effectiveLeverage = computed(() => {
  if (totalPositionNotional.value === BigInt(0)) return 0
  if (accountValueUsd.value <= BigInt(0)) return 999
  return ratioToNumber(totalPositionNotional.value, accountValueUsd.value, 2)
})

const effectiveLeverageDisplay = computed(() => `${effectiveLeverage.value.toFixed(2)}x`)
const formattedMarginUsage = computed(() => `${marginUsagePercent.value.toFixed(2)}%`)
const formattedMarginRatio = computed(() => `${marginRatioPercent.value.toFixed(2)}%`)
</script>


