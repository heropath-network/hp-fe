<template>
  <div class="flex h-full flex-col bg-gray-950 pb-8">
    <div class="flex items-center border-b border-gray-800">
      <button
        @click="tradeSide = 'long'"
        :class="[
          'flex-1 py-3 text-sm font-semibold transition',
          tradeSide === 'long'
            ? 'border-b-2 border-green-500 text-green-500'
            : 'text-gray-400 hover:text-gray-300'
        ]"
      >
        Long
      </button>
      <button
        @click="tradeSide = 'short'"
        :class="[
          'flex-1 py-3 text-sm font-semibold transition',
          tradeSide === 'short'
            ? 'border-b-2 border-red-500 text-red-500'
            : 'text-gray-400 hover:text-gray-300'
        ]"
      >
        Short
      </button>
      <div class="mx-3 h-6 w-px bg-gray-800"></div>
      <button
        @click="showMarginModeDialog = true"
        class="flex items-center gap-1 py-3 px-4 text-sm font-medium text-white transition hover:text-gray-300"
      >
        <span>{{ marginModeLabel }}</span>
      </button>
      <div class="mx-1 h-6 w-px bg-gray-800"></div>
      <button
        @click="showLiquiditySourcesDialog = true"
        class="flex items-center gap-2 py-3 px-4 text-sm font-medium text-white transition hover:text-gray-300"
      >
        <span>Settings</span>
        <span class="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-normal text-gray-300">
          {{ activeLiquiditySourcesCount }} / {{ liquiditySourcesTotal }}
        </span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div class="mb-4">
        <label class="mb-2 block text-xs font-medium text-gray-400">Order Type</label>
        <select
          v-model="orderType"
          class="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white transition focus:border-blue-500 focus:outline-none"
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop">Stop</option>
        </select>
      </div>

      <div v-if="orderType !== 'market'" class="mb-4">
        <label class="mb-2 block text-xs font-medium text-gray-400">
          {{ orderType === 'limit' ? 'Limit Price' : 'Stop Price' }}
        </label>
        <div class="relative">
          <input
            v-model="price"
            type="number"
            step="0.01"
            class="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 pr-12 text-sm text-white transition focus:border-blue-500 focus:outline-none"
            placeholder="0.00"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">USD</span>
        </div>
      </div>

      <div class="mb-4">
        <label class="mb-2 block text-xs font-medium text-gray-400">Size</label>
        <div class="relative">
          <div class="mb-1 text-xs text-gray-500">Up To: {{ maxSize }}</div>
          <input
            v-model="size"
            type="number"
            step="0.001"
            class="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 pr-16 text-sm text-white transition focus:border-blue-500 focus:outline-none"
            placeholder="0.0"
            @input="handleSizeInput"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <select
              class="appearance-none bg-transparent text-xs text-gray-500 focus:outline-none"
              disabled
            >
              <option>{{ selectedMarket.split('/')[0] }}</option>
            </select>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <div class="flex h-8 min-w-[4rem] items-center justify-center rounded-lg bg-gray-900 px-2 text-sm font-medium text-white">
            {{ sizePercentage }}%
          </div>
          <div class="relative flex-1">
            <div class="relative h-2 w-full rounded-lg bg-gray-800 overflow-hidden">
              <div
                class="absolute left-0 top-0 h-full bg-cyan-500 transition-all duration-150"
                :style="{ width: `${sizePercentage}%` }"
              ></div>
              <div class="absolute left-0 top-0 flex h-2 w-full justify-between pointer-events-none">
                <span class="h-2 w-0.5 bg-gray-700"></span>
                <span class="h-2 w-0.5 bg-gray-700"></span>
                <span class="h-2 w-0.5 bg-gray-700"></span>
                <span class="h-2 w-0.5 bg-gray-700"></span>
                <span class="h-2 w-0.5 bg-gray-700"></span>
              </div>
            </div>
            <input
              v-model.number="sizePercentage"
              type="range"
              min="0"
              max="100"
              step="25"
              class="size-percentage-slider absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent"
              @input="handlePercentageChange"
            />
          </div>
        </div>
      </div>

      <div v-if="marginSetting.mode !== 'cross'" class="mb-4">
        <div class="mb-2 flex items-center justify-between">
          <label class="text-xs font-medium text-gray-400">Leverage</label>
          <span class="text-sm font-semibold text-white">{{ leverage }}x</span>
        </div>
        <input
          v-model="leverage"
          type="range"
          min="1"
          max="100"
          step="1"
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-800"
        />
        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>1x</span>
          <span>25x</span>
          <span>50x</span>
          <span>100x</span>
        </div>
      </div>


      <div class="mb-4 space-y-2 rounded-lg border border-gray-800 bg-gray-900 p-3 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-400">Entry Price</span>
          <span class="font-medium text-white">${{ displayPrice }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Position Size</span>
          <span class="font-medium text-white">${{ positionSizeUSD }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Liquidation Price</span>
          <span class="font-medium text-red-400">${{ liquidationPrice }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Fee (0.1%)</span>
          <span class="font-medium text-white">${{ tradingFee }}</span>
        </div>
      </div>

      <button
        @click="handleTrade"
        :disabled="!isFormValid"
        :class="[
          'w-full rounded-lg py-3 text-sm font-semibold transition',
          isFormValid
            ? tradeSide === 'long'
              ? 'bg-green-600 text-white hover:bg-green-500'
              : 'bg-red-600 text-white hover:bg-red-500'
            : 'cursor-not-allowed bg-gray-800 text-gray-600'
        ]"
      >
        {{
          orderType === 'market'
            ? `${tradeSide === 'long' ? 'Long' : 'Short'} ${selectedMarket}`
            : `Place ${orderType} Order`
        }}
      </button>

      <AccountDataCard class="mt-4" />
    </div>

    <MarginModeDialog
      :show="showMarginModeDialog"
      :market="selectedMarket"
      :margin-mode="currentMarginModeType"
      :leverage="currentLeverageFromMode"
      @close="showMarginModeDialog = false"
      @confirm="handleMarginModeConfirm"
    />
    <LiquiditySourcesDialog
      :show="showLiquiditySourcesDialog"
      :trade-side="tradeSide"
      :sources="liquiditySources"
      @close="showLiquiditySourcesDialog = false"
      @toggle="handleLiquiditySourceToggle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTradeStore } from '@/stores/tradeStore'
import { toBigInt, fromBigInt } from '@/utils/bigint'
import MarginModeDialog from '@/components/trade/MarginModeDialog.vue'
import LiquiditySourcesDialog from '@/components/trade/LiquiditySourcesDialog.vue'
import AccountDataCard from '@/components/trade/AccountDataCard.vue'
import type { LiquiditySourceId } from '@/constants/liquiditySources'

const tradeStore = useTradeStore()
const {
  selectedMarket,
  accountBalance,
  currentMarketPrice,
  liquiditySources,
  activeLiquiditySources
} = storeToRefs(tradeStore)

const tradeSide = ref<'long' | 'short'>('long')
const orderType = ref<'market' | 'limit' | 'stop'>('market')
const price = ref('')
const size = ref('')
const sizePercentage = ref(0)
const leverage = ref(10)
const showMarginModeDialog = ref(false)
const showLiquiditySourcesDialog = ref(false)

const marginSetting = computed(() => tradeStore.getMarginSetting(selectedMarket.value))
const activeLiquiditySourcesCount = computed(() => activeLiquiditySources.value.length)
const liquiditySourcesTotal = computed(() => liquiditySources.value.length)

const currentMarginModeType = computed(() => marginSetting.value.mode)
const currentLeverageFromMode = computed(() => marginSetting.value.leverage ?? leverage.value ?? 5)
const marginModeLabel = computed(() => {
  if (marginSetting.value.mode === 'cross') {
    const lev = marginSetting.value.leverage ?? 5
    return `Cross ${lev}x`
  }
  return 'Isolated'
})

function handleLiquiditySourceToggle(id: LiquiditySourceId) {
  tradeStore.toggleLiquiditySource(id)
}

function handleMarginModeConfirm(data: { marginMode: 'isolated' | 'cross'; leverage: number }) {
  const setting = {
    mode: data.marginMode,
    leverage: data.leverage
  }

  tradeStore.setMarginSetting(selectedMarket.value, setting)

  if (data.marginMode === 'cross') {
    leverage.value = data.leverage
  }
}

watch(marginSetting, (setting) => {
  if (setting.mode === 'cross') {
    leverage.value = setting.leverage ?? leverage.value
  }
})

const displayPrice = computed(() => {
  if (orderType.value === 'market') {
    return fromBigInt(currentMarketPrice.value, 2)
  }
  return price.value || '0.00'
})

const positionSizeUSD = computed(() => {
  const sizeNum = parseFloat(size.value) || 0
  const priceNum = parseFloat(displayPrice.value) || 0
  return (sizeNum * priceNum * leverage.value).toFixed(2)
})

const liquidationPrice = computed(() => {
  const entryPrice = parseFloat(displayPrice.value) || 0
  const adjustmentFactor = entryPrice / leverage.value
  
  if (tradeSide.value === 'long') {
    return (entryPrice - adjustmentFactor).toFixed(2)
  } else {
    return (entryPrice + adjustmentFactor).toFixed(2)
  }
})

const tradingFee = computed(() => {
  const posSize = parseFloat(positionSizeUSD.value) || 0
  return (posSize * 0.001).toFixed(2)
})

const calculatedCollateral = computed(() => {
  const sizeNum = parseFloat(size.value) || 0
  const priceNum = parseFloat(displayPrice.value) || 0
  if (sizeNum === 0 || priceNum === 0) return BigInt(0)
  
  // Collateral = (Size * Price) / Leverage
  const positionValue = sizeNum * priceNum
  const collateralAmount = positionValue / leverage.value
  return BigInt(Math.floor(collateralAmount * 10 ** 18))
})

const maxSize = computed(() => {
  const priceNum = parseFloat(displayPrice.value) || 0
  if (priceNum === 0) return '0.0'
  
  // Max size = (Available Balance * Leverage) / Price
  const availableBalance = parseFloat(fromBigInt(accountBalance.value, 18))
  const maxSizeValue = (availableBalance * leverage.value) / priceNum
  return maxSizeValue.toFixed(4)
})

const isFormValid = computed(() => {
  const hasSize = parseFloat(size.value) > 0
  const hasPrice = orderType.value === 'market' || parseFloat(price.value) > 0
  const sufficientBalance = calculatedCollateral.value <= accountBalance.value
  
  return hasSize && hasPrice && sufficientBalance
})

function handlePercentageChange() {
  const maxSizeNum = parseFloat(maxSize.value) || 0
  if (maxSizeNum === 0) return
  
  const newSize = (maxSizeNum * sizePercentage.value) / 100
  size.value = newSize.toFixed(4)
}

function handleSizeInput() {
  const maxSizeNum = parseFloat(maxSize.value) || 0
  const currentSize = parseFloat(size.value) || 0
  
  if (maxSizeNum === 0) {
    sizePercentage.value = 0
    return
  }
  
  const percentage = (currentSize / maxSizeNum) * 100
  sizePercentage.value = Math.min(100, Math.max(0, Math.round(percentage)))
}

watch([maxSize, leverage, displayPrice], () => {
  // Recalculate percentage when max size changes
  if (size.value) {
    handleSizeInput()
  }
})

function handleTrade() {
  if (!isFormValid.value) return

  const sizeValue = toBigInt(size.value)
  const collateralValue = calculatedCollateral.value
  
  if (orderType.value === 'market') {
    // Open position immediately
    tradeStore.openPosition(
      selectedMarket.value,
      tradeSide.value,
      sizeValue,
      currentMarketPrice.value,
      leverage.value,
      collateralValue
    )

    size.value = ''
    sizePercentage.value = 0
  } else {
    const triggerPrice = toBigInt(price.value)
    tradeStore.placeOrder(
      selectedMarket.value,
      tradeSide.value,
      sizeValue,
      triggerPrice,
      orderType.value as 'limit' | 'stop'
    )

    price.value = ''
    size.value = ''
    sizePercentage.value = 0
  }
}
</script>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  height: 1rem;
  width: 1rem;
  cursor: pointer;
  appearance: none;
  border-radius: 9999px;
  background-color: #2563eb;
}

input[type='range']::-moz-range-thumb {
  height: 1rem;
  width: 1rem;
  cursor: pointer;
  appearance: none;
  border: none;
  border-radius: 9999px;
  background-color: #2563eb;
}

.size-percentage-slider::-webkit-slider-thumb {
  height: 1rem;
  width: 1rem;
  cursor: pointer;
  appearance: none;
  border-radius: 9999px;
  background-color: #1f2937;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.size-percentage-slider::-moz-range-thumb {
  height: 1rem;
  width: 1rem;
  cursor: pointer;
  appearance: none;
  border: 2px solid white;
  border-radius: 9999px;
  background-color: #1f2937;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
</style>

