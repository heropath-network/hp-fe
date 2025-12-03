<template>
  <Dialog :show="show" @close="$emit('close')">
    <template #title>
      <div class="flex items-center justify-between px-0 w-full">
        <div class="flex items-center gap-4">
          <h3 class="text-base font-semibold leading-6 text-white">Liquidity Sources</h3>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-4 ">
      <p class="text-sm leading-5 text-gray-400">
        HeroPath Trading Aggregator will automatically route your positions to suitable liquidity sources based on market, trade type and your preferences.
      </p>

      <div class="flex flex-col gap-2">
        <button
          v-for="source in sources"
          :key="source.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 border bg-[#272727] px-4 py-[11px] text-left transition border-solid border-[#272727] hover:border-[#373737]"
          @click="handleToggle(source.id)"
        >
          <div class="flex items-center gap-3">
            <div class="relative h-8 w-8 shrink-0">
              <img
                :src="getSourceIcon(source.id)"
                :alt="source.name"
                class="h-full w-full object-contain"
              />
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <div class="text-base font-semibold leading-6 text-white whitespace-nowrap">
                  {{ source.name }}
                </div>                
              </div>
            </div>
          </div>

          <div
            class="h-5 w-5 shrink-0 rounded-full flex items-center justify-center border transition-colors"
            :class="source.enabled ? 'border-none bg-[#6ce99e]' : 'border-[#6ce99e] bg-transparent'"
          >
            <i v-if="source.enabled" class="iconfont icon-margin-mode-selected text-gray-1000"></i>
          </div>
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from '@/components/Dialog.vue'
import type { LiquiditySourceId } from '@/constants/liquiditySources'

interface Props {
  show: boolean
  tradeSide: 'long' | 'short'
  sources: Array<{
    id: LiquiditySourceId
    name: string
    maxLong: {
      amount: number | null
      assetSymbol: string
    }
    maxShort: {
      amount: number | null
      assetSymbol: string
    }
    enabled: boolean
  }>
}

defineProps<Props>()

interface Emits {
  (event: 'close'): void
  (event: 'toggle', id: LiquiditySourceId): void
}

const emit = defineEmits<Emits>()

function handleToggle(id: LiquiditySourceId) {
  emit('toggle', id)
}

function getSourceIcon(id: LiquiditySourceId): string {
  const iconMap: Record<LiquiditySourceId, string> = {
    aster: '/img/liquidity/aster.svg',
    four: '/img/liquidity/four.svg',
    standx: '/img/liquidity/standx.svg',
    gtrade: '/img/liquidity/gtrade.svg',
  }
  return iconMap[id]
}
</script>

