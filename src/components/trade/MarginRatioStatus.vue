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

/**
 * Calculates the safe index level based on the provided value.
 * The safe index is normalized to a range of 1-5 by dividing the value by 20 and clamping it.
 * @returns {number} Safe index level between 1 and 5
 */
const safeIndex = computed(() => Math.min(5, Math.max(1, Math.ceil(props.value / 20))))

/**
 * Determines the safety status type based on the calculated safe index level.
 * - 'safe': when safe index is 1 or less
 * - 'warning': when safe index is between 2 and 3
 * - 'danger': when safe index is 4 or higher
 * @returns {string} Safety status type: 'safe', 'warning', or 'danger'
 */
const safeIndexType = computed(() => {
  if (safeIndex.value <= 1) {
    return 'safe'
  } else if (safeIndex.value <= 3) {
    return 'warning'
  } else {
    return 'danger'
  }
})

const filledBars = computed(() => safeIndex.value)

const emptyBars = computed(() => {
  return 5 - filledBars.value
})

// Determine status class based on safe index type
const statusClass = computed(() => {
  if (safeIndexType.value === 'safe') {
    return 'bg-green-success'
  } else if (safeIndexType.value === 'warning') {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-error'
  }
})

const textStatusClass = computed(() => {
  if (safeIndexType.value === 'safe') {
    return 'text-green-success'
  } else if (safeIndexType.value === 'warning') {
    return 'text-yellow-500'
  } else {
    return 'text-red-error'
  }
})
</script>

