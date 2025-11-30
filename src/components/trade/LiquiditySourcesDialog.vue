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
          class="flex w-full items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-left transition hover:border-gray-700"
          @click="handleToggle(source.id)"
        >
          <div>
            <div class="text-sm font-semibold text-white">
              {{ source.name }}
            </div>
            <div class="mt-1 text-xs text-gray-500">
              Max to Long:
              <span class="font-medium text-white">{{ formatMaxLong(source.maxLongAmount, source.assetSymbol) }}</span>
            </div>
          </div>

          <div
            class="flex h-7 w-7 items-center justify-center rounded-full border transition"
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
import Dialog from '@/components/Dialog.vue'
import type { LiquiditySourceId } from '@/constants/liquiditySources'

interface Props {
  show: boolean
  sources: Array<{
    id: LiquiditySourceId
    name: string
    maxLongAmount: number | null
    assetSymbol: string
    enabled: boolean
  }>
}

const props = defineProps<Props>()

interface Emits {
  (event: 'close'): void
  (event: 'toggle', id: LiquiditySourceId): void
}

const emit = defineEmits<Emits>()

function handleToggle(id: LiquiditySourceId) {
  emit('toggle', id)
}

function formatMaxLong(amount: number | null, assetSymbol: string) {
  if (amount === null) {
    return 'N/A'
  }

  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount)} ${assetSymbol}`
}
</script>
