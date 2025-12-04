<template>
  <div class="position-filled-notification">
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
            class="flex px-2 py-[2px] border"
            :class="isLong ? 'border-green-success bg-green-success bg-opacity-10' : 'border-red-error bg-red-error bg-opacity-10'"
            >
            <span class="text-xs leading-4 font-normal" :class="isLong ? 'text-green-success' : 'text-red-error'">{{ sideLabel }}</span>
          </div>
        </div>
      </div>
      <!-- Status -->
      <div class="flex items-center gap-1">
        <span class="text-sm font-medium leading-5 text-right" :class="isFilled ? 'text-green-success' : 'text-[#9b9b9b]'">{{ statusLabel }}</span>
        <div v-if="isFilled" class="relative shrink-0 size-5 rounded-full flex items-center justify-center bg-green-success bg-opacity-10">
          <i class="iconfont icon-margin-mode-selected text-green-success text-[18px]"></i>
        </div> 
        <div v-else class="relative shrink-0 size-5 rounded-full flex items-center justify-center">
            <i class="iconfont icon-loading-small animate-spin text-[#9b9b9b] text-[18px]"></i>
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
      <div class="relative h-1.5 w-full rounded bg-[#272727] overflow-hidden">
        <div
          class="absolute inset-0 h-full rounded bg-gradient-to-r from-[#0eb195] to-[#11ccab] transition-all duration-500 ease-out"
          :style="{ width: progressWidth }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { formatNumber } from '@/utils/bigint'
import { LIQUIDITY_SOURCES, type LiquiditySourceId } from '@/constants/liquiditySources'
import type { Position, Order, TradeHistory } from '@/storages/trading'

interface Props {
  position?: Position | null
  order?: Order | null
  tradeHistory?: TradeHistory | null
  market: string
  side: 'long' | 'short'
  orderType: 'market' | 'limit' | 'stop'
  liquiditySource: LiquiditySourceId
  marginMode: 'isolated' | 'cross'
  actionType?: 'open' | 'close' | 'place'
  fillPromise?: Promise<any>
}

const props = withDefaults(defineProps<Props>(), {
  position: null,
  order: null,
  tradeHistory: null,
  actionType: 'open',
  fillPromise: undefined,
})

const currentStatus = ref<'pending' | 'filled'>('pending')

const isFilled = computed(() => {
  return currentStatus.value === 'filled'
})

// Status label
const statusLabel = computed(() => {
  return currentStatus.value === 'pending' ? 'Pending' : 'Filled'
})

// Progress bar width
const progressWidth = computed(() => {
  return currentStatus.value === 'pending' ? '50%' : '100%'
})

// Wait for Promise to resolve before changing to filled status
onMounted(() => {
  if (props.fillPromise) {
    props.fillPromise
      .then(() => {
        currentStatus.value = 'filled'
      })
      .catch((error) => {
        console.error('Fill promise rejected:', error)
        // Optionally handle error state here
      })
  } else {
    // If no promise provided, default to filled
    currentStatus.value = 'filled'
  }
})

interface Emits {
  (event: 'close'): void
}

const emit = defineEmits<Emits>()

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
  if (props.actionType === 'close') {
    return 'Close Position'
  }
  return props.position ? 'Open Position' : 'Place Order'
})

const isLong = computed(() => {
  return props.side === 'long'
})

// Side label
const sideLabel = computed(() => {
  return isLong.value ? 'Long' : 'Short'
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
  if (props.tradeHistory && props.actionType === 'close') {
    // For closed positions, show exit price
    return formatNumber(props.tradeHistory.exitPrice, 2)
  }
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
  if (props.tradeHistory && props.actionType === 'close') {
    // For closed positions, calculate USD value using exit price
    const sizeUsdBigInt = (props.tradeHistory.size * props.tradeHistory.exitPrice) / BigInt(10 ** 18)
    const sizeUsd = formatNumber(sizeUsdBigInt, 2)
    return `${formatNumber(props.tradeHistory.size, 4)} ${tokenSymbol.value} ($${sizeUsd})`
  }
  if (props.position) {
    // Calculate USD value: size * entryPrice (both in 18 decimals, result needs to be divided by 10^18)
    const sizeUsdBigInt = (props.position.size * props.position.entryPrice) / BigInt(10 ** 18)
    const sizeUsd = formatNumber(sizeUsdBigInt, 2)
    return `${formatNumber(props.position.size, 4)} ${tokenSymbol.value} ($${sizeUsd})`
  }
  if (props.order) {
    // Calculate USD value: size * triggerPrice (both in 18 decimals, result needs to be divided by 10^18)
    const sizeUsdBigInt = (props.order.size * props.order.triggerPrice) / BigInt(10 ** 18)
    const sizeUsd = formatNumber(sizeUsdBigInt, 2)
    return `${formatNumber(props.order.size, 4)} ${tokenSymbol.value} ($${sizeUsd})`
  }
  return '0.00'
})
</script>

<style scoped lang="scss">
.position-filled-notification {
  position: relative;
  box-sizing: border-box;
  width: 343px;
  padding: 16px;
  overflow: visible;
  background: #414141;
  border: 1px solid rgba(9, 192, 160, 0.5);
  box-shadow: 0px 4px 8px 0px rgba(0, 2, 10, 0.25);

  .close-button {
    position: absolute;
    right: -12px;
    top: -12px;
    height: 26px;
    width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #272727;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #373737;
    }
  }
}
</style>

