<template>
  <Dialog :show="show" @close="handleClose">
    <template #title>
      <div class="w-full h-0"></div>
    </template>
    <div class="position-filled-popup -m-4">
      <!-- Header Section -->
      <div class="flex items-center justify-between gap-2 mb-4">
        <div class="flex items-center gap-2 flex-1">
          <!-- Token Icon -->
          <div class="relative shrink-0 size-6">
            <img
              :src="tokenIconSrc"
              :alt="tokenSymbol"
              class="block w-full h-full object-contain"
            />
          </div>
          <!-- Title and Badge -->
          <div class="flex items-center gap-1">
            <span class="text-base font-semibold leading-6 text-white">{{ titleLabel }}</span>
            <div
              class="flex px-2  py-[2px]  border border-[rgba(16,200,168,0.1)] bg-[rgba(16,200,168,0.1)]"
            >
              <span class="text-xs leading-4 text-[#10c8a8] font-normal">{{ sideLabel }}</span>
            </div>
          </div>
        </div>
        <!-- Filled Status -->
        <div class="flex items-center gap-1">
          <span class="text-sm font-medium leading-5 text-[#10c8a8] text-right">Filled</span>
          <div class="relative shrink-0 size-5">
            <svg
              class="w-full h-full text-[#10c8a8]"
              fill="none"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Details Section -->
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <!-- Type -->
          <div class="flex items-start justify-between text-sm leading-5">
            <span class="text-[#9b9b9b] font-normal">Type</span>
            <span class="text-white font-normal">{{ orderTypeLabel }}</span>
          </div>

          <!-- Liquidity Source -->
          <div class="flex items-start justify-between">
            <span class="text-sm leading-5 text-[#9b9b9b] font-normal">Liquidity Source</span>
            <div class="flex items-center gap-1">
              <div class="relative shrink-0 size-4">
                <img
                  :src="liquiditySourceIcon"
                  :alt="liquiditySourceName"
                  class="block w-full h-full object-contain"
                />
              </div>
              <span class="text-sm leading-5 text-white font-normal">{{ liquiditySourceName }}</span>
            </div>
          </div>

          <!-- Margin Mode -->
          <div class="flex items-start justify-between text-sm leading-5">
            <span class="text-[#9b9b9b] font-normal">Margin Mode</span>
            <span class="text-white font-normal">{{ marginModeLabel }}</span>
          </div>

          <!-- Price -->
          <div class="flex items-start justify-between text-sm leading-5">
            <span class="text-[#9b9b9b] font-normal">Price</span>
            <span class="text-white font-normal">${{ formattedPrice }}</span>
          </div>

          <!-- Size -->
          <div class="flex items-start justify-between text-sm leading-5">
            <span class="text-[#9b9b9b] font-normal">Size</span>
            <span class="text-white font-normal">{{ formattedSize }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="relative h-1.5 w-full rounded bg-[#373f5c] overflow-hidden">
          <div
            class="absolute inset-0 h-full rounded bg-gradient-to-r from-[#0eb195] to-[#11ccab]"
          ></div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Dialog from '@/components/Dialog.vue'
import { formatNumber, fromBigInt } from '@/utils/bigint'
import { LIQUIDITY_SOURCES, type LiquiditySourceId } from '@/constants/liquiditySources'
import type { Position, Order } from '@/storages/trading'

interface Props {
  show: boolean
  position?: Position | null
  order?: Order | null
  market: string
  side: 'long' | 'short'
  orderType: 'market' | 'limit' | 'stop'
  liquiditySource: LiquiditySourceId
  marginMode: 'isolated' | 'cross'
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  position: null,
  order: null,
})

interface Emits {
  (event: 'close'): void
}

const emit = defineEmits<Emits>()

function handleClose() {
  emit('close')
}

// Get token symbol from market (e.g., "ETH/USD" -> "ETH")
const tokenSymbol = computed(() => {
  return props.market.split('/')[0] || 'ETH'
})

// Get token icon path
const tokenIconSrc = computed(() => {
  const symbol = tokenSymbol.value.toUpperCase()
  return `/img/tokens/${symbol}.svg`
})

// Title label
const titleLabel = computed(() => {
  return props.position ? 'Open Position' : 'Place Order'
})

// Side label
const sideLabel = computed(() => {
  return props.side === 'long' ? 'Long' : 'Short'
})

// Order type label
const orderTypeLabel = computed(() => {
  if (props.orderType === 'market') return 'Market Order'
  if (props.orderType === 'limit') return 'Limit Order'
  if (props.orderType === 'stop') return 'Stop Order'
  return 'Market Order'
})

// Liquidity source info
const liquiditySourceInfo = computed(() => {
  return LIQUIDITY_SOURCES.find((s) => s.id === props.liquiditySource) || LIQUIDITY_SOURCES[0]
})

const liquiditySourceName = computed(() => {
  return liquiditySourceInfo.value.name
})

const liquiditySourceIcon = computed(() => {
  const iconMap: Record<LiquiditySourceId, string> = {
    aster: '/img/liquidity/aster.svg',
    four: '/img/liquidity/four.svg',
    standx: '/img/liquidity/standx.svg',
    gtrade: '/img/liquidity/gtrade.svg',
  }
  return iconMap[props.liquiditySource] || '/img/liquidity/aster.svg'
})

// Margin mode label
const marginModeLabel = computed(() => {
  return props.marginMode === 'isolated' ? 'Isolated Margin' : 'Cross Margin'
})

// Formatted price
const formattedPrice = computed(() => {
  if (props.position) {
    return formatNumber(props.position.entryPrice, 2)
  }
  if (props.order) {
    return formatNumber(props.order.triggerPrice, 2)
  }
  return '0.00'
})

// Formatted size
const formattedSize = computed(() => {
  if (props.position) {
    const sizeValue = parseFloat(fromBigInt(props.position.size, 4))
    // Calculate USD value: size * entryPrice (both in 18 decimals, result needs to be divided by 10^18)
    const sizeUsdBigInt = (props.position.size * props.position.entryPrice) / BigInt(10 ** 18)
    const sizeUsd = formatNumber(sizeUsdBigInt, 2)
    return `${formatNumber(props.position.size, 4)} ${tokenSymbol.value} ($${sizeUsd})`
  }
  if (props.order) {
    const sizeValue = parseFloat(fromBigInt(props.order.size, 4))
    // Calculate USD value: size * triggerPrice (both in 18 decimals, result needs to be divided by 10^18)
    const sizeUsdBigInt = (props.order.size * props.order.triggerPrice) / BigInt(10 ** 18)
    const sizeUsd = formatNumber(sizeUsdBigInt, 2)
    return `${formatNumber(props.order.size, 4)} ${tokenSymbol.value} ($${sizeUsd})`
  }
  return '0.00'
})
</script>

<style scoped lang="scss">
.position-filled-popup {
  width: 100%;
  max-width: 343px;
  background: #414141;
  border: 1px solid rgba(9, 192, 160, 0.5);
  border-radius: 0;
  padding: 16px;
  box-shadow: 0px 4px 8px 0px rgba(0, 2, 10, 0.25);
}
</style>

