<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-800">
          <tr class="text-xs text-gray-400">
            <th class="px-4 py-3 text-left font-medium">Market</th>
            <th class="px-4 py-3 text-left font-medium">Size</th>
            <th class="px-4 py-3 text-left font-medium">Net Value</th>
            <th class="px-4 py-3 text-left font-medium">Margin</th>
            <th class="px-4 py-3 text-left font-medium">Entry Price</th>
            <th class="px-4 py-3 text-left font-medium">Index Price</th>
            <th class="px-4 py-3 text-left font-medium">Liq. Price</th>
            <th class="px-4 py-3 text-left font-medium">PNL & ROE</th>
            <th class="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-if="positions.length === 0">
            <td colspan="10" class="px-4 py-0">
              <div class="flex flex-col items-center justify-center gap-2 py-16">
                <img :src="noDataIcon" alt="No data" class="w-20 h-20" />
                <p class="text-sm text-[#9b9b9b] text-center">No Active Positions</p>
              </div>
            </td>
          </tr>
          <PositionRow
            v-for="position in positions"
            :key="position.id"
            :position="position"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import PositionRow from './PositionRow.vue'
import noDataIcon from '@/assets/img/no-data.svg'
import type { Position } from '@/storages/trading'

interface Props {
  positions?: Position[]
}

const props = withDefaults(defineProps<Props>(), {
  positions: undefined
})

const tradeStore = useTradeStore()

const positions = computed(() => props.positions ?? tradeStore.positions)
</script>

