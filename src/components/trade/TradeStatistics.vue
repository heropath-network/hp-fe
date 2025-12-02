<template>
  <div class="flex items-center h-16 bg-[var(--hp-bg-dark)] border-b border-gray-800 px-4">
    <!-- Market Info Section -->
    <div class="flex items-center min-w-[160px]">
      <button
        @click="$emit('openMarketSelect')"
        class="flex items-center gap-3 text-white hover:text-blue-400 transition-colors cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <MarketIcon :symbol="selectedMarket" :size="32" />
          <div class="flex flex-col text-left">
            <div class="flex items-center gap-1">
              <span class="text-base font-semibold leading-[24px] text-white">{{ selectedMarket }}</span>
            </div>
            <span class="text-xs mt-[2px] leading-[16px] text-gray-400">Up to {{ maxLeverage }}X</span>
          </div>
        </div>
        <svg class="ml-3 h-4 w-4 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <!-- Divider -->
      <div class="h-16 mx-4 w-px border-l border-gray-800"></div>
    </div>

    <!-- Statistics Row -->
    <div class="flex items-center flex-1 overflow-x-auto">
      <div class="flex items-center gap-4">
        <!-- Price Box -->
        <div class="flex items-center justify-center min-w-[170px]">
          <div class="flex items-center">
            <div v-if="isLoadingMarkPrice && !isMarketClosed" class="h-7 w-24 animate-pulse rounded bg-gray-700"></div>
            <div v-else-if="isMarketClosed" class="text-xl font-semibold text-gray-400">Closed</div>
            <div v-else class="text-xl font-semibold text-white">
              ${{ formattedPrice }}
            </div>
            <div
              v-if="!isMarketClosed && !isLoadingPriceChange && !isLoadingMarkPrice"
              :class="[
                'ml-2 text-base font-medium',
                priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
              ]"
            >
              ({{ priceChange24h >= 0 ? '+' : '' }}{{ priceChange24h.toFixed(2) }}%)
            </div>
            <div
              v-else-if="!isMarketClosed && isLoadingPriceChange"
              class="ml-2 h-4 w-16 animate-pulse rounded bg-gray-700"
            ></div>
          </div>
        </div>

        <div class="h-5 w-px bg-gray-800"></div>

        <!-- Est. 1H Funding (L/S) -->
        <div class="flex flex-col min-w-[100px]">
          <div class="text-xs text-gray-400 mb-1">Est. 1H Funding (L/S)</div>
          <div class="text-xs text-white">
            <span v-if="isLoadingFunding">
              <div class="h-3 w-20 animate-pulse rounded bg-gray-700"></div>
            </span>
            <span v-else>
              {{ formatPercentage(longFunding) }}% / {{ formatPercentage(shortFunding) }}%
            </span>
          </div>
        </div>

        <div class="h-5 w-px bg-gray-800"></div>

        <!-- Long / Short (Aggregator) -->
        <div class="flex flex-col min-w-[118px]">
          <Tooltip :content="openInterestTooltip">
            <div class="text-xs text-gray-400 mb-1 cursor-help">
              Long / Short (Aggregator)
            </div>
          </Tooltip>
          <div class="text-xs text-white">
            <span v-if="isLoadingOpenInterest">
              <div class="h-3 w-20 animate-pulse rounded bg-gray-700"></div>
            </span>
            <span v-else>
              ${{ formatNumber(longOpenInterest) }} / ${{ formatNumber(shortOpenInterest) }}
            </span>
          </div>
        </div>

        <div class="h-5 w-px bg-gray-800"></div>

        <!-- 24H High / Low -->
        <div class="flex flex-col min-w-[100px]">
          <div class="text-xs text-gray-400 mb-1">24H High / Low</div>
          <div class="text-xs text-white">
            <span v-if="isLoadingHighLow">
              <div class="h-3 w-20 animate-pulse rounded bg-gray-700"></div>
            </span>
            <span v-else>
              ${{ high24h }} / ${{ low24h }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Source Selector -->
    <div class="flex items-center">
      <div class="flex flex-col">
        <div class="text-xs text-gray-400 mb-1 text-right">Chart Source</div>
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton
              class="flex items-center justify-end gap-1 px-2 text-xs text-gray-300  focus:outline-none"
            >
              <div class="relative h-4 w-4 shrink-0">
                <img
                  :src="getChartSourceIcon(selectedOracleName || 'Auto Match')"
                  :alt="selectedOracleName || 'Auto Match'"
                  class="h-full w-full object-contain"
                />
              </div>
              <span class="text-xs text-white">{{ selectedOracleName || 'Auto Match' }}</span>
              <i class="iconfont icon-down text-white"></i>
            </MenuButton>
          </div>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 z-10 mt-2 w-40 origin-top-right bg-gray-800 shadow-lg focus:outline-none"
            >
              <div class="py-1">
                <MenuItem
                  v-for="oracle in allOracleOptions"
                  :key="oracle.value"
                  v-slot="{ active }"
                >
                  <button
                    @click="handleOracleSelect(oracle.value)"
                    :class="[
                      active ? 'bg-gray-800 text-gray-200' : '',
                      oracle.value === selectedOracleName ? 'text-gray-300' : 'text-white',
                      'group flex w-full items-center gap-2 px-4 py-2 text-sm transition hover:bg-gray-700'
                    ]"
                  >
                    <div class="relative h-4 w-4 shrink-0">
                      <img
                        :src="getChartSourceIcon(oracle.label)"
                        :alt="oracle.label"
                        class="h-full w-full object-contain"
                      />
                    </div>
                    {{ oracle.label }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatSmallPrice } from '@/utils/bigint'
import { useMarket24hRates } from '@/composables/useMarket24hRates'
import { usePrice24hHighLow } from '@/composables/usePrice24hHighLow'
import { useMarketStatus } from '@/composables/useMarketStatus'
import MarketIcon from '@/components/common/MarketIcon.vue'
import ChainLabel from '@/components/common/ChainLabel.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const tradeStore = useTradeStore()
const marketStatus = useMarketStatus()

const selectedMarket = computed(() => tradeStore.selectedMarket)
const isMarketClosed = computed(() => marketStatus.checkMarketClosed(selectedMarket.value))
const maxLeverage = computed(() => '100') // Default leverage, can be made dynamic

// Chain name - can be made dynamic based on selected network/chain
const currentChainName = computed(() => 'Arbitrum') // Default chain, can be connected to wallet/network state

const oracleSources = computed(() => tradeStore.oracleSources)
const selectedOracleName = computed(() => tradeStore.currentOracleName)

const allOracleOptions = computed(() => {
  return oracleSources.value.map(oracle => {
    return {
      label: oracle,
      value: oracle,
      disabled: false
    }
  })
})

function handleOracleSelect(value: string) {
  tradeStore.setOracleByName(value)
}

const isLoadingMarkPrice = computed(() => {
  const marketPrice = tradeStore.marketPrices[selectedMarket.value]
  return !marketPrice
})

const formattedPrice = computed(() => {
  const price = tradeStore.currentMarketPrice
  if (!price) return '0'
  return formatSmallPrice(price)
})

const { rates: market24hRates, isLoading: isLoadingPriceChange } = useMarket24hRates(
  computed(() => [selectedMarket.value]),
  {
    autoRefresh: true,
    onMounted: true,
  }
)

const priceChange24h = computed(() => {
  const market = selectedMarket.value
  if (!market) return 0
  return market24hRates.value[market] || 0
})

const selectedOracleId = computed(() => tradeStore.selectedOracle)
const price24hHighLowState = usePrice24hHighLow(selectedMarket, selectedOracleId)

const isLoadingHighLow = computed(() => price24hHighLowState.isLoading.value)

const high24h = computed(() => {
  const data = price24hHighLowState.data.value
  if (!data?.high) return formattedPrice.value
  return formatSmallPrice(data.high)
})

const low24h = computed(() => {
  const data = price24hHighLowState.data.value
  if (!data?.low) return formattedPrice.value
  return formatSmallPrice(data.low)
})

// Funding rates (mock data for now - can be replaced with actual API calls)
const isLoadingFunding = ref(false)
const longFunding = ref(0.00004) // 0.004% per hour
const shortFunding = ref(0.00003) // 0.003% per hour

// Open Interest (mock data for now - can be replaced with actual API calls)
const isLoadingOpenInterest = ref(false)
const longOpenInterest = ref(10000000) // $10.00M
const shortOpenInterest = ref(10000000) // $10.00M

const openInterestTooltip = computed(() => {
  return `Long Open Interest: $${formatNumber(longOpenInterest.value)}\nShort Open Interest: $${formatNumber(shortOpenInterest.value)}`
})

function formatPercentage(value: number): string {
  return (value * 100).toFixed(3)
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K'
  }
  return value.toFixed(0)
}

function getChartSourceIcon(oracleName: string): string {
  // Map oracle names to their corresponding liquidity source icons
  const iconMap: Record<string, string> = {
    'Aster': '/img/liquidity/aster.svg',
    'gTrade': '/img/liquidity/gtrade.svg',
    'Four.meme': '/img/liquidity/four.svg',
    'Auto Match': '/img/liquidity/aster.svg', // Default to Aster icon for Auto Match
  }
  return iconMap[oracleName] || '/img/liquidity/aster.svg'
}

defineEmits(['openMarketSelect'])
</script>

