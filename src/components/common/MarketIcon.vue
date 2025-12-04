<template>
  <div class="market-icon" :style="{ width: `${size}px`, height: `${size}px` }">
    <img
      :src="iconUrl"
      :alt="symbol"
      class="icon-image"
      @error="onImageError"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FOUR_MEME_MARKETS } from '@/constants/fourMemeMarkets'

interface Props {
  symbol: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
})

const baseSymbol = computed(() => props.symbol.split('/')[0])

const memeMarket = computed(() => {
  return FOUR_MEME_MARKETS.find((market) => market.symbol === baseSymbol.value)
})

const getIconUrl = (symbol: string) => {
  const market = FOUR_MEME_MARKETS.find((m) => m.symbol === symbol)
  return market ? market.icon : `/img/tokens/${symbol}.svg`
}

const iconUrl = ref(getIconUrl(baseSymbol.value))

watch(baseSymbol, (newSymbol) => {
  iconUrl.value = getIconUrl(newSymbol)
})

function onImageError() {
  // Only fallback to Unknown.svg if it's not already a meme market icon
  if (!memeMarket.value && iconUrl.value !== '/img/tokens/Unknown.svg') {
    iconUrl.value = '/img/tokens/Unknown.svg'
  }
}
</script>

<style scoped>
.market-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>

