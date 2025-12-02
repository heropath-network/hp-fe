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
        Aggregator will automatically route your positions to suitable liquidity sources based on your preferences.
      </p>

      <div class="flex flex-col gap-2">
        <button
          v-for="source in sources"
          :key="source.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 border bg-[#272727] px-4 py-3 text-left transition"
          :class="source.enabled ? 'border-[#272727]' : 'border-[#373737]'"
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
                <div
                  v-if="source.id === 'standx'"
                  class="relative h-4 w-4 shrink-0"
                >
                  <img
                    src="@/assets/icons/question.svg"
                    alt="Info"
                    class="h-full w-full"
                  />
                </div>
              </div>
              <p class="text-sm leading-5 text-[#6678a9]">
                <span class="text-[#9b9b9b]">{{ capacityLabel }}:</span>
                <span class="text-white">{{ formatCapacity(source) }}</span>
              </p>
            </div>
          </div>

          <div class="relative h-5 w-5 shrink-0 flex items-center justify-center">
            <div
              v-if="source.enabled"
              class="absolute inset-0 rounded-full bg-[#6ce99e]"
            />
            <svg
              v-if="source.enabled"
              class="relative z-10 h-3 w-3 text-[#0a0a0a]"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 10.5L8 13.5L15 6.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div
              v-else
              class="absolute inset-0 rounded-full border-2 border-[#6ce99e]"
            />
          </div>
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const props = defineProps<Props>()

interface Emits {
  (event: 'close'): void
  (event: 'toggle', id: LiquiditySourceId): void
}

const emit = defineEmits<Emits>()

const capacityLabel = computed(() => (props.tradeSide === 'short' ? 'Max to Short' : 'Max to Long'))

function handleToggle(id: LiquiditySourceId) {
  emit('toggle', id)
}

function formatCapacity(source: Props['sources'][number]) {
  const capacity = props.tradeSide === 'short' ? source.maxShort : source.maxLong
  return formatAmount(capacity.amount, capacity.assetSymbol)
}

function formatAmount(amount: number | null, assetSymbol: string) {
  if (amount === null) {
    return 'N/A'
  }

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: amount < 100 ? 5 : 0,
  })

  return `${formatter.format(amount)} ${assetSymbol}`
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

