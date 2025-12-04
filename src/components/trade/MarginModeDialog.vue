<template>
  <Dialog :show="show" @close="$emit('close')">
    <template #title>{{ market }} - Margin Mode</template>
    
    <div class="space-y-6 margin-mode-dialog">
      <!-- Margin Mode Selection -->
      <div class="flex bg-[#272727]">
        <button
          @click="localMarginMode = 'isolated'"
          :class="[
            'flex-1 px-0 py-2 text-sm font-medium transition',
            localMarginMode === 'isolated'
              ? 'bg-green-success text-gray-1000'
              : 'text-gray-400'
          ]"
        >
          Isolated Margin
        </button>
        <button
          @click="localMarginMode = 'cross'"
          :class="[
            'flex-1 px-0 py-2 text-sm font-medium transition',
            localMarginMode === 'cross'
              ? 'bg-green-success text-gray-1000'
              : 'text-gray-400'
          ]"
        >
          Cross Margin
        </button>
      </div>

      <!-- Adjust Leverage Section -->
      <div v-if="localMarginMode === 'cross'" class="flex flex-col gap-2">
        <div class="bg-[#272727] p-3 flex flex-col gap-2">
          <div class="flex items-center gap-1">
            <span class="text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">Adjust Leverage</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 flex items-center">
              <span class="text-[18px] leading-[24px] text-white font-semibold font-['IBM_Plex_Sans',sans-serif]">{{ localLeverage }}x</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="decreaseLeverage"
                :disabled="localLeverage <= 1"
                class="flex h-8 w-8 items-center justify-center bg-[#373737] text-white transition hover:bg-[#323232] disabled:opacity-50 disabled:cursor-not-allowed font-['IBM_Plex_Sans',sans-serif]"
              >
                -
              </button>
              <button
                @click="increaseLeverage"
                :disabled="localLeverage >= 5"
                class="flex h-8 w-8 items-center justify-center bg-[#373737] text-white transition hover:bg-[#323232] disabled:opacity-50 disabled:cursor-not-allowed font-['IBM_Plex_Sans',sans-serif]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Leverage Slider -->
        <div class="relative">
          <div class="relative h-4 px-2">
            <div class="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center">
              <div class="w-full h-[5px] bg-[#323232] rounded-full relative">
                <div 
                  class="absolute left-0 top-0 h-full bg-[#10c8a8] rounded-full"
                  :style="{ width: `${((localLeverage - 1) / 4) * 100}%` }"
                ></div>
                <!-- Slider markers -->
                <div class="absolute inset-0 flex justify-between items-center pointer-events-none">
                  <div class="w-[3px] h-[3px] rounded-full bg-[#9b9b9b]" :class="localLeverage > 1 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"></div>
                  <div class="w-[3px] h-[3px] rounded-full bg-[#9b9b9b]" :class="localLeverage > 2 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"></div>
                  <div class="w-[3px] h-[3px] rounded-full bg-[#9b9b9b]" :class="localLeverage > 3 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"></div>
                  <div class="w-[3px] h-[3px] rounded-full bg-[#9b9b9b]" :class="localLeverage > 4 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"></div>
                  <div class="w-[3px] h-[3px] rounded-full bg-[#9b9b9b]" :class="localLeverage > 5 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"></div>
                </div>
              </div>
            </div>
            <input
              v-model.number="localLeverage"
              type="range"
              min="1"
              max="5"
              step="1"
              class="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-10"
            />
            <div 
              class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none z-20"
              :style="{ left: sliderThumbLeft }"
            >
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#323232] rounded-full"></div>
            </div>
          </div>
          <div class="mt-2 flex justify-between text-[12px] leading-[16px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">
            <span>1x</span>
            <span>2x</span>
            <span>3x</span>
            <span>4x</span>
            <span>5x</span>
          </div>
        </div>
      </div>

      <!-- Description Text -->
      <div class="bg-[#272727] p-4 text-[13px] leading-[18px] text-[#9b9b9b] font-['IBM_Plex_Sans',sans-serif]">
        <p v-if="localMarginMode === 'isolated'">
          Isolated Margin Mode: Manage your risk on individual positions by restricting the amount of margin allocated to each. If the margin ratio of a position reached 100%, the position will be liquidated. Margin can be added or removed to positions using this mode.
        </p>
        <p v-else>
          Cross Margin Mode: All cross positions under the same margin asset share the same asset cross margin balance. In the event of liquidation, your assets full margin balance along with any remaining open positions under the asset may be forfeited.
        </p>
      </div>

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        class="w-full py-[14px] text-[14px] font-medium text-center transition bg-green-success text-gray-1000 font-['IBM_Plex_Sans',sans-serif]"
      >
        Confirm
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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

// Calculate slider thumb position to keep it within bounds
// Container has 8px padding (px-2), track is offset by 8px (inset-x-2)
// Circle is 16px wide, positioned to stay within the padded container
const sliderThumbLeft = computed(() => {
  const percentage = (localLeverage.value - 1) / 4
  // Position: percentage of track width (which is calc(100% - 16px))
  // This ensures the circle stays within the 8px padding on both sides
  return `calc((100% - 16px) * ${percentage})`
})

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
  if (localLeverage.value < 5) {
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
.margin-mode-dialog {
  font-family: 'IBM Plex Sans', sans-serif;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>


