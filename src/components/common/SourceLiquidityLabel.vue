<template>
  <div
    class="source-liquidity-label absolute flex items-center justify-center gap-[2px] w-6 h-6 shrink-0"
    :style="{
      backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), linear-gradient(90deg, rgba(55, 55, 55, 1) 0%, rgba(55, 55, 55, 1) 100%)'
    }"
  >
    <div class="relative shrink-0 w-4 h-4">
      <img
        :src="iconSrc"
        :alt="oracleName || 'Auto Match'"
        class="block w-full h-full object-contain"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'

const props = defineProps<{
  oracleName?: string
}>()

const tradeStore = useTradeStore()
const selectedOracleName = computed(() => props.oracleName || tradeStore.currentOracleName || 'Auto Match')

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

const iconSrc = computed(() => getChartSourceIcon(selectedOracleName.value))
const oracleName = computed(() => selectedOracleName.value)
</script>

