<template>
  <Dialog :show="show" @close="$emit('close')">
    <template #title>{{ market }} - Margin Mode</template>
    
    <div class="space-y-6 margin-mode-dialog">
      <!-- Margin Mode Selection -->
      <div class="flex bg-[#272727]">
        <button
          @click="localMarginMode = 'isolated'"
          :class="[
            'flex-1 px-0 py-[10px] text-sm font-medium transition',
            localMarginMode === 'isolated'
              ? 'bg-[#6CE99E] text-gray-1000'
              : 'text-gray-400'
          ]"
        >
          Isolated Margin
        </button>
        <button
          @click="localMarginMode = 'cross'"
          :class="[
            'flex-1 px-0 py-[10px] text-sm font-medium transition',
            localMarginMode === 'cross'
              ? 'bg-[#6CE99E] text-gray-1000'
              : 'text-gray-400'
          ]"
        >
          Cross Margin
        </button>
      </div>

      <!-- Adjust Leverage Section -->
      <div v-if="localMarginMode === 'cross'" class="flex flex-col">
        <!-- Control Bar -->
        <div class="bg-[#272727] p-4 flex items-center justify-between">
          <button
            @click="decreaseLeverage"
            :disabled="localLeverage <= 1"
            class="flex h-4 w-4 items-center justify-center text-white transition opacity-75 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease leverage"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="flex items-center">
            <span class="text-[20px] leading-[28px] text-white font-semibold ">{{ localLeverage }}x</span>
          </div>
          <button
            @click="increaseLeverage"
            :disabled="localLeverage >= 5"
            class="flex h-4 w-4 items-center justify-center text-white transition opacity-75 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase leverage"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Leverage Slider -->
        <div class="bg-[#373737] p-4 relative">
          <div class="relative h-5 px-2">
            <div class="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center">
              <div class="w-full h-[5px] bg-[#323232] rounded-full relative">
                <div 
                  class="absolute left-0 top-0 h-full bg-[#10C8A8] rounded-full transition-all"
                  :style="{ width: `${((localLeverage - 1) / 4) * 100}%` }"
                ></div>
                <!-- Slider markers at 2x, 3x, 4x, 5x -->
                <div class="absolute inset-0 flex items-center pointer-events-none">
                  <div 
                    class="absolute w-[3px] h-[3px] rounded-full transition-colors"
                    :class="localLeverage >= 2 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"
                    :style="{ left: '1.5px' }"
                  ></div>
                  <div 
                    class="absolute w-[3px] h-[3px] rounded-full transition-colors"
                    :class="localLeverage >= 2 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"
                    :style="{ left: 'calc(25% - 1.5px)' }"
                  ></div>
                  <div 
                    class="absolute w-[3px] h-[3px] rounded-full transition-colors"
                    :class="localLeverage >= 3 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"
                    :style="{ left: 'calc(50% - 1.5px)' }"
                  ></div>
                  <div 
                    class="absolute w-[3px] h-[3px] rounded-full transition-colors"
                    :class="localLeverage >= 4 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"
                    :style="{ left: 'calc(75% - 1.5px)' }"
                  ></div>
                  <div 
                    class="absolute w-[3px] h-[3px] rounded-full transition-colors"
                    :class="localLeverage >= 5 ? 'bg-gray-1000' : 'bg-[#9b9b9b]'"
                    :style="{ left: 'calc(100% - 1.5px)' }"
                  ></div>
                </div>
              </div>
            </div>
            <input
              v-model.number="localLeverage"
              type="range"
              min="1"
              max="5"
              step="1"
              class="absolute inset-0 w-full h-5 opacity-0 cursor-pointer z-10"
            />
            <div 
              class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none z-20 transition-all"
              :style="{ left: sliderThumbLeft, transform: 'translateY(-50%) translateX(-50%)' }"
            >
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#323232] rounded-full"></div>
            </div>
          </div>
          <!-- Labels -->
          <div class="-mt-[2px] relative h-[18px]">
            <div class="absolute inset-0 flex items-center">
              <div 
                class="absolute text-[13px] leading-[18px] text-center  transition-colors whitespace-nowrap"
                :class="localLeverage === 1 ? 'text-white' : 'text-[#9b9b9b]'"
                style="left: 10px; transform: translateX(-50%);"
              >
                1x
              </div>
              <div 
                class="absolute text-[13px] leading-[18px] text-center  transition-colors whitespace-nowrap"
                :class="localLeverage === 2 ? 'text-white' : 'text-[#9b9b9b]'"
                style="left: calc(25% + 4px); transform: translateX(-50%);"
              >
                2x
              </div>
              <div 
                class="absolute text-[13px] leading-[18px] text-center  transition-colors whitespace-nowrap"
                :class="localLeverage === 3 ? 'text-white' : 'text-[#9b9b9b]'"
                style="left: 50%; transform: translateX(-50%);"
              >
                3x
              </div>
              <div 
                class="absolute text-[13px] leading-[18px] text-center  transition-colors whitespace-nowrap"
                :class="localLeverage === 4 ? 'text-white' : 'text-[#9b9b9b]'"
                style="left: calc(75% - 4px); transform: translateX(-50%);"
              >
                4x
              </div>
              <div 
                class="absolute text-[13px] leading-[18px] text-center  transition-colors whitespace-nowrap"
                :class="localLeverage === 5 ? 'text-white' : 'text-[#9b9b9b]'"
                style="left: 97.4%; transform: translateX(-50%);"
              >
                5x
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Description Text -->
      <div class="text-[14px] leading-[20px] text-[#9B9B9B]">
        <p v-if="localMarginMode === 'isolated'">
          <span class="font-medium">Isolated Margin Mode:</span> Manage your risk on individual positions by restricting the amount of margin allocated to each. If the margin ratio of a position reached 100%, the position will be liquidated. Margin can be added or removed to positions using this mode.
        </p>
        <p v-else>
          <span class="font-medium">Cross Margin Mode:</span> All cross positions under the same margin asset share the same asset cross margin balance. In the event of liquidation, your assets full margin balance along with any remaining open positions under the asset may be forfeited.
        </p>
      </div>

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        class="w-full py-[14px] text-[14px] font-medium text-center transition bg-[#6CE99E] text-gray-1000 "
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


const sliderThumbLeft = computed(() => {
  const percentage = (localLeverage.value - 1) / 4
  const clampedPercentage = Math.max(0, Math.min(1, percentage))
  return `calc(8px + (100% - 16px) * ${clampedPercentage})`
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


