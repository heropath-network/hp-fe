<template>
  <div class="flex h-full flex-col bg-[var(--hp-bg-dark)]">
    <div class="overflow-x-auto">
      <table class="w-full text-sm"> 
        <thead class="border-b border-gray-800">
          <tr class="text-xs text-gray-400">
            <th class="px-4 py-3 text-left font-medium">Market</th>
            <th class="px-4 py-3 text-left font-medium">Type</th>
            <th class="px-4 py-3 text-left font-medium">Side</th>
            <th class="px-4 py-3 text-right font-medium">Size</th>
            <th class="px-4 py-3 text-right font-medium">Trigger Price</th>
            <th class="px-4 py-3 text-right font-medium">Mark Price</th>
            <th class="px-4 py-3 text-left font-medium">Created</th>
            <th class="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-if="orders.length === 0">
            <td colspan="8" class="px-4 py-0">
              <div class="flex flex-col items-center justify-center gap-2 py-16">
                <img :src="noDataIcon" alt="No data" class="w-20 h-20" />
                <p class="text-sm text-[#9b9b9b] text-center">No Open Orders</p>
              </div>
            </td>
          </tr>
          <OrderRow
            v-for="order in orders"
            :key="order.id"
            :order="order"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import OrderRow from './OrderRow.vue'
import noDataIcon from '@/assets/img/no-data.svg'
import type { Order } from '@/storages/trading'

interface Props {
  orders?: Order[]
}

const props = withDefaults(defineProps<Props>(), {
  orders: undefined
})

const tradeStore = useTradeStore()

const orders = computed(() => props.orders ?? tradeStore.orders)

/**
 * Clears all orders from LocalStorage
 * This removes all stored orders but doesn't cancel them
 */
function clearAllOrders() {
  if (confirm('Are you sure you want to clear all orders from storage? This will remove all stored orders.')) {
    tradeStore.clearOrders()
  }
}
</script>


