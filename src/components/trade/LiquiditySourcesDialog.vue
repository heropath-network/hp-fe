<template>
  <Dialog :show="show" @close="$emit('close')">
    <template #title>Liquidity Sources</template>

    <div class="space-y-5">
      <p class="text-sm leading-relaxed text-gray-400">
        Aggregator will automatically route your positions to suitable liquidity sources based on your preferences.
      </p>

      <div class="space-y-3">
        <button
          v-for="source in sources"
          :key="source.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 text-left transition hover:border-gray-700"
          @click="handleToggle(source.id)"
        >
          <div class="space-y-1.5">
            <div class="text-sm font-semibold text-white">
              {{ source.name }}
            </div>
            <div class="text-xs text-gray-500">
              {{ capacityLabel }}:
              <span class="font-medium text-white">{{ formatCapacity(source) }}</span>
            </div>
          </div>

          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition"
            :class="
              source.enabled
                ? 'border-teal-400 bg-teal-500 text-white'
                : 'border-gray-700 text-gray-400'
            "
          >
            <svg
              v-if="source.enabled"
              class="h-4 w-4"
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
</script>
