<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import Avatar from '@/components/Wallet/Avatar.vue'
import { EMPTY_ADDRESS } from '@/constants'
import { ellipsisMiddle } from '@/utils/common'
import { ref } from 'vue'

const { address, isConnected } = useConnection()

const accountFilters = [
  { id: 'all', label: 'All', active: true },
  { id: 'active', label: 'Active', active: false },
  { id: 'inactive', label: 'Inactive', active: false },
]

const selectedAccountFilter = ref('all')

const patternStyle = {
  backgroundColor: 'var(--hp-primary-green)',
  backgroundImage:
    'radial-gradient(circle, transparent 58%, rgba(255,255,255,0.18) 58%, rgba(255,255,255,0.18) 62%, transparent 62%)',
  backgroundSize: '160px 160px',
  backgroundPosition: '-20px -20px',
}

const accounts = ref([
  {
    date: '2025-11-28',
    number: '#535094',
    type: 'Evaluation',
    status: 'Active',
  },
  {
    date: '2025-11-28',
    number: '#535095',
    type: 'Evaluation',
    status: 'Inactive',
  },
])
</script>

<template>
  <section class="flex flex-col gap-12 text-[var(--hp-white-color)]">
    <div class="flex flex-col gap-4">
      <div class="relative h-[168px] w-full overflow-hidden" :style="patternStyle">
        <div class="absolute left-6 top-6 flex items-center gap-4">
          <Avatar :address="address ?? EMPTY_ADDRESS" :size="101" />
          <p v-if="isConnected" class="text-xl font-semibold leading-[30px] text-[var(--hp-black-color)]">
            {{ ellipsisMiddle(address) }}
          </p>
        </div>
      </div>

      <div class="space-y-6 bg-[var(--hp-bg-normal)] p-6">
        <div class="space-y-1">
          <h2 class="text-xl font-semibold leading-7">Key Metrics</h2>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Lifetime metrics across all accounts</p>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">$0.00</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Lifetime Trading Volume</p>
          </div>
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">$0.00</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Funded Trading Volume</p>
          </div>
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">$0.00</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Withdrawable Profit</p>
          </div>
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">BTCUSD</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Highest Win Rate Asset</p>
          </div>
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">0.00%</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Trading Win Rate</p>
          </div>
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">$0.00</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Lifetime Profit Withdrawn</p>
          </div>
          <div class="md:col-span-3 flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">--</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Socials</p>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-1">
        <h3 class="text-2xl font-semibold leading-[30px]">Accounts</h3>
        <p class="text-sm leading-5 text-[var(--hp-text-color)]">A list of all of your accounts.</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          v-for="filter in accountFilters"
          :key="filter.label"
          class="flex items-center justify-center px-4 py-[14px] text-[16px] font-medium leading-6 transition"
          :class="[
            filter.id === selectedAccountFilter
              ? 'bg-[var(--hp-bg-normal)] text-[var(--hp-white-color)]'
              : 'text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]',
          ]"
          type="button"
          @click="selectedAccountFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="overflow-hidden border border-[var(--hp-bg-normal)]">
        <div
          class="grid grid-cols-[160px,1.3fr,1.3fr,1.1fr] items-center bg-[var(--hp-bg-normal)] px-6 py-3 text-sm font-normal leading-5 text-[var(--hp-text-color)]"
        >
          <span>Date</span>
          <span>Account Number</span>
          <span>Account Type</span>
          <span>Status</span>
        </div>
        <template v-if="!accounts.length">
          <div class="h-[72px] flex items-center justify-center bg-[var(--hp-bg-light)] text-[var(--hp-white-color)]">
            No accounts available.
          </div>
        </template>

        <template v-else>
          <div
            v-for="(account, index) in accounts"
            :key="account.number"
            class="grid grid-cols-[160px,1.3fr,1.3fr,1.1fr] items-center px-6 py-4 text-[16px] font-medium leading-6"
            :class="index % 2 === 0 ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]'"
          >
            <span class="text-[var(--hp-white-color)]">{{ account.date }}</span>
            <span class="text-[var(--hp-white-color)]">{{ account.number }}</span>
            <span class="text-[var(--hp-white-color)]">{{ account.type }}</span>
            <span class="text-[16px] font-medium leading-6 text-[var(--hp-white-color)]">
              {{ account.status }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 bg-[var(--hp-bg-normal)] px-6 py-4">
      <p class="text-[20px] font-semibold leading-7">Ready for a new Evaluation?</p>
      <button
        type="button"
        class="bg-[var(--hp-primary-green)] px-6 py-[14px] text-[16px] font-medium leading-6 text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)]"
      >
        New Evaluation
      </button>
    </div>
  </section>
</template>
