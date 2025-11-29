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

interface Props {
  symbol: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
})

const baseSymbol = computed(() => props.symbol.split('/')[0])
const iconUrl = ref(`/img/tokens/${baseSymbol.value}.svg`)

watch(baseSymbol, (newSymbol) => {
  iconUrl.value = `/img/tokens/${newSymbol}.svg`
})

function onImageError() {
  if (iconUrl.value !== '/img/tokens/Unknown.svg') {
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

