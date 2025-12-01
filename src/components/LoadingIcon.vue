<template>
  <span class="inline-flex items-center justify-end align-middle" :style="wrapperStyle">
    <img
      :style="imageStyle"
      class="inline-block animate-[spin_2s_linear_infinite]"
      :src="isBlack ? LoadingBlackIconSvg : LoadingIconSvg"
      alt=""
    />
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import LoadingIconSvg from '@/assets/icons/loading.svg'
import LoadingBlackIconSvg from '@/assets/icons/loadingBlack.svg'

interface Props {
  size?: string
  isBlack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: '24',
  isBlack: false,
})

const wrapperStyle = computed(() => ({
  height: `${props.size}px`,
  wight: `${props.size}px`,
}))

const imageStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>
