<template>
  <div class="trade-form  relative flex h-full flex-col bg-gray-800 w-[343px]">
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
                ? 'bg-green-success text-gray-1000'
                : 'text-gray-400'
            ]"
          >
            Buy / Long
          </button>
          <button
            @click="tradeSide = 'short'"
            :class="[
              'flex-1 px-0 py-2 text-sm font-medium transition w-[83px]',
              tradeSide === 'short'
                ? 'bg-red-error text-gray-1000'
                : 'text-gray-400'
            ]"
          >
            Sell / Short
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
    <div class="flex-1  px-4 pt-4 flex flex-col gap-4">
      <!-- Market Price and Order Type Row -->
      <div class="flex flex-col gap-2">
        <div class="flex gap-2">
          <!-- Market Price Input -->
          <div class="flex-1 relative">
            <div class="bg-[#272727] p-3 flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Market Price</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[18px] leading-[24px] text-[#9b9b9b] font-semibold">$</span>
                <span class="text-[18px] leading-[24px] text-[#9b9b9b] font-semibold">{{ formatPrice(displayPrice) }}</span>
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
                  <span class="text-[13px] leading-[18px] text-[#9b9b9b] text-right">Order Type</span>
                </div>
                <div class="flex items-center justify-end gap-1">
                  <span class="text-[16px] leading-[24px] text-white font-medium text-right">{{ orderType.charAt(0).toUpperCase() + orderType.slice(1) }}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </button>
              <div v-if="showOrderTypeMenu" class="absolute top-full mt-1 w-full bg-[#272727]  z-10 border border-[#373737]">
                <button
                  v-for="type in ['market', 'limit', 'stop']"
                  :key="type"
                  @click.stop="orderType = type as any; showOrderTypeMenu = false"
                  class="w-full px-3 py-2 text-left text-[16px] leading-[24px] text-white font-medium hover:bg-[#373737] transition"
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
                <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Size</span>
              </div>
              <span class="text-[13px] leading-[18px] text-[#9b9b9b] text-right">Up to: {{ maxSize }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 flex items-center">
                <input
                  v-model="size"
                  type="number"
                  step="0.001"
                  @input="handleSizeInput"
                  class="w-full bg-transparent text-[18px] leading-[24px] text-white font-semibold outline-none placeholder:text-[#545454]"
                  placeholder="0.0"
                />
              </div>
              <button
                @click="showMarketSelect = true"
                class="flex items-center gap-1 justify-end cursor-pointer hover:opacity-80 transition"
              >
                <span class="text-[16px] leading-[24px] text-white font-medium text-right">{{ selectedMarket.split('/')[0] }}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

            <div class="absolute bottom-3 left-3 flex items-center gap-3" style="width: calc(100% - 24px);">
              <!-- Percentage Display -->
              <div class="bg-[#272727] h-9 px-2 flex items-center gap-1 w-[58px]">
                <span class="text-[14px] leading-[20px] text-white font-semibold flex-1">{{ sizePercentage }}</span>
                <span class="text-[12px] leading-[16px] text-[#9b9b9b] text-right">%</span>
              </div>
              <!-- Slider -->
              <div class="relative h-4 w-[217px] px-2">
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
                  :style="{ left: sizePercentage > 50 ? `calc(${sizePercentage}% - 16px)` : `calc(${sizePercentage}%)` }"
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
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="takeProfitStopLoss"
            class="w-4 h-4 border border-[#9b9b9b] bg-transparent"
          />
          <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Take Profit / Stop Loss</span>
        </div>
        
        <!-- Take Profit / Stop Loss Inputs -->
        <div v-if="takeProfitStopLoss" class="flex gap-2 min-w-0 max-w-full">
          <!-- Take Profit Input -->
          <div class="flex-1 bg-[#272727] h-[32px] px-3 flex items-center gap-1">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b]">TP:</span>
            <span class="text-[13px] leading-[18px] text-[#9b9b9b]">{{ tradeSide === 'long' ? '≥' : '≤' }}</span>
            <span class="text-[13px] leading-[18px] text-white">$</span>
            <input
              v-model="takeProfit"
              type="number"
              step="0.01"
              placeholder="None"
              class="max-w-[80px] flex flex-1 bg-transparent text-[13px] leading-[18px] text-[#9b9b9b] outline-none placeholder:text-[#9b9b9b]"
            />
          </div>
          
          <!-- Stop Loss Input -->
          <div class="flex-1 bg-[#272727] h-[32px] px-3 flex items-center gap-1">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b]">SL:</span>
            <span class="text-[13px] leading-[18px] text-[#9b9b9b]">{{ tradeSide === 'long' ? '≤' : '≥' }}</span>
            <span class="text-[13px] leading-[18px] text-white">$</span>
            <input
              v-model="stopLoss"
              type="number"
              step="0.01"
              placeholder="None"
              class="max-w-[80px] flex flex-1 bg-transparent text-[13px] leading-[18px] text-[#9b9b9b] outline-none placeholder:text-[#9b9b9b]"
            />
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        @click="handleTrade"
        :disabled="isActionDisabled"
        :class="[
          'w-full py-[14px] text-[14px] font-medium text-center transition flex items-center justify-center',
          tradeSide === 'long' ? 'bg-green-success text-gray-1000' : 'bg-red-error text-gray-1000',
          isActionDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
        ]"
      >
        <span>{{ submitButtonLabel }}</span>
        <LoadingIcon v-if="signing" class="ml-2" :is-black="true" />
      </button>

      <!-- Trade Details Section -->
      <div class="flex flex-col gap-[8px]">
        <div
          v-for="(item, index) in tradeDetails"
          :key="index"
          class="flex items-start justify-between"
        >
          <div class="flex flex-col">
            <Tooltip :width="300" v-if="item.tooltip" :content="item.tooltip">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b] underline decoration-dotted decoration-[#9b9b9b] underline-offset-[2px]">
                {{ item.label }}
              </span>
            </Tooltip>
            <span v-else class="text-[13px] leading-[18px] text-[#9b9b9b]">
              {{ item.label }}
            </span>
            <div v-if="item.tooltip" class="h-0 relative w-full mt-0.5">
              <div class="absolute bottom-[-0.5px] left-0 right-0 top-[-0.5px] border-b border-dotted border-[#272727]"></div>
            </div>
          </div>
          <!-- Liquidity Source with icon -->
          <div v-if="(item as TradeDetailItem).key === 'liquiditySource'" class="flex items-center gap-[4px]">
            <div class="relative shrink-0 size-[16px]">
              <img
                :src="getLiquiditySourceIcon(activeLiquiditySources[0]?.id)"
                :alt="item.value"
                class="block w-full h-full object-contain"
              />
            </div>
            <span class="text-[13px] leading-[18px] text-white">{{ item.value }}</span>
          </div>
          <!-- Max. Position Slippage with edit icon -->
          <div v-else-if="(item as TradeDetailItem).key === 'maxSlippage'" class="flex items-center gap-1">
            <span class="text-[13px] leading-[18px] text-white text-right">{{ item.value }}</span>
          </div>
          <!-- Regular value -->
          <span v-else class="text-[13px] leading-[18px] text-white text-right">{{ item.value }}</span>
        </div>
      </div>

      <!-- Divider before Account Section -->
      <div class="h-px w-full bg-[#272727]"></div>

      <!-- Account Section -->
      <div class="flex flex-col gap-3 pb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-white font-semibold">Account</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <!-- Account Equity (with dropdown) -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-1 cursor-pointer" @click="showAccountBreakdown = !showAccountBreakdown">
              <div class="flex flex-col">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Account Equity</span>
                <div class="h-px w-full bg-[#272727] mt-0.5"></div>
              </div>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                class="transition-transform duration-200"
                :class="showAccountBreakdown ? 'rotate-180' : ''"
              >
                <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[13px] leading-[18px] text-white">{{ formatCurrency(accountValueUsd) }}</span>
          </div>

          <!-- Your Balance (shown when Account Equity is expanded) -->
          <div v-show="showAccountBreakdown" class="flex items-start justify-between ml-4">
            <div class="flex flex-col">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Your Balance</span>
              <div class="h-px w-full bg-[#272727] mt-0.5"></div>
            </div>
            <span class="text-[13px] leading-[18px] text-white">{{ formatCurrency(accountBalance) }}</span>
          </div>

          <!-- Unrealized PnL (shown when Account Equity is expanded) -->
          <div v-show="showAccountBreakdown" class="flex items-start justify-between ml-4">
            <div class="flex flex-col">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Unrealized PnL</span>
              <div class="h-px w-full bg-[#272727] mt-0.5"></div>
            </div>
            <span 
              class="text-[13px] leading-[18px]"
              :class="totalPnL >= 0n ? 'text-green-500' : 'text-red-500'"
            >
              {{ formatCurrency(totalPnL) }}
            </span>
          </div>

         
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-1">
              <div class="flex flex-col">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Margin Usage</span>
                <div class="h-px w-full bg-[#272727] mt-0.5"></div>
              </div>
              
            </div>
            <div class="flex flex-col items-end">
              <span class="text-[13px] leading-[18px] text-white">{{ formatCurrency(marginUsageAmount) }}</span>
              <div class="h-px w-[51px] bg-[#272727] mt-0.5"></div>
            </div>
          </div>

          <!-- Margin Usage Percentage -->
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Margin Usage</span>
              <div class="h-px w-full bg-[#272727] mt-0.5"></div>
            </div>
            <span class="text-[13px] leading-[18px] text-white">{{ formattedMarginUsage }}</span>
          </div>

          <!-- Effective Leverage -->
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Effective Leverage</span>
              <div class="h-px w-full bg-[#272727] mt-0.5"></div>
            </div>
            <span class="text-[13px] leading-[18px] text-white">{{ effectiveLeverageDisplay }}</span>
          </div>

          <!-- Cross Margin Ratio (with dropdown) -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 cursor-pointer" @click="showCrossBreakdown = !showCrossBreakdown">
              <div class="flex flex-col">
                <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Cross Margin Ratio</span>
                <div class="h-px w-full bg-[#272727] mt-0.5"></div>
              </div>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                class="transition-transform duration-200"
                :class="showCrossBreakdown ? 'rotate-180' : ''"
              >
                <path d="M4 6L8 10L12 6" stroke="#9b9b9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[13px] leading-[18px] text-[#10c8a8]">{{ formattedMarginRatio }}</span>
              <!-- Bar Chart -->
              <div class="flex items-center gap-1">
                <div class="w-0.5 h-3 bg-[#10c8a8]"></div>
                <div class="w-0.5 h-3 bg-[#323232]"></div>
                <div class="w-0.5 h-3 bg-[#323232]"></div>
                <div class="w-0.5 h-3 bg-[#323232]"></div>
              </div>
            </div>
          </div>

          <!-- Maintenance Margin (shown when Cross Margin Ratio is expanded) -->
          <div v-show="showCrossBreakdown" class="flex items-start justify-between ml-4">
            <div class="flex flex-col">
              <span class="text-[13px] leading-[18px] text-[#9b9b9b]">Maintenance Margin</span>
              <div class="h-px w-full bg-[#272727] mt-0.5"></div>
            </div>
            <span class="text-[13px] leading-[18px] text-white">{{ formatCurrency(maintenanceMarginUsd) }}</span>
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
    <MarketSelect :show="showMarketSelect" @close="showMarketSelect = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChainId, useConnection, useSignTypedData } from '@wagmi/vue'
import { useTradeStore } from '@/stores/tradeStore'
import { useEvaluationAccount } from '@/composables/useEvaluationAccount'
import { toBigInt, fromBigInt } from '@/utils/bigint'
import { formatCurrency } from '@/utils/bigint'
import MarginModeDialog from '@/components/trade/MarginModeDialog.vue'
import LiquiditySourcesDialog from '@/components/trade/LiquiditySourcesDialog.vue'
import MarketSelect from '@/components/trade/MarketSelect.vue'
import SourceLiquidityLabel from '@/components/common/SourceLiquidityLabel.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { LoadingIcon } from '@/components'
import type { LiquiditySourceId } from '@/constants/liquiditySources'

interface TradeDetailItem {
  key: string
  label: string
  value: string
  tooltip?: string
}

const tradeStore = useTradeStore()
const chainId = useChainId()
const { selectedEvaluationId } = useEvaluationAccount()
const { isConnected, address } = useConnection()
const { signTypedDataAsync } = useSignTypedData()
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
const showMarketSelect = ref(false)
const showOrderTypeMenu = ref(false)
const takeProfitStopLoss = ref(false)
const takeProfit = ref('')
const stopLoss = ref('')
const showAccountBreakdown = ref(false)
const showCrossBreakdown = ref(false)
const signing = ref(false)

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

function getLiquiditySourceIcon(sourceId: LiquiditySourceId | undefined): string {
  if (!sourceId) {
    return '/img/liquidity/aster.svg' // Default to Aster
  }
  return `/img/liquidity/${sourceId}.svg`
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

// Constants for calculations
const MAINTENANCE_MARGIN_RATE = 0.005 // 0.5% (500 bps / 10000)
const POSITION_FEE_RATE = 0.0006 // 0.060%
const SPREAD_ESTIMATE_RATE = 0.0001 // 0.01% estimated spread/price impact
const SAFE_MARGIN = 0.01 // 1% safety margin to account for price changes when using 100%

const liquidationPrice = computed(() => {
  const entryPrice = parseFloat(displayPrice.value) || 0
  
  if (entryPrice === 0 || leverage.value === 0) {
    return '--'
  }
  
  // Liquidation price calculation
  // Formula: liqPrice = entryPrice ± (entryPrice / leverage) * (1 - maintenanceMarginRate)
  // For long: price decreases, for short: price increases
  const priceAdjustment = (entryPrice / leverage.value) * (1 - MAINTENANCE_MARGIN_RATE)
  
  if (tradeSide.value === 'long') {
    const liqPrice = entryPrice - priceAdjustment
    return liqPrice > 0 ? `$${liqPrice.toFixed(2)}` : '--'
  } else {
    const liqPrice = entryPrice + priceAdjustment
    return liqPrice > 0 ? `$${liqPrice.toFixed(2)}` : '--'
  }
})

const marginRequired = computed(() => {
  const sizeNum = parseFloat(size.value) || 0
  const priceNum = parseFloat(displayPrice.value) || 0
  
  if (sizeNum === 0 || priceNum === 0 || leverage.value === 0) {
    return '--'
  }
  
  // Margin Required = Position Size * Price / Leverage
  const margin = (sizeNum * priceNum) / leverage.value
  return `$${margin.toFixed(2)}`
})

const openCost = computed(() => {
  const sizeNum = parseFloat(size.value) || 0
  const priceNum = parseFloat(displayPrice.value) || 0
  
  if (sizeNum === 0 || priceNum === 0) {
    return '--'
  }
  
  // Position fee = Asset Price * Amount * Position Fee Rate
  const positionFee = sizeNum * priceNum * POSITION_FEE_RATE
  
  // Estimated spread/price impact cost
  const spreadCost = sizeNum * priceNum * SPREAD_ESTIMATE_RATE
  
  // Total open cost
  const totalCost = positionFee + spreadCost
  return `$${totalCost.toFixed(2)}`
})

const maxROE = computed(() => {
  const sizeNum = parseFloat(size.value) || 0
  const priceNum = parseFloat(displayPrice.value) || 0
  
  if (sizeNum === 0 || priceNum === 0 || leverage.value === 0) {
    return '--'
  }
  
  // Max ROE represents the maximum profit percentage relative to margin
  // Max profit is typically: (leverage - 1) * margin, but limited by pool capacity
  // For a simplified calculation: Max ROE ≈ (leverage - 1) * 100%
  // This represents the theoretical maximum return if price moves favorably
  const theoreticalMaxRoe = (leverage.value - 1) * 100
  
  // Cap at reasonable maximum (900% as seen in mux-fe for some protocols)
  const cappedRoe = Math.min(theoreticalMaxRoe, 900)
  return `${cappedRoe.toFixed(0)}%`
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
  
  // Max size = (Available Balance * (1 - SAFE_MARGIN) * Leverage) / Price
  // SAFE_MARGIN is applied to account for price changes when using 100%
  const availableBalance = parseFloat(fromBigInt(accountBalance.value, 18))
  const safeBalance = availableBalance * (1 - SAFE_MARGIN)
  const maxSizeValue = (safeBalance * leverage.value) / priceNum
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

const isActionDisabled = computed(() => !isFormValid.value || signing.value || !isConnected.value)
const submitButtonLabel = computed(() => {
  if (signing.value) return 'Waiting for signature'
  if (!isConnected.value) return 'Connect wallet'
  if (!isFormValid.value) return 'Enter an amount'
  return `${tradeSide.value === 'long' ? 'Buy' : 'Sell'} ${selectedMarket.value.split('/')[0]}`
})

function getSignaturePrices() {
  const marketPrice = fromBigInt(currentMarketPrice.value, 2)
  const inputPrice = price.value || marketPrice
  const entryPrice = orderType.value === 'market' ? marketPrice : inputPrice
  const triggerPrice = orderType.value === 'market' ? 'market' : inputPrice
  return { entryPrice, triggerPrice }
}

async function requestTradeSignature(actionLabel: 'Open Position' | 'Place Order') {
  if (!address.value) {
    throw new Error('Wallet not connected')
  }

  const { entryPrice, triggerPrice } = getSignaturePrices()
  const baseAsset = selectedMarket.value.split('/')[0] || ''
  const messageLines = [
    'Trade Confirmation',
    `Action: ${actionLabel}`,
    `Account: ${selectedEvaluationId.value ?? 'N/A'}`,
    `Market: ${selectedMarket.value}`,
    `Side: ${tradeSide.value}`,
    `Order Type: ${orderType.value}`,
    `Size: ${size.value || '0'} ${baseAsset}`,
    `Price: $${entryPrice}`,
    `Leverage: ${leverage.value}x`,
  ]

  if (orderType.value !== 'market') {
    messageLines.push(`Trigger: $${triggerPrice}`)
  }

  const contents = `${messageLines.join('\n')}\n\n.`

  // Ensure leverage is a safe integer and convert to BigInt via string to avoid precision issues
  const leverageValue = Math.max(1, Math.floor(leverage.value))
  if (!Number.isSafeInteger(leverageValue)) {
    throw new Error(`Leverage value ${leverageValue} is not a safe integer`)
  }
  // Convert to BigInt - viem accepts BigInt for uint256 types
  const leverageBigInt = BigInt(leverageValue.toString())
  
  await signTypedDataAsync({
    types: {
      Person: [{ name: 'wallet', type: 'address' }],
      Trade: [
        { name: 'account', type: 'Person' },
        { name: 'action', type: 'string' },
        { name: 'market', type: 'string' },
        { name: 'side', type: 'string' },
        { name: 'orderType', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'price', type: 'string' },
        { name: 'triggerPrice', type: 'string' },
        { name: 'leverage', type: 'uint256' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Trade',
    message: {
      account: {
        wallet: address.value,
      },
      action: actionLabel,
      market: selectedMarket.value,
      side: tradeSide.value,
      orderType: orderType.value,
      size: size.value || '0',
      price: entryPrice,
      triggerPrice,
      leverage: leverageBigInt,
      contents,
    },
  } as any)
}

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

/**
 * Handles trade execution
 * 
 * Note: All positions and orders are automatically saved to LocalStorage
 * through the tradeStore methods (openPosition, placeOrder).
 * Storage is keyed by wallet address and persists across page reloads.
 * 
 * Storage management methods available via tradeStore:
 * - clearPositions(), removePosition(id), removePositionsByMarket(market), etc.
 * - clearOrders(), removeOrder(id), removeOrdersByMarket(market), etc.
 */
async function handleTrade() {
  if (!isFormValid.value || !address.value) return

  const sizeValue = toBigInt(size.value)
  const collateralValue = calculatedCollateral.value
  const actionLabel: 'Open Position' | 'Place Order' = orderType.value === 'market' ? 'Open Position' : 'Place Order'

  signing.value = true

  try {
    await requestTradeSignature(actionLabel)

    if (orderType.value === 'market') {
      const currentLiquiditySource = tradeStore.getLiquiditySourceFromOracle(tradeStore.selectedOracle)
      
      // This automatically saves to LocalStorage via useUserPositionsStorage
      tradeStore.openPosition(
        selectedMarket.value,
        tradeSide.value,
        sizeValue,
        currentMarketPrice.value,
        leverage.value,
        collateralValue,
        chainId.value,
        currentLiquiditySource,
        selectedEvaluationId.value ?? undefined
      )

      size.value = ''
      sizePercentage.value = 0
    } else {
      const triggerPrice = toBigInt(price.value)
      const currentLiquiditySource = tradeStore.getLiquiditySourceFromOracle(tradeStore.selectedOracle)
      
      // This automatically saves to LocalStorage via useUserOrdersStorage
      tradeStore.placeOrder(
        selectedMarket.value,
        tradeSide.value,
        sizeValue,
        triggerPrice,
        orderType.value as 'limit' | 'stop',
        chainId.value,
        currentLiquiditySource,
        selectedEvaluationId.value ?? undefined
      )

      price.value = ''
      size.value = ''
      sizePercentage.value = 0
    }
  } catch (error) {
    console.error('Trade signing failed:', error)
  } finally {
    signing.value = false
  }
}

// Account section calculations
const collateralLocked = computed(() => {
  return positions.value.reduce((sum, pos) => sum + pos.collateral, BigInt(0))
})

const accountValueUsd = computed(() => accountBalance.value + totalPnL.value)

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

// Trade Details array
const tradeDetails = computed((): TradeDetailItem[] => {
  // Get the first active liquidity source name, default to 'Aster'
  const liquiditySourceName = activeLiquiditySources.value.length > 0 
    ? activeLiquiditySources.value[0].name 
    : 'Aster'

  return [
    {
      key: 'availableMargin',
      label: 'Available Margin',
      value: formatCurrency(accountBalance.value)
    },
    {
      key: 'availableLiquidity',
      label: 'Available Liquidity',
      value: availableLiquidity.value
    },
    {
      key: 'liquiditySource',
      label: 'Liquidity Source',
      value: liquiditySourceName,
      tooltip: `Traders can long up to 1,458.89 ETH at this moment.

The available liquidity will change as the long positions open interest change.

You can customize your preferred liquidity sources under Trading Settings if needed.`
    },
    {
      key: 'priceImpact',
      label: 'Price Impact',
      value: '0%'
    },
    {
      key: 'maxSlippage',
      label: 'Max. Position Slippage',
      value: '≤ 1.000%',
    },
    {
      key: 'liqPrice',
      label: 'Liq. Price',
      value: liquidationPrice.value,
      tooltip: 'Please note when you use volatile assets as collateral, the liquidation price will be affected by both collateral and underlying asset prices.' 
    },
    {
      key: 'marginRequired',
      label: 'Margin Required',
      value: marginRequired.value,
      tooltip: 'The margin required to be allocated from your cross account equity for opening this position.'
    },
    {
      key: 'openCost',
      label: 'Open Cost',
      value: openCost.value,
      tooltip: `The position fee will be collected when you open and close a position; it will be deducted from your collateral when opening the position and will be preferentially deducted from the profits when closing the position. 

Position Fee = Asset Price * Amount * Position Fee Rate. The position fee rate is fixed at 0.060%.

Additional costs from spread and/or price impact will also be applied.

Funding fee for each position will be tracked every 1 hour and settled as funding fees when you add changes to your positions.`
    },
    {
      key: 'maxROE',
      label: 'Max. ROE',
      value: maxROE.value,
      tooltip: 'Max. ROE (Return on Equity) represents the maximum profit percentage you can achieve relative to your margin. When the Max. ROE is reached, the position may be automatically closed by the pool\'s Auto-Deleveraging (ADL) setup.'
    }
  ]
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
