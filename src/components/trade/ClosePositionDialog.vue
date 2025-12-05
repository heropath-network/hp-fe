<template>
  <Dialog :show="visible" @close="handleClose" class="close-position-dialog">
    <template #title>
      <span class="text-[16px] font-semibold leading-[24px] text-white">
        Close {{ position?.market }} Position<span> - </span>
        <span :class="position?.side === 'long' ? 'text-[#10c8a8]' : 'text-[#ff6b6b]'">
          {{ position?.side === 'long' ? 'Long' : 'Short' }} {{ formatLeverage(position?.leverage || 0) }}X
        </span>
      </span>
    </template>

    <div class="flex flex-col gap-3">
      <!-- Input Section -->
      <div class="flex flex-col gap-3">
        <!-- Market Price and Order Type Row -->
        <div class="flex gap-2">
          <!-- Market Price Card -->
          <div class="flex-1 relative overflow-hidden">
            <div class="bg-[rgba(39,39,39,0.5)] p-4 flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Market Price</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[20px] font-semibold leading-[28px] text-[#9b9b9b]">$</span>
                <span class="text-[20px] font-semibold leading-[28px] text-[#9b9b9b]">
                  {{ formatPrice(currentMarketPrice) }}
                </span>
              </div>
            </div>
            <div class="absolute top-0 right-0 bg-[#414141] w-6 h-6 flex items-center justify-center">
              <div class="relative shrink-0 size-4">
                <img
                  :src="getLiquiditySourceIcon(position?.liquiditySource)"
                  :alt="position?.liquiditySource || 'Liquidity Source'"
                  class="block w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <!-- Order Type Card -->
          <div class="flex-1 relative overflow-hidden">
            <div class="bg-[#272727] p-4 flex flex-col gap-2">
              <div class="flex items-center justify-end">
                <span class="text-[14px] leading-[20px] text-[#9b9b9b] text-right">Order Type</span>
              </div>
              <div class="flex items-center justify-end gap-1">
                <span class="text-[18px] font-medium leading-[28px] text-white text-right">Market</span>
                <i class="iconfont icon-down text-white text-[16px]"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Close Amount Card -->
        <div class="relative overflow-hidden">
          <div class="bg-[#272727] p-4 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Close Amount</span>
              <span class="text-[14px] leading-[20px] text-[#9b9b9b] text-right">
                Max: {{ formatAmount(maxCloseAmount) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <input
                v-model="closeAmount"
                type="text"
                placeholder="0"
                class="flex-1 bg-transparent text-[20px] font-semibold leading-[28px] text-white outline-none placeholder:text-[#545454]"
                @input="handleAmountInput"
              />
              <div class="flex items-center gap-1">
                <span class="text-[18px] font-medium leading-[28px] text-white">{{ position?.market }}</span>
              </div>
            </div>
            <!-- Percentage Buttons -->
            <div class="flex gap-2">
              <button
                v-for="percent in [25, 50, 75, 100]"
                :key="percent"
                @click="setClosePercentage(percent)"
                :class="[
                  'flex-1 h-8 flex items-center justify-center px-4 text-[14px] font-medium leading-[20px] transition-colors bg-[#373737]',
                  selectedPercentage === percent ? ' text-[#6CE99E]' : ' text-[#9b9b9b] hover:bg-[#414141]',
                ]"
              >
                {{ percent }}%
              </button>
            </div>
          </div>
        </div>

        <!-- Collateral & Profits Settings -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Collateral & Profits In</span>
            <div class="relative token-selector-container">
              <button
                @click.stop="showTokenSelector = !showTokenSelector"
                class="flex items-center gap-1 bg-[#373737] px-2 py-1 hover:bg-[#414141] transition-colors"
              >
                <MarketIcon :symbol="selectedToken" :size="20" />
                <span class="text-[14px] font-medium leading-[20px] text-white">{{ selectedToken }}</span>
                <i
                  class="iconfont icon-down text-white text-[16px] transition-transform"
                  :class="{ 'rotate-180': showTokenSelector }"
                ></i>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showTokenSelector"
                class="absolute right-0 top-full mt-1 bg-[#272727] border border-[#373737] rounded overflow-hidden z-10 min-w-[120px]"
              >
                <button
                  v-for="token in tokenOptions"
                  :key="token"
                  @click.stop="selectToken(token)"
                  :class="[
                    'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#373737] transition-colors',
                    selectedToken === token ? 'bg-[#373737]' : '',
                  ]"
                >
                  <MarketIcon :symbol="token" :size="16" />
                  <span class="text-[14px] font-medium leading-[20px] text-white">{{ token }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Profit Token Swap Slippage</span>
            <div class="flex items-center gap-1">
              <span class="text-[14px] leading-[20px] text-white text-right">≤ 1.000%</span>
              <i class="iconfont icon-edit text-white text-[16px] cursor-pointer"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-[#272727]"></div>

      <!-- Position Details -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Entry & Index Price</span>
          <span class="text-[14px] leading-[20px] text-white text-right">
            ${{ formatPrice(entryPrice) }} / ${{ formatPrice(indexPrice) }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Est. Market Price</span>
            <i class="iconfont icon-question text-[#9b9b9b] text-[16px] cursor-help"></i>
          </div>
          <span class="text-[14px] leading-[20px] text-white text-right">
            ${{ formatPrice(currentMarketPrice) }} / {{ position?.market }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Price Impact</span>
          <span class="text-[14px] leading-[20px] text-white text-right">{{ formatPercentage(priceImpact) }}%</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Max. Position Slippage</span>
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-white text-right">≤ 1.000%</span>
            <i class="iconfont icon-edit text-white text-[16px] cursor-pointer"></i>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Size</span>
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]"
              >{{ formatAmount(beforeSize) }} {{ position?.market }}</span
            >
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">→</span>
            <span class="text-[14px] leading-[20px] text-white"
              >{{ formatAmount(afterSize) }} {{ position?.market }}</span
            >
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Leverage</span>
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">{{ formatLeverage(beforeLeverage) }}X</span>
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">→</span>
            <span class="text-[14px] leading-[20px] text-white">{{ formatLeverage(afterLeverage) }}X</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Liq. Price</span>
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">${{ formatPrice(beforeLiqPrice) }}</span>
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">→</span>
            <span class="text-[14px] leading-[20px] text-white">0</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Collateral</span>
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">${{ formatPrice(beforeCollateral) }}</span>
            <span class="text-[14px] leading-[20px] text-[#9b9b9b]">→</span>
            <span class="text-[14px] leading-[20px] text-white">${{ formatPrice(afterCollateral) }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Current Total PNL</span>
          <span
            :class="['text-[14px] leading-[20px] text-right', currentPNL >= 0 ? 'text-[#10c8a8]' : 'text-[#ff6b6b]']"
          >
            {{ currentPNL >= 0 ? '+' : '-' }}${{ formatPrice(Math.abs(currentPNL)) }}
            <span class="text-[#9b9b9b]"
              >({{ currentPNL >= 0 ? '+' : '-' }}{{ formatPercentage(currentPNLPercentage) }}%)</span
            >
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-[#272727]"></div>

      <!-- Close Cost and You Will Receive -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">Close Cost</span>
          <span class="text-[14px] leading-[20px] text-white text-right">${{ formatPrice(closeCost) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b]">You Will Receive</span>
          <span class="text-[14px] leading-[20px] text-[#10c8a8] text-right"> ${{ formatPrice(youWillReceive) }} </span>
        </div>
      </div>

      <!-- Checkbox and Close Button -->
      <div class="flex flex-col gap-3 mt-4">
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="ignoreMaxSlippage" class="w-4 h-4 border border-[#9b9b9b] cursor-pointer" />
          <span class="text-[14px] leading-[20px] text-white">Ignore Max. Position Slippage</span>
        </div>
        <button
          @click="handleClosePosition"
          :disabled="!canClose"
          class="w-full h-[52px] bg-[#6ce99e] text-[#000] text-[16px] font-medium leading-[24px] transition-colors hover:bg-[#5dd88a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Dialog from '@/components/Dialog.vue'
import type { Position } from '@/storages/trading'
import type { LiquiditySourceId } from '@/constants/liquiditySources'
import { formatNumber, fromBigInt, toBigInt } from '@/utils/bigint'
import { calculatePositionPnL } from '@/utils/pnl'
import MarketIcon from '@/components/common/MarketIcon.vue'

interface Props {
  visible: boolean
  position: Position | null
  marketPrice?: bigint | number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  marketPrice: 0,
})

const emit = defineEmits<{
  close: []
  confirm: [amount: bigint]
}>()

// Form state
const closeAmount = ref('')
const selectedPercentage = ref<number | null>(null)
const ignoreMaxSlippage = ref(false)
const selectedToken = ref<'USDC' | 'BNB'>('USDC')
const showTokenSelector = ref(false)
const tokenOptions: ('USDC' | 'BNB')[] = ['USDC', 'BNB']

// Computed values
const currentMarketPrice = computed(() => {
  if (typeof props.marketPrice === 'bigint') {
    return parseFloat(fromBigInt(props.marketPrice, 8))
  }
  return props.marketPrice || 0
})

const maxCloseAmount = computed(() => {
  if (!props.position) return BigInt(0)
  return props.position.size
})

const entryPrice = computed(() => {
  if (!props.position) return 0
  return parseFloat(fromBigInt(props.position.entryPrice, 8))
})

const indexPrice = computed(() => {
  // For now, use market price as index price
  return currentMarketPrice.value
})

const beforeSize = computed(() => {
  if (!props.position) return BigInt(0)
  return props.position.size
})

const afterSize = computed(() => {
  const closeAmountBigInt = getCloseAmountBigInt()
  if (!props.position || closeAmountBigInt === BigInt(0)) return beforeSize.value
  return beforeSize.value - closeAmountBigInt
})

const beforeLeverage = computed(() => {
  return props.position?.leverage || 0
})

const afterLeverage = computed(() => {
  if (!props.position) return 0
  const closeAmountBigInt = getCloseAmountBigInt()
  if (closeAmountBigInt >= props.position.size) return 0

  // If closing proportionally, leverage typically stays the same
  // Leverage = Size / Collateral, so if we close proportionally:
  // remainingCollateral = remainingSize / leverage
  // Therefore leverage stays constant: afterLeverage = beforeLeverage
  return props.position.leverage
})

const beforeLiqPrice = computed(() => {
  if (!props.position) return 0
  return parseFloat(fromBigInt(props.position.liquidationPrice, 8))
})

const afterLiqPrice = computed(() => {
  // Simplified - would need proper calculation based on remaining position
  if (afterSize.value === BigInt(0)) return 0
  return beforeLiqPrice.value
})

const beforeCollateral = computed(() => {
  if (!props.position) return 0
  // Collateral = (Size * Price) / Leverage
  const sizeUsd = parseFloat(fromBigInt(props.position.size, 18)) * currentMarketPrice.value
  return sizeUsd / props.position.leverage
})

const afterCollateral = computed(() => {
  if (!props.position) return 0
  if (afterSize.value === BigInt(0)) return 0
  // Collateral = (Size * Price) / Leverage
  const afterSizeUsd = parseFloat(fromBigInt(afterSize.value, 18)) * currentMarketPrice.value
  const leverageValue = afterLeverage.value || 1 // Fallback to 1 if leverage is 0
  return afterSizeUsd / leverageValue
})

const priceImpact = computed(() => {
  // Simplified - would need actual price impact calculation
  return 0
})

const maxROE = computed(() => {
  if (!props.position || props.position.leverage === 0) return 0

  // Max ROE represents the maximum profit percentage relative to margin
  // Max profit is typically: (leverage - 1) * margin, but limited by pool capacity
  // For a simplified calculation: Max ROE ≈ (leverage - 1) * 100%
  // This represents the theoretical maximum return if price moves favorably
  const theoreticalMaxRoe = (props.position.leverage - 1) * 100

  // Cap at reasonable maximum (900% as seen in mux-fe for some protocols)
  const cappedRoe = Math.min(theoreticalMaxRoe, 900)
  return cappedRoe
})

const currentPNL = computed(() => {
  if (!props.position) return 0

  const closeAmountBigInt = getCloseAmountBigInt()
  if (closeAmountBigInt === BigInt(0)) return 0

  const closeRatio = Number(closeAmountBigInt) / Number(props.position.size)
  const positionSizeUsd = parseFloat(fromBigInt(props.position.size, 18)) * currentMarketPrice.value
  const entryPriceValue = parseFloat(fromBigInt(props.position.entryPrice, 8))

  const priceDiff = currentMarketPrice.value - entryPriceValue
  const multiplier = props.position.side === 'long' ? 1 : -1
  const pnl = (priceDiff / entryPriceValue) * positionSizeUsd * multiplier * closeRatio

  return pnl
})

const currentPNLPercentage = computed(() => {
  if (!props.position) return 0

  const currentPrice = toBigInt(currentMarketPrice.value.toString())
  const pnlBreakdown = calculatePositionPnL(
    props.position.entryPrice,
    currentPrice,
    props.position.side,
    props.position.size,
    props.position.leverage,
    props.position.collateral,
    props.position.timestamp,
    true, // Include fees
  )

  // Return ROE (Return on Equity) - netPnlPercent
  return pnlBreakdown.netPnlPercent
})

const closeCost = computed(() => {
  // Simplified fee calculation (1% of position value)
  if (!props.position) return 0
  const closeAmountBigInt = getCloseAmountBigInt()
  if (closeAmountBigInt === BigInt(0)) return 0

  const closeSizeUsd = parseFloat(fromBigInt(closeAmountBigInt, 18)) * currentMarketPrice.value
  return closeSizeUsd * 0.001 // 1% fee
})

const youWillReceive = computed(() => {
  if (!props.position) return 0
  const closeAmountBigInt = getCloseAmountBigInt()
  if (closeAmountBigInt === BigInt(0)) return 0

  const closeRatio = Number(closeAmountBigInt) / Number(props.position.size)
  const collateralToReceive = beforeCollateral.value * closeRatio
  const pnlToReceive = currentPNL.value
  const cost = closeCost.value

  return collateralToReceive + pnlToReceive - cost
})

const canClose = computed(() => {
  const closeAmountBigInt = getCloseAmountBigInt()
  return closeAmountBigInt > BigInt(0) && closeAmountBigInt <= maxCloseAmount.value
})

// Helper functions
function getCloseAmountBigInt(): bigint {
  if (!closeAmount.value || !props.position) return BigInt(0)
  try {
    const amount = parseFloat(closeAmount.value)
    if (isNaN(amount) || amount <= 0) return BigInt(0)

    // Convert to BigInt with 18 decimals
    return toBigInt(amount.toString())
  } catch {
    return BigInt(0)
  }
}

function setClosePercentage(percent: number) {
  if (!props.position) return

  selectedPercentage.value = percent
  const maxAmount = parseFloat(fromBigInt(props.position.size, 18))
  const amount = (maxAmount * percent) / 100
  closeAmount.value = amount.toFixed(8).replace(/\.?0+$/, '')
}

function handleAmountInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Validate input
  if (value === '' || value === '0') {
    closeAmount.value = ''
    selectedPercentage.value = null
    return
  }

  // Update percentage if amount is set
  if (props.position) {
    const amount = parseFloat(value)
    const maxAmount = parseFloat(fromBigInt(props.position.size, 18))
    if (maxAmount > 0) {
      const percent = (amount / maxAmount) * 100
      if (percent >= 100) {
        selectedPercentage.value = 100
      } else if (percent >= 75) {
        selectedPercentage.value = 75
      } else if (percent >= 50) {
        selectedPercentage.value = 50
      } else if (percent >= 25) {
        selectedPercentage.value = 25
      } else {
        selectedPercentage.value = null
      }
    }
  }
}

function formatPrice(value: number): string {
  if (value === 0) return '0'
  if (value < 1) {
    return value.toFixed(4)
  }
  return formatNumber(toBigInt(value.toString()), 2)
}

function formatAmount(value: bigint): string {
  if (value === BigInt(0)) return '0'
  return parseFloat(fromBigInt(value, 18))
    .toFixed(4)
    .replace(/\.?0+$/, '')
}

function formatLeverage(leverage: number): string {
  return leverage.toFixed(1)
}

function formatPercentage(value: number): string {
  return Math.abs(value).toFixed(2)
}

function getLiquiditySourceIcon(sourceId: LiquiditySourceId | undefined): string {
  if (!sourceId) {
    return '/img/liquidity/aster.svg' // Default to Aster
  }
  return `/img/liquidity/${sourceId}.svg`
}

function selectToken(token: 'USDC' | 'BNB') {
  selectedToken.value = token
  showTokenSelector.value = false
}

function handleClose() {
  // Reset form before emitting close
  closeAmount.value = ''
  selectedPercentage.value = null
  ignoreMaxSlippage.value = false
  showTokenSelector.value = false
  emit('close')
}

function handleClosePosition() {
  const closeAmountBigInt = getCloseAmountBigInt()
  if (closeAmountBigInt > BigInt(0)) {
    emit('confirm', closeAmountBigInt)
  }
}

// Watch for position changes
watch(
  () => props.position,
  (newPosition) => {
    if (newPosition) {
      // Set default to 100%
      setClosePercentage(100)
    }
  },
  { immediate: true },
)

// Watch for dialog visibility to reset and recalculate when it opens
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible && props.position) {
      // Reset form state
      closeAmount.value = ''
      selectedPercentage.value = null
      // Set default to 100% when dialog opens
      // Use nextTick to ensure reactive updates happen
      nextTick(() => {
        setClosePercentage(100)
      })
    }
  },
)

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.token-selector-container')) {
    showTokenSelector.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Dialog width override - Dialog component uses max-w-[400px] by default */
</style>

<style>
.close-position-dialog [class*='DialogPanel'] {
  width: 400px !important;
  max-width: 90vw !important;
  background-color: #1d1d1d !important;
}
</style>
