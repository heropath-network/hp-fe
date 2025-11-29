<script setup lang="ts">
import { Ref, ref } from 'vue'
import { HpSwitch } from '@/components'

const accounts = ref([
  {
    date: '2025-11-28',
    number: '#535094',
    dropdownVisible: true,
    publicProfileVisible: false,
    type: 'Evaluation',
    status: 'Active',
  },
  {
    date: '2025-11-28',
    number: '#535095',
    dropdownVisible: true,
    publicProfileVisible: false,
    type: 'Evaluation',
    status: 'Inactive',
  },
])

const accountFilters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
]
const selectedAccountFilter: Ref<string> = ref('all')

const leaderboardVisible = ref(true)
</script>

<template>
  <section class="flex flex-col gap-10 text-[var(--hp-white-color)]">
    <div class="space-y-6 bg-[var(--hp-bg-normal)] p-6">
      <h2 class="text-xl font-semibold leading-7">Public Profile Settings</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-1">
        <h3 class="text-2xl font-semibold leading-[30px]">Accounts</h3>
        <p class="text-sm leading-5 text-[var(--hp-text-color)]">A list of all of your accounts.</p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
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

        <div class="flex items-center gap-3 text-sm leading-5 text-[var(--hp-text-color)]">
          <span>Show on Leaderboard</span>
          <span
            class="flex size-4 items-center justify-center rounded-full bg-[var(--hp-bg-light)] text-[11px] font-medium text-[var(--hp-text-color)]"
            aria-hidden="true"
          >
            ?
          </span>
          <HpSwitch v-model:enabled="leaderboardVisible" />
        </div>
      </div>

      <div class="overflow-hidden rounded-sm border border-[var(--hp-bg-normal)]">
        <div
          class="grid grid-cols-[140px,160px,200px,1fr,220px,140px] items-center bg-[var(--hp-bg-normal)] px-6 py-3 text-sm font-normal leading-5 text-[var(--hp-text-color)]"
        >
          <span>Date</span>
          <span>Account Number</span>
          <div class="flex items-center gap-2">
            <span>Dropdown (Hide/Show)</span>
            <span
              class="flex size-4 items-center justify-center rounded-full bg-[var(--hp-bg-light)] text-[11px] font-medium text-[var(--hp-text-color)]"
              aria-hidden="true"
            >
              ?
            </span>
          </div>
          <span>Account Type</span>
          <div class="flex items-center gap-2">
            <span>Public Profile (Hide/Show)</span>
            <span
              class="flex size-4 items-center justify-center rounded-full bg-[var(--hp-bg-light)] text-[11px] font-medium text-[var(--hp-text-color)]"
              aria-hidden="true"
            >
              ?
            </span>
          </div>
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
            class="grid grid-cols-[140px,160px,200px,1fr,220px,140px] items-center px-6 py-4 text-[16px] font-medium leading-6"
            :class="index % 2 === 0 ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]'"
          >
            <span class="text-[var(--hp-white-color)]">{{ account.date }}</span>
            <span class="text-[var(--hp-white-color)]">{{ account.number }}</span>
            <div>
              <HpSwitch v-model:enabled="account.dropdownVisible" />
            </div>
            <span class="text-[var(--hp-white-color)]">{{ account.type }}</span>
            <div>
              <HpSwitch v-model:enabled="account.dropdownVisible" />
            </div>
            <span class="text-[16px] font-medium leading-6 text-[var(--hp-white-color)]">
              {{ account.status }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
