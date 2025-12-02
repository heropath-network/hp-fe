<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <div class="overflow-x-auto">
      <div class="flex items-center gap-2">
        <button class="bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-600" @click="loadAllDemoData">
         Load Demo Data
        </button>

        <button class="bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-600" @click="clearAllData">
         Clear All Data
        </button>
      </div>
      <table class="w-full text-sm">
        <thead class="border-b border-gray-800">
          <tr class="text-xs text-gray-400">
            <th class="px-4 py-3 text-left font-medium">Market</th>
            <th class="px-4 py-3 text-left font-medium">Side</th>
            <th class="px-4 py-3 text-right font-medium">Size</th>
            <th class="px-4 py-3 text-right font-medium">Entry Price</th>
            <th class="px-4 py-3 text-right font-medium">Mark Price</th>
            <th class="px-4 py-3 text-right font-medium">Liq. Price</th>
            <th class="px-4 py-3 text-center font-medium">Leverage</th>
            <th class="px-4 py-3 text-right font-medium">Collateral</th>
            <th class="px-4 py-3 text-right font-medium">PnL</th>
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
import { useDemoData } from '@/composables/useDemoData'

const tradeStore = useTradeStore()

const positions = computed(() => tradeStore.positions)

const { loadAllDemoData, clearAllData } = useDemoData()
</script>

