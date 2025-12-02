<script setup lang="ts">
import { computed, Ref, ref } from 'vue'
import { HpSwitch } from '@/components'
import { useAccountShowInLeaderboard, useUserEvaluationsStorage } from '@/storages/heroPath'
import { useConnection } from '@wagmi/vue'
import { formatNumber, formatDate, getAccountTypeLabel, getAccountStatusLabel } from '@/utils/common'

const { address } = useConnection()

const {
  data: userEvaluations,
  updateDisplayDrawdownStatus,
  updateDisplayPublicStatus,
} = useUserEvaluationsStorage(address)

const accountFilters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
]
const selectedAccountFilter: Ref<string> = ref('all')

const filteredUserEvaluations = computed(() => {
  if (selectedAccountFilter.value === 'all') {
    return userEvaluations.value
  }
  return userEvaluations.value.filter((evaluation) => {
    const statusLabel = getAccountStatusLabel(evaluation.accountStatus).toLowerCase()
    return statusLabel === selectedAccountFilter.value
  })
})

const leaderboardVisible = useAccountShowInLeaderboard(address)

const lifetimeTradingVolume = computed(() => {
  return 0
})

const fundedTradingVolume = computed(() => {
  return 0
})
const currentWithdrawableProfit = computed(() => {
  return 0
})
const highestWinRateAsset = computed(() => {
  return '--'
})

const tradingWinRate = computed(() => {
  return '0'
})
const lifetimeProfitWithdrawn = computed(() => {
  return 0
})

function onUpdateDropdownStatus(accountId: string, value: boolean) {
  updateDisplayDrawdownStatus(accountId, value)
}

function onUpdatePublicProfileStatus(accountId: string, value: boolean) {
  updateDisplayPublicStatus(accountId, value)
}
</script>

<template>
  <section class="flex flex-col gap-10 text-[var(--hp-white-color)]">
    <div class="space-y-6 bg-[var(--hp-bg-normal)] p-6">
      <h2 class="text-xl font-semibold leading-7">Public Profile Settings</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
          <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
            ${{ formatNumber(lifetimeTradingVolume, 2) }}
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Lifetime Trading Volume</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
          <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
            ${{ formatNumber(fundedTradingVolume, 2) }}
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Funded Trading Volume</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
          <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
            ${{ formatNumber(currentWithdrawableProfit, 2) }}
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Withdrawable Profit</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
          <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">{{ highestWinRateAsset }}</p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Highest Win Rate Asset</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
          <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
            {{ formatNumber(tradingWinRate, 2) }}%
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Trading Win Rate</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
          <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
            ${{ formatNumber(lifetimeProfitWithdrawn, 2) }}
          </p>
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
                ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
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

        <template v-if="!filteredUserEvaluations.length">
          <div class="h-[72px] flex items-center justify-center bg-[var(--hp-bg-light)] text-[var(--hp-white-color)]">
            No accounts available.
          </div>
        </template>

        <template v-else>
          <div
            v-for="(account, index) in filteredUserEvaluations"
            :key="account.accountId"
            class="grid grid-cols-[140px,160px,200px,1fr,220px,140px] items-center px-6 py-4 text-[16px] font-medium leading-6"
            :class="index % 2 === 0 ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]'"
          >
            <span class="text-[var(--hp-white-color)]">{{ formatDate(account.timestamp) }}</span>
            <span class="text-[var(--hp-white-color)]">#{{ account.accountId }}</span>
            <div>
              <HpSwitch
                :enabled="account.displayStatus.showDrawdown"
                @change="onUpdateDropdownStatus(account.accountId, $event)"
              />
            </div>
            <span class="text-[var(--hp-white-color)]">{{ getAccountTypeLabel(account.accountType) }}</span>
            <div>
              <HpSwitch
                :enabled="account.displayStatus.showPublic"
                @change="onUpdatePublicProfileStatus(account.accountId, $event)"
              />
            </div>
            <span class="text-[16px] font-medium leading-6 text-[var(--hp-white-color)]">
              {{ getAccountStatusLabel(account.accountStatus) }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
