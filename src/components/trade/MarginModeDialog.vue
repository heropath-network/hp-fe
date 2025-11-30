<template>
  <Dialog :show="show" @close="$emit('close')">
    <template #title>{{ market }} - Margin Mode</template>
    
    <div class="space-y-6">
      <!-- Margin Mode Selection -->
      <div class="flex gap-2">
        <button
          @click="localMarginMode = 'isolated'"
          :class="[
            'flex-1 rounded-lg py-3 text-sm font-semibold transition',
            localMarginMode === 'isolated'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-800 text-white'
          ]"
        >
          Isolated Margin
        </button>
        <button
          @click="localMarginMode = 'cross'"
          :class="[
            'flex-1 rounded-lg py-3 text-sm font-semibold transition',
            localMarginMode === 'cross'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-800 text-white'
          ]"
        >
          Cross Margin
        </button>
      </div>

      <!-- Adjust Leverage Section -->
      <div v-if="localMarginMode === 'cross'">
        <label class="mb-3 block text-sm font-medium text-gray-400">
          Adjust Leverage
        </label>
        
        <!-- Leverage Input with +/- buttons -->
        <div class="mb-4 flex items-center justify-center gap-4">
          <button
            @click="decreaseLeverage"
            :disabled="localLeverage <= 1"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <div class="text-2xl font-semibold text-white">
            {{ localLeverage }}x
          </div>
          <button
            @click="increaseLeverage"
            :disabled="localLeverage >= 100"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <!-- Leverage Slider -->
        <div class="relative">
          <input
            v-model.number="localLeverage"
            type="range"
            min="1"
            max="100"
            step="1"
            class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-800"
          />
          <div class="mt-2 flex justify-between text-xs text-gray-500">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>75x</span>
            <span>100x</span>
          </div>
        </div>
      </div>

      <!-- Description Text -->
      <div class="rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-400">
        <p v-if="localMarginMode === 'isolated'">
          Isolated Margin Mode: Manage your risk on individual positions by restricting the amount of margin allocated to each. If the margin ratio of a position reached 100%, the position will be liquidated. Margin can be added or removed to positions using this mode.
        </p>
        <div v-else class="space-y-3 text-sm leading-relaxed">
          <p>
            Cross Margin Mode: All cross positions under the same margin asset share the same asset cross margin balance. In the event of liquidation, your assets full margin balance along with any remaining open positions under the asset may be forfeited.
          </p>
        </div>
      </div>

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        class="w-full rounded-lg bg-teal-500 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
      >
        Confirm
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from '@/components/Dialog.vue'

interface Props {
  show: boolean
  market: string
  marginMode?: 'isolated' | 'cross'
  leverage?: number
}

const props = withDefaults(defineProps<Props>(), {
  marginMode: 'cross',
  leverage: 5,
})

interface Emits {
  (e: 'close'): void
  (e: 'confirm', data: { marginMode: 'isolated' | 'cross'; leverage: number }): void
}

const emit = defineEmits<Emits>()

const localMarginMode = ref<'isolated' | 'cross'>(props.marginMode)
const localLeverage = ref(props.leverage)

watch(() => props.show, (newValue) => {
  if (newValue) {
    localMarginMode.value = props.marginMode
    localLeverage.value = props.leverage
  }
})

watch(() => props.marginMode, (newValue) => {
  localMarginMode.value = newValue
})

watch(() => props.leverage, (newValue) => {
  localLeverage.value = newValue
})

function increaseLeverage() {
  if (localLeverage.value < 100) {
    localLeverage.value++
  }
}

function decreaseLeverage() {
  if (localLeverage.value > 1) {
    localLeverage.value--
  }
}

function handleConfirm() {
  emit('confirm', {
    marginMode: localMarginMode.value,
    leverage: localLeverage.value,
  })
  emit('close')
}
</script>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  @apply h-4 w-4 cursor-pointer appearance-none rounded-full bg-teal-500;
}

input[type='range']::-moz-range-thumb {
  @apply h-4 w-4 cursor-pointer appearance-none rounded-full border-0 bg-teal-500;
}
</style>
