<template>
  <div class="flex items-center gap-2">
    <span
      v-if="showValue"
      :class="[
        'text-[13px] leading-[18px]',
        textStatusClass
      ]"
    >
      {{ formattedValue }}%
    </span>
    <div class="flex items-center gap-0.5" :class="[!showValue && 'cursor-pointer']" :title="showValue ? undefined : `Cross Margin Ratio: ${formattedValue}%`">
      <div
        v-for="i in filledBars"
        :key="`filled-${i}`"
        class="w-0.5 h-3"
        :class="[statusClass]"
      ></div>
      <div
        v-for="i in emptyBars"
        :key="`empty-${i}`"
        class="w-0.5 h-3 bg-gray-600"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number // Margin ratio as percentage (e.g., 25.5 for 25.5%)
  showValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
})

const formattedValue = computed(() => props.value.toFixed(2))

// Calculate number of filled bars (1-5 based on value, where each bar represents ~20%)
const filledBars = computed(() => {
  const bars = Math.min(5, Math.max(1, Math.ceil(props.value / 20)))
  return bars
})

const emptyBars = computed(() => {
  return 5 - filledBars.value
})

// Determine status class based on margin ratio
const statusClass = computed(() => {
  if (filledBars.value <= 1) {
    return 'bg-green-success'
  } else if (filledBars.value <= 3) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-error'
  }
})

const textStatusClass = computed(() => {
  if (filledBars.value <= 1) {
    return 'text-green-success'
  } else if (filledBars.value <= 3) {
    return 'text-yellow-500'
  } else {
    return 'text-red-error'
  }
})
</script>

