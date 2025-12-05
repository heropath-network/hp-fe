<template>
  <Dialog :show="show" @close="handleClose">
    <template #title>
      <div class="flex items-center justify-between w-full">
        <span class="text-[16px] font-semibold leading-[24px] text-white">
          Confirm Market Order - 
          <span :class="tradeSide === 'long' ? 'text-[#10c8a8]' : 'text-red-error'">
            {{ tradeSide === 'long' ? 'Long' : 'Short' }} {{ leverage }}X
          </span>
        </span>
      </div>
    </template>
    
    <div class="confirm-order-dialog flex flex-col gap-6">
      <!-- Input Boxes Section -->
      <div class="flex flex-col gap-2 relative">
        <!-- Use (USDC) Input Box -->
        <div class="bg-[#272727] p-4 flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Use: ${{ formatNumber(useAmount) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[20px] leading-[28px] text-white font-semibold">{{ formatNumber(useAmount) }}</span>
            <div class="flex items-center gap-1">
              <div class="relative shrink-0 size-5">
                <MarketIcon symbol="USDC" :size="20" />
              </div>
              <span class="text-[18px] leading-[28px] text-white font-medium">USDC</span>
            </div>
          </div>
        </div>

        <!-- Swap Icon -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
          <div class="bg-[#373737] size-7 flex items-center justify-center">
            <i class="iconfont icon-swap text-[#9b9b9b] text-[16px]"></i>
          </div>
        </div>

        <!-- Long/Short (ETH) Input Box -->
        <div class="bg-[#272727] p-4 flex flex-col gap-2 relative">
          <div class="flex items-center gap-2">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">
              {{ tradeSide === 'long' ? 'Long' : 'Short' }}: ${{ formatNumber(positionSizeUSD) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[20px] leading-[28px] text-white font-semibold">{{ formatNumber(size) }}</span>
            <div class="flex items-center gap-1">
              <div class="relative shrink-0 size-5">
                <img
                  :src="tokenIconSrc"
                  :alt="tokenSymbol"
                  class="block w-full h-full object-contain"
                />
              </div>
              <span class="text-[18px] leading-[28px] text-white font-medium">{{ tokenSymbol }}</span>
            </div>
          </div>
          <!-- Chain Label -->
          <div class="absolute top-0 right-0 bg-[#414141] size-6 flex items-center justify-center">
            <div class="relative shrink-0 size-4">
              <img
                src="/img/liquidity/aster.svg"
                alt="Aster"
                class="block w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Order Details Section -->
      <div class="flex flex-col gap-2">
        <!-- Index Price -->
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Index Price</span>
          <span class="text-[14px] leading-[20px] text-white font-normal text-right">
            ${{ formatPrice(indexPrice) }} / {{ tokenSymbol }}
          </span>
        </div>

        <!-- Market Price -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Market Price</span>
            <Tooltip :width="300" content="Market price is the current trading price at which your order will be executed.">
              <div class="relative shrink-0 size-4 cursor-help flex items-center justify-center">
                <i class="iconfont icon-question text-[#9b9b9b] text-[14px]"></i>
              </div>
            </Tooltip>
          </div>
          <span class="text-[14px] leading-[20px] text-white font-normal text-right">
            ${{ formatPrice(marketPrice) }} / {{ tokenSymbol }}
          </span>
        </div>

        <!-- Price Impact -->
        <div class="flex items-center justify-between">
          <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Price Impact</span>
          <span class="text-[14px] leading-[20px] text-white font-normal text-right">{{ priceImpact }}%</span>
        </div>

        <!-- Leverage -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Leverage</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[14px] leading-[20px] text-white font-normal text-right">{{ leverage }}X</span>
        </div>

        <!-- Liq. Price -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Liq. Price</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <span class="text-[14px] leading-[20px] text-white font-normal text-right">
            {{ liquidationPrice === '--' ? '--' : `~ $${formatPrice(liquidationPrice)}` }}
          </span>
        </div>

        <!-- Collateral (USDC) -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Collateral (USDC)</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[14px] leading-[20px] text-white font-normal text-right">${{ collateral }}</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
        </div>

        <!-- Open Cost -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[14px] leading-[20px] text-[#9b9b9b] font-normal">Open Cost</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[14px] leading-[20px] text-white font-normal text-right">${{ openCost }}</span>
            <div class="h-px w-full bg-[#272727] mt-0.5"></div>
          </div>
        </div>
      </div>

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        :class="[
          'w-full py-[14px] text-[16px] font-medium text-center transition',
          tradeSide === 'long' 
            ? 'bg-[#6ce99e] text-gray-1000 hover:bg-[#5dd88a]' 
            : 'bg-red-error text-gray-1000 hover:bg-red-hover'
        ]"
      >
        Confirm {{ tradeSide === 'long' ? 'Long' : 'Short' }} {{ tokenSymbol }}
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Dialog from '@/components/Dialog.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import MarketIcon from '@/components/common/MarketIcon.vue'

interface Props {
  show: boolean
  tradeSide: 'long' | 'short'
  size: string
  leverage: number
  market: string
  indexPrice: string
  marketPrice: string
  priceImpact: string
  liquidationPrice: string
  collateral: string
  openCost: string
  maxROE: string
  useAmount: string
  positionSizeUSD: string
}

const props = defineProps<Props>()

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const emit = defineEmits<Emits>()

function handleClose() {
  emit('close')
}

function handleConfirm() {
  emit('confirm')
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

function formatNumber(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.0'
  return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
</script>

<style scoped>
.confirm-order-dialog {
  font-family: 'IBM Plex Sans', sans-serif;
  width: 100%;
}
</style>

