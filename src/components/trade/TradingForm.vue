<template>
  <div class="trade-form relative flex h-full flex-col bg-gray-800 w-[343px]">
    <!-- Header Section -->
    <div class="flex items-center gap-4 px-4 pt-3 pb-2">
      <div class="flex items-center gap-4">
        <!-- Buy/Long and Sell/Short Tabs -->
        <div class="flex bg-[#272727]">
          <button
            @click="tradeSide = 'long'"
            :class="[
              'flex-1 px-0 py-2 text-sm font-medium transition w-[83px]',
              tradeSide === 'long'
                ? 'bg-[#10c8a8] text-neutral-950'
                : 'text-[#9b9b9b]'
            ]"
          >
            Buy/Long
          </button>
          <button
            @click="tradeSide = 'short'"
            :class="[
              'flex-1 px-0 py-2 text-sm font-medium transition w-[83px]',
              tradeSide === 'short'
                ? 'bg-[#10c8a8] text-neutral-950'
                : 'text-[#9b9b9b]'
            ]"
          >
            Sell/Short
          </button>
        </div>
        
        <!-- Cross Leverage Display (Clickable Button) -->
        <button
          @click="showMarginModeDialog = true"
          class="flex items-center justify-center text-sm font-medium text-white w-20 hover:opacity-80 transition"
        >
          {{ marginModeLabel }}
        </button>
        
        <!-- Divider -->
        <div class="h-5 w-px bg-[#272727]"></div>
        
        <!-- Settings Icon -->
        <button
          @click="showLiquiditySourcesDialog = true"
          class="flex items-center justify-center w-4 h-4 text-[#9b9b9b] hover:text-white transition"
        >
          <i class="iconfont icon-setting-2"></i>
        </button>
      </div>
    </div>

    <!-- Divider Line -->
    <div class="h-px w-full bg-[#272727]"></div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto px-4 pt-4 flex flex-col gap-4">
      <!-- Market Price and Order Type Row -->
      <div class="flex flex-col gap-2">
        <div class="flex gap-2">
          <!-- Market Price Input -->
          <div class="flex-1 relative">
            <div class="bg-[#272727] p-3 flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Market Price</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[18px] leading-[24px] text-[#9b9b9b] font-semibold font-['IBM_Plex_Sans',sans-serif]">$</span>
                <span class="text-[18px] leading-[24px] text-[#9b9b9b] font-semibold font-['IBM_Plex_Sans',sans-serif]">{{ formatPrice(displayPrice) }}</span>
              </div>
            </div>
            <!-- Source Liquidity Label -->
            <SourceLiquidityLabel
              class="top-0 right-0"
            />
          </div>

          <!-- Order Type Dropdown -->
          <div class="flex flex-col gap-1 items-end justify-center">
            <div class="relative w-[151.5px] order-type-dropdown">
              <button
                @click.stop="showOrderTypeMenu = !showOrderTypeMenu"
                class="w-full bg-[#272727] p-3 flex flex-col gap-2 text-left"
              >
                <div class="flex items-center justify-end">
                  <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif] text-right">Order Type</span>
                </div>
                <div class="flex items-center justify-end gap-1">
                  <span class="text-[16px] leading-[24px] text-white font-medium font-['IBM_Plex_Sans',sans-serif] text-right">{{ orderType.charAt(0).toUpperCase() + orderType.slice(1) }}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </button>
              <div v-if="showOrderTypeMenu" class="absolute top-full mt-1 w-full bg-[#272727] overflow-hidden z-10 border border-[#373737]">
                <button
                  v-for="type in ['market', 'limit', 'stop']"
                  :key="type"
                  @click.stop="orderType = type as any; showOrderTypeMenu = false"
                  class="w-full px-3 py-2 text-left text-[16px] leading-[24px] text-white font-medium font-['IBM_Plex_Sans',sans-serif] hover:bg-[#373737] transition"
                >
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Size Input with Slider -->
        <div class="flex flex-col gap-2">
          <!-- Leverage Slider Container -->
          <div class="bg-[#373737] h-[134px] relative w-[311px]">
            <div class="bg-[#272727] p-3 flex flex-col gap-2 w-[311px]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Size</span>
              </div>
              <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif] text-right">Up to: {{ maxSize }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 flex items-center">
                <input
                  v-model="size"
                  type="number"
                  step="0.001"
                  @input="handleSizeInput"
                  class="w-full bg-transparent text-[18px] leading-[24px] text-[#545454] font-semibold font-['IBM_Plex_Sans',sans-serif] outline-none placeholder:text-[#545454]"
                  placeholder="0.0"
                />
              </div>
              <div class="flex items-center gap-1 justify-end">
                <span class="text-[16px] leading-[24px] text-white font-medium font-['IBM_Plex_Sans',sans-serif] text-right">{{ selectedMarket.split('/')[0] }}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

            <div class="absolute bottom-3 left-3 flex items-center gap-3" style="width: calc(100% - 24px);">
              <!-- Percentage Display -->
              <div class="bg-[#272727] h-9 px-2 flex items-center gap-1 w-[58px]">
                <span class="text-[14px] leading-[20px] text-white font-semibold font-['IBM_Plex_Sans',sans-serif] flex-1">{{ sizePercentage }}</span>
                <span class="text-[12px] leading-[16px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif] text-right">%</span>
              </div>
              <!-- Slider -->
              <div class="relative h-4 w-[217px]">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full h-1 bg-[#323232] rounded-full relative">
                    <div 
                      class="absolute left-0 top-0 h-full bg-[#10c8a8] rounded-full"
                      :style="{ width: `${sizePercentage}%` }"
                    ></div>
                    <!-- Slider markers -->
                    <div class="absolute inset-0 flex justify-between items-center pointer-events-none">
                      <div class="w-1 h-1 rounded-full bg-[#9b9b9b]"></div>
                      <div class="w-1 h-1 rounded-full bg-[#9b9b9b]"></div>
                      <div class="w-1 h-1 rounded-full bg-[#9b9b9b]"></div>
                      <div class="w-1 h-1 rounded-full bg-[#9b9b9b]"></div>
                      <div class="w-1 h-1 rounded-full bg-[#9b9b9b]"></div>
                    </div>
                  </div>
                </div>
                <input
                  v-model.number="sizePercentage"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-10"
                  @input="handlePercentageChange"
                />
                <div 
                  class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none z-20"
                  :style="{ left: `calc(${sizePercentage}% - 8px)` }"
                >
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#323232] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Size Input Box -->
          
        </div>
      </div>

      <!-- Take Profit / Stop Loss Checkbox -->
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          v-model="takeProfitStopLoss"
          class="w-4 h-4 border border-[#9b9b9b] bg-transparent"
        />
        <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Take Profit / Stop Loss</span>
      </div>

      <!-- Action Button -->
      <button
        @click="handleTrade"
        :disabled="!isFormValid"
        :class="[
          'w-full py-[14px] text-[14px] font-medium text-center transition',
          isFormValid
            ? 'bg-[#10c8a8] text-neutral-950 opacity-100'
            : 'bg-[#10c8a8] text-neutral-950 opacity-50 cursor-not-allowed'
        ]"
      >
        {{ isFormValid ? `${tradeSide === 'long' ? 'Buy' : 'Sell'} ${selectedMarket.split('/')[0]}` : 'Enter an amount' }}
      </button>

      <!-- Trade Details Section -->
      <div class="flex flex-col gap-2">
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Available Margin</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif]">{{ formatCurrency(accountBalance) }}</span>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Available Liquidity</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif]">{{ availableLiquidity }}</span>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Liquidity Source</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <div class="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 0L4.61803 2.76393L7.23607 1.23607L5.70811 3.8541L8.47214 4.47214L5.70811 5.09018L7.23607 7.70821L4.61803 6.18025L4 8.94428L3.38197 6.18025L0.763932 7.70821L2.29189 5.09018L-0.472136 4.47214L2.29189 3.8541L0.763932 1.23607L3.38197 2.76393L4 0Z" fill="#FFD700"/>
            </svg>
            <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif]">Aster</span>
          </div>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Price Impact</span>
          </div>
          <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif] text-right">0%</span>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Max. Position Slippage</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif] text-right">≤ 1.000%</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.3333 4.66667L4.66667 11.3333M4.66667 4.66667L11.3333 11.3333" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Liq. Price</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif] text-right">--</span>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Margin Required</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif] text-right">--</span>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Open Cost</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif] text-right">--</span>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Max. ROE</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif] text-right">--</span>
        </div>
      </div>

      <!-- Divider before Account Section -->
      <div class="h-px w-full bg-[#272727]"></div>

      <!-- Account Section -->
      <div class="flex flex-col gap-3 pb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-white font-semibold font-['IBM_Plex_Sans',sans-serif]">Account</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <!-- Margin Usage (with dropdown) -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-1">
              <div class="flex flex-col">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Margin Usage</span>
                <div class="h-px w-full bg-[#272727] mt-0.5"></div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif]">{{ formatCurrency(marginUsageAmount) }}</span>
              <div class="h-px w-[51px] bg-[#272727] mt-0.5"></div>
            </div>
          </div>

          <!-- Margin Usage Percentage -->
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Margin Usage</span>
              <div class="h-px w-full bg-[#272727] mt-0.5"></div>
            </div>
            <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif]">{{ formattedMarginUsage }}</span>
          </div>

          <!-- Effective Leverage -->
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Effective Leverage</span>
              <div class="h-px w-full bg-[#272727] mt-0.5"></div>
            </div>
            <span class="text-[13px] leading-[18px] text-white font-['IBM_Plex_Sans',sans-serif]">{{ effectiveLeverageDisplay }}</span>
          </div>

          <!-- Cross Margin Ratio -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="flex flex-col">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Cross Margin Ratio</span>
                <div class="h-px w-full bg-[#272727] mt-0.5"></div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[13px] leading-[18px] text-[#10c8a8] font-['IBM_Plex_Sans',sans-serif]">{{ formattedMarginRatio }}</span>
              <!-- Bar Chart -->
              <div class="flex items-center gap-1">
                <div class="w-0.5 h-3 bg-[#10c8a8]"></div>
                <div class="w-0.5 h-3 bg-[#323232]"></div>
                <div class="w-0.5 h-3 bg-[#323232]"></div>
                <div class="w-0.5 h-3 bg-[#323232]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTradeStore } from '@/stores/tradeStore'
import { toBigInt, fromBigInt } from '@/utils/bigint'
import { formatCurrency } from '@/utils/bigint'
import MarginModeDialog from '@/components/trade/MarginModeDialog.vue'
import LiquiditySourcesDialog from '@/components/trade/LiquiditySourcesDialog.vue'
import SourceLiquidityLabel from '@/components/common/SourceLiquidityLabel.vue'
import type { LiquiditySourceId } from '@/constants/liquiditySources'

const tradeStore = useTradeStore()
const {
  selectedMarket,
  accountBalance,
  currentMarketPrice,
  liquiditySources,
  activeLiquiditySources,
  positions,
  totalPnL
} = storeToRefs(tradeStore)

const tradeSide = ref<'long' | 'short'>('long')
const orderType = ref<'market' | 'limit' | 'stop'>('market')
const price = ref('')
const size = ref('')
const sizePercentage = ref(0)
const leverage = ref(10)
const showMarginModeDialog = ref(false)
const showLiquiditySourcesDialog = ref(false)
const showOrderTypeMenu = ref(false)
const takeProfitStopLoss = ref(false)

const marginSetting = computed(() => tradeStore.getMarginSetting(selectedMarket.value))
const activeLiquiditySourcesCount = computed(() => activeLiquiditySources.value.length)
const liquiditySourcesTotal = computed(() => liquiditySources.value.length)

const currentMarginModeType = computed(() => marginSetting.value.mode)
const currentLeverageFromMode = computed(() => marginSetting.value.leverage ?? leverage.value ?? 5)
const marginModeLabel = computed(() => {
  if (marginSetting.value.mode === 'cross') {
    const lev = marginSetting.value.leverage ?? 5
    return `Cross: ${lev}x`
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

function formatPrice(price: string): string {
  const num = parseFloat(price) || 0
  return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

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

const availableLiquidity = computed(() => {
  const priceNum = parseFloat(displayPrice.value) || 0
  if (priceNum === 0) return '0.0 ETH'
  const availableBalance = parseFloat(fromBigInt(accountBalance.value, 18))
  return `${availableBalance.toFixed(4)} ${selectedMarket.value.split('/')[0]}`
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

// Account section calculations
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

const effectiveLeverageDisplay = computed(() => `${effectiveLeverage.value.toFixed(0)}x`)
const formattedMarginUsage = computed(() => `${marginUsagePercent.value.toFixed(2)}%`)
const formattedMarginRatio = computed(() => `${marginRatioPercent.value.toFixed(2)}%`)

const marginUsageAmount = computed(() => {
  return collateralLocked.value
})

// Close order type menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.order-type-dropdown')) {
    showOrderTypeMenu.value = false
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
.trade-form {
  font-family: 'IBM Plex Sans', sans-serif;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #9b9b9b;
  border-radius: 2px;
  background: transparent;
  cursor: pointer;
  position: relative;
}

input[type='checkbox']:checked {
  background: #10c8a8;
  border-color: #10c8a8;
}

input[type='checkbox']:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}
</style>
