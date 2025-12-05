<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import Avatar from '@/components/Wallet/Avatar.vue'
import { EMPTY_ADDRESS } from '@/constants'
import { ellipsisMiddle } from '@/utils/common'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router'
import { useUserEvaluationsStorage } from '@/storages/heroPath'
import { formatDate, getAccountTypeLabel, getAccountStatusLabel } from '@/utils/common'
import BaseIcon from '@/components/BaseIcon.vue'
import { useUserTradeHistoryStorage } from '@/storages/trading'
import { useUserPayoutsStorage } from '@/storages/heroPath'
import { countTradesWinRate, getAccountHistoryPnl, getAccountTotalVolume } from '@/utils/evaluation'
import { SHARE_OF_PROFIT } from '@/constants'
import * as _ from 'lodash-es'
import { formatNumber, multiplyBigInt, toBigInt } from '@/utils/bigint'

const router = useRouter()

const { address, isConnected } = useConnection()

const { data: _userEvaluations } = useUserEvaluationsStorage(address)

const userEvaluations = computed(() => {
  return _userEvaluations.value.filter((evaluation) => evaluation.displayStatus.showPublic)
})

const { data: userTradeHistory } = useUserTradeHistoryStorage(address)
const { data: payoutsInfo } = useUserPayoutsStorage(address)
const withdrawnAmount = computed(() => toBigInt(payoutsInfo.value.withdrawnAmount))

const evaluationTradeHistory = computed(() => {
  if (!userEvaluations.value || !userTradeHistory.value) {
    return []
  }
  const accountIds = userEvaluations.value
    .filter((evaluation) => evaluation.accountType === 'evaluation')
    .map((evaluation) => evaluation.accountId)
  return userTradeHistory.value.filter((trade) => accountIds.includes(trade.accountId))
})

const fundedTradeHistory = computed(() => {
  if (!userEvaluations.value || !userTradeHistory.value) {
    return []
  }
  const accountIds = userEvaluations.value
    .filter((evaluation) => evaluation.accountType === 'funded')
    .map((evaluation) => evaluation.accountId)
  return userTradeHistory.value.filter((trade) => accountIds.includes(trade.accountId))
})

const accountFilters = [
  { id: 'all', label: 'All', active: true },
  { id: 'active', label: 'Active', active: false },
  { id: 'inactive', label: 'Inactive', active: false },
]

const selectedAccountFilter = ref('all')

const filteredUserEvaluations = computed(() => {
  if (selectedAccountFilter.value === 'all') {
    return userEvaluations.value
  }
  return userEvaluations.value.filter((evaluation) => {
    const statusLabel = getAccountStatusLabel(evaluation.accountStatus).toLowerCase()
    return statusLabel === selectedAccountFilter.value
  })
})

const patternStyle = {
  backgroundColor: 'var(--hp-primary-green)',
  backgroundImage:
    'radial-gradient(circle, transparent 58%, rgba(255,255,255,0.18) 58%, rgba(255,255,255,0.18) 62%, transparent 62%)',
  backgroundSize: '160px 160px',
  backgroundPosition: '-20px -20px',
}

const evaluationTradingVolume = computed(() => {
  return getAccountTotalVolume(evaluationTradeHistory.value)
})

const fundedTradingVolume = computed(() => {
  return getAccountTotalVolume(fundedTradeHistory.value)
})

const lifetimeTradingVolume = computed(() => {
  return evaluationTradingVolume.value + fundedTradingVolume.value
})

const totalPnl = computed(() => {
  return multiplyBigInt(getAccountHistoryPnl(fundedTradeHistory.value), toBigInt(SHARE_OF_PROFIT))
})

const currentWithdrawableProfit = computed(() => {
  const available = totalPnl.value - withdrawnAmount.value
  return available > 0n ? available : BigInt(0)
})

const tradeWinRateInfo = computed(() => {
  return countTradesWinRate([...evaluationTradeHistory.value, ...fundedTradeHistory.value])
})

const highestWinRateAsset = computed(() => {
  const v = _.maxBy(tradeWinRateInfo.value, (info) => info.winRate)?.market
  return v ?? '--'
})

const tradingWinRate = computed(() => {
  const v = _.maxBy(tradeWinRateInfo.value, (info) => info.winRate)
  return v ? v.winRate : 0
})

const lifetimeProfitWithdrawn = computed(() => {
  return withdrawnAmount.value + currentWithdrawableProfit.value
})
</script>

<template>
  <section class="flex flex-col gap-12 text-[var(--hp-white-color)]">
    <div class="flex flex-col gap-4">
      <div v-if="isConnected" class="relative h-[168px] w-full overflow-hidden" :style="patternStyle">
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
          <p class="!mt-2 text-sm leading-5 text-[var(--hp-text-color)]">Lifetime metrics across all accounts</p>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              {{ formatNumber(toBigInt(tradingWinRate), 2) }}%
            </p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Trading Win Rate</p>
          </div>
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
              ${{ formatNumber(lifetimeProfitWithdrawn, 2) }}
            </p>
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
              ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
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
        <template v-if="!filteredUserEvaluations.length">
          <div class="h-[72px] flex items-center justify-center bg-[var(--hp-bg-light)] text-[var(--hp-white-color)]">
            No accounts available.
          </div>
        </template>

        <template v-else>
          <div
            v-for="(account, index) in filteredUserEvaluations"
            :key="account.accountId"
            class="grid grid-cols-[160px,1.3fr,1.3fr,1.1fr] items-center px-6 py-4 text-[16px] font-medium leading-6"
            :class="index % 2 === 0 ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]'"
          >
            <span class="text-[var(--hp-white-color)]">{{ formatDate(account.timestamp) }}</span>
            <span class="text-[var(--hp-white-color)]">#{{ account.accountId }}</span>
            <span class="text-[var(--hp-white-color)]">{{ getAccountTypeLabel(account.accountType) }}</span>
            <span class="text-[16px] font-medium leading-6 text-[var(--hp-white-color)]">
              {{ getAccountStatusLabel(account.accountStatus) }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 bg-[var(--hp-bg-normal)] px-6 py-4">
      <p class="text-[20px] font-semibold leading-7">Ready for a new Evaluation?</p>
      <button
        type="button"
        class="flex items-center bg-[var(--hp-primary-green)] px-6 py-[14px] text-[16px] font-medium leading-6 text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)]"
        @click="router.push({ name: ROUTE_NAMES.Evaluation })"
      >
        New Evaluation
        <BaseIcon name="arrow" size="18" class="ml-1 rotate-[270deg] text-[var(--hp-black-color)]" />
      </button>
    </div>
  </section>
</template>
