<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import { ellipsisMiddle, getAccountTypeLabel } from '@/utils/common'
import { computed, ref, watch } from 'vue'
import { useDayCountDown } from '@/use/useDayCountDown'
import BaseIcon from '@/components/BaseIcon.vue'
import router, { ROUTE_NAMES } from '@/router'
import { useUserTradeHistoryStorage, useUserPositionsStorage } from '@/storages/trading'
import { getAccountHistoryPnl, getAccountTotalVolume, getPositionsUnrealizedPnl } from '@/utils/evaluation'
import { useAllTokenPrices } from '@/use/useTokenPrices'
import { EvaluationPlanConfig } from '@/config/evaluation'
import { useEvaluationAccount } from '@/composables/useEvaluationAccount'
import { useRoute } from 'vue-router'
import { formatNumber, multiplyBigInt, toBigInt, absBigInt } from '@/utils/bigint'
import type { EvaluationPlanBaseConfig } from '@/types/evaluation'
import { inferPlanFromConfig } from '@/utils/evaluationPlan'
import AboutAccountDialog from '@/templates/Evaluation/AboutAccountDialog.vue'
import HeroPrizeDescDialog from '@/templates/Evaluation/HeroPrizeDescDialog.vue'

const { remainingText: dayCountDown } = useDayCountDown()

const { address, isConnected } = useConnection()
const { data: allTradeHistory } = useUserTradeHistoryStorage(address)
const { data: allPositions } = useUserPositionsStorage(address)

const { prices: allTokenPrices } = useAllTokenPrices()
const route = useRoute()

const { evaluationList, selectedEvaluationId, selectedEvaluation, selectEvaluation } = useEvaluationAccount()

const showAboutAccountDialog = ref(false)
const showHeroPrizeDescDialog = ref(false)

const accountTradeHistory = computed(() => {
  if (!selectedEvaluation.value) {
    return []
  }
  return allTradeHistory.value.filter((trade) => trade.accountId === selectedEvaluation.value!.accountId)
})

const accountPositions = computed(() => {
  if (!selectedEvaluation.value) {
    return []
  }
  return allPositions.value.filter((position) => position.accountId === selectedEvaluation.value!.accountId)
})

const dashboardEvaluationList = computed(() => {
  return evaluationList.value.filter((item) => item.displayStatus.showDashboard)
})

const displayDate = computed(() => {
  const now = new Date()
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join(
    '-',
  )
})

const selectedEvaluationLabel = computed(() => {
  if (!selectedEvaluation.value) {
    return 'Select Account'
  }
  const size = toBigInt(selectedEvaluation.value.evaluationConfig.accountSize)
  return `${getAccountTypeLabel(selectedEvaluation.value.accountType)} #${
    selectedEvaluation.value.accountId
  }: $${formatNumber(size, 0)}`
})

const accountSize = computed(() => {
  if (!selectedEvaluation.value) {
    return BigInt(0)
  }
  return toBigInt(selectedEvaluation.value.evaluationConfig.accountSize)
})

const historyPnl = computed(() => {
  if (!selectedEvaluation.value) {
    return BigInt(0)
  }
  return getAccountHistoryPnl(accountTradeHistory.value)
})

const positionsUnrealizedPnl = computed(() => {
  if (!selectedEvaluation.value) {
    return BigInt(0)
  }
  return getPositionsUnrealizedPnl(accountPositions.value, allTokenPrices.value)
})

const pnl = computed(() => {
  return historyPnl.value + positionsUnrealizedPnl.value
})

const accountBalance = computed(() => {
  return accountSize.value + pnl.value
})

const priorDayBalance = computed(() => {
  return accountSize.value
})

const totalVolume = computed(() => {
  return getAccountTotalVolume(accountTradeHistory.value)
})

const targetEquity = computed(() => {
  if (!selectedEvaluation.value) {
    return BigInt(0)
  }
  return accountSize.value + toBigInt(selectedEvaluation.value.evaluationConfig.profitGoal)
})

const selectedPlanBase = computed<EvaluationPlanBaseConfig | null>(() => {
  if (!selectedEvaluation.value) {
    return null
  }

  const { evaluationConfig, plan } = selectedEvaluation.value
  const resolvedPlanKey = EvaluationPlanConfig[plan] ? plan : inferPlanFromConfig(evaluationConfig)
  const matchedPlan = resolvedPlanKey ? EvaluationPlanConfig[resolvedPlanKey] : null

  return matchedPlan?.base ?? null
})

const maxDrawdownEquityLimit = computed(() => {
  if (!selectedPlanBase.value) {
    return BigInt(0)
  }
  const maxDrawdownMultiplier = toBigInt(1 - selectedPlanBase.value.maxDrawdown / 100)
  return multiplyBigInt(accountSize.value, maxDrawdownMultiplier)
})

const maxDailyLossEquityLimit = computed(() => {
  if (!selectedPlanBase.value) {
    return BigInt(0)
  }
  const maxDailyLossMultiplier = toBigInt(1 - selectedPlanBase.value.maxDailyLoss / 100)
  return multiplyBigInt(priorDayBalance.value, maxDailyLossMultiplier)
})

const showEvaluationDropdown = ref(false)

const routeAccountId = computed(() => {
  const id = route.query.id
  return Array.isArray(id) ? id[0] : id
})

watch(
  [routeAccountId, dashboardEvaluationList],
  ([routeId, list]) => {
    if (!list.length) {
      return
    }
    const matchedAccountId = routeId && list.find((item) => item.accountId === routeId)?.accountId
    const targetId = matchedAccountId || list[0].accountId

    if (selectedEvaluationId.value !== targetId) {
      selectEvaluation(targetId)
    }

    if (routeId !== targetId) {
      router.replace({ name: ROUTE_NAMES.Dashboard, query: { ...route.query, id: targetId } })
    }
  },
  { immediate: true },
)

function handleSelectEvaluation(id: string) {
  selectEvaluation(id)
  router.replace({ name: ROUTE_NAMES.Dashboard, query: { ...route.query, id } })
  showEvaluationDropdown.value = false
}

function openTradeTerminal() {
  window.open(router.resolve({ name: ROUTE_NAMES.Trade }).href, '_blank')
}
</script>

<template>
  <section class="mt-4 flex flex-col gap-8 text-[var(--hp-white-color)]">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold leading-8">
          <template v-if="isConnected">Welcome Back, {{ ellipsisMiddle(address) }}</template>
          <template v-else>Please Connect Wallet</template>
        </h1>
        <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ displayDate }}</p>
      </div>

      <div class="flex items-center">
        <div class="relative w-full border-[1px] border-[var(--hp-bg-light)]">
          <button
            type="button"
            class="flex h-[40px] w-full items-center justify-between rounded border px-4 py-3 text-left text-base font-medium active:bg-transparent focus:outline-none focus:ring-0"
            :style="{ borderColor: showEvaluationDropdown ? 'var(--hp-primary-green)' : 'var(--hp-line-normal-color)' }"
            @click="showEvaluationDropdown = !showEvaluationDropdown"
          >
            <div class="flex flex-col">
              <span class="text-[var(--hp-white-color)]">{{ selectedEvaluationLabel }}</span>
            </div>
            <BaseIcon
              name="downArrow"
              size="12"
              class="transition-transform duration-150 text-[var(--hp-white-color)] ml-1"
              :class="showEvaluationDropdown ? 'rotate-180' : ''"
            />
          </button>

          <div v-if="showEvaluationDropdown" class="fixed inset-0 z-10" @click="showEvaluationDropdown = false" />

          <div
            v-if="showEvaluationDropdown"
            class="absolute right-0 top-[calc(100%+8px)] z-20 w-full min-w-[280px] overflow-hidden border border-[var(--hp-line-light-color)] bg-[var(--hp-bg-light)]"
          >
            <template v-if="!dashboardEvaluationList.length">
              <div class="px-4 py-3 text-sm text-[var(--hp-white-color)]">No Account</div>
            </template>
            <template v-else>
              <button
                v-for="evaluation in dashboardEvaluationList"
                :key="evaluation.accountId"
                type="button"
                class="flex w-full items-center cursor-pointer justify-between px-4 py-3 text-left transition bg-[var(--hp-line-normal-color)] hover:bg-[var(--hp-line-light-color)] group"
                :class="[
                  selectedEvaluationId === evaluation.accountId
                    ? 'text-[var(--hp-primary-green)]'
                    : 'text-[var(--hp-white-color)]',
                ]"
                @click="handleSelectEvaluation(evaluation.accountId)"
              >
                <div
                  class="text-base font-semibold text-[var(--hp-text-color)] group-hover:text-[var(--hp-white-color)]"
                  :class="[selectedEvaluationId === evaluation.accountId && 'opacity-70']"
                >
                  {{
                    `${getAccountTypeLabel(evaluation.accountType)} #${evaluation.accountId}: $${formatNumber(
                      toBigInt(evaluation.evaluationConfig.accountSize),
                      0,
                    )}`
                  }}
                </div>
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-col gap-4">
      <div class="space-y-6 bg-[var(--hp-bg-normal)] p-6">
        <div class="text-xl font-semibold leading-7">
          <span class="text-[var(--hp-primary-green)]">${{ formatNumber(accountSize, 2) }}</span>
          <span class="pl-1">
            <template v-if="selectedEvaluation?.accountType === 'funded'">Hero Account</template>
            <template v-else>Evaluation</template>
          </span>
        </div>
        <p class="text-[14px] leading-[20px] text-[var(--hp-text-color)] font-[400] mt-1">
          <template v-if="!isConnected"
            >Start your HeroPath journey by taking an evaluation and get a chance to acquire a hero account.</template
          >
          <template v-else-if="selectedEvaluation?.accountType === 'funded'">
            Trade with the hero account and contribute trading signals/insights to the protocol’s own independent
            trading strategy and earn prizes.
            <span class="underline cursor-pointer">Learn More</span>
          </template>
          <template v-else>
            Complete the evaluation to acquire a hero account after proving your trading skills.
            <span @click="showAboutAccountDialog = true" class="text-[var(--hp-primary-green)] underline cursor-pointer"
              >About Hero Account</span
            >
          </template>
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
              ${{ formatNumber(accountBalance, 2) }}
            </p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Account Balance</p>
          </div>

          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
              {{ pnl < 0 ? '-' : '' }}${{ formatNumber(absBigInt(pnl), 2) }}
            </p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Total Profit</p>
          </div>

          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
              ${{ formatNumber(totalVolume, 2) }}
            </p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Total Volume</p>
          </div>
        </div>
        <button
          type="button"
          class="flex items-center w-full justify-center bg-[var(--hp-primary-green)] h-[52px] py-2.5 text-[var(--hp-black-color)] text-[16px] font-[500] transition hover:bg-[var(--hp-primary-green-hover)] active:bg-[var(--hp-primary-green-hover)]"
          @click="openTradeTerminal"
        >
          Open Trading Terminal
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-1">
        <h3 class="text-2xl font-semibold leading-[30px]">Account Details</h3>
      </div>
      <div class="space-y-4 bg-[var(--hp-bg-normal)] p-6">
        <p class="text-xl font-semibold leading-7">
          <span class="text-[var(--hp-primary-green)]">${{ formatNumber(accountBalance, 2) }}</span>
          Current Equity
        </p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <template v-if="selectedEvaluation?.accountType === 'funded'">
            <article class="flex h-[100px] flex-col justify-center gap-2 bg-[var(--hp-bg-light)] px-6 py-5">
              <div>
                <p
                  class="text-xl font-semibold leading-7 text-[var(--hp-primary-green)] underline cursor-pointer"
                  @click="showHeroPrizeDescDialog = true"
                >
                  Hero Prize
                </p>
                <p class="text-sm leading-5 text-[var(--hp-text-color)]">Account Prize</p>
              </div>
            </article>
          </template>
          <template v-else>
            <article class="flex h-[100px] flex-col justify-center gap-2 bg-[var(--hp-bg-light)] px-6 py-5">
              <div>
                <p class="text-xl font-semibold leading-7 text-[var(--hp-text-green)]">
                  ${{ formatNumber(targetEquity, 2) }}
                </p>
                <p class="text-sm leading-5 text-[var(--hp-text-color)]">Profit Target Equity</p>
              </div>
            </article>
          </template>

          <article class="relative flex h-[100px] flex-col justify-center gap-2 bg-[var(--hp-bg-light)] px-6 py-5">
            <div>
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-red)]">
                ${{ formatNumber(maxDrawdownEquityLimit, 2) }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Max. Drawdown Equity Limit</p>
            </div>
          </article>

          <article class="relative flex h-[100px] flex-col justify-center gap-2 bg-[var(--hp-bg-light)] px-6 py-5">
            <div
              class="absolute left-0 top-0 rounded-sm bg-[var(--hp-line-normal-color)] px-2 py-1 text-[12px] leading-4 text-[var(--hp-text-color)]"
            >
              Prior Day Balance: (<span class="text-[var(--hp-white-color)]">
                ${{ formatNumber(priorDayBalance, 2) }}</span
              >
              / <span class="text-[var(--hp-white-color)]">{{ dayCountDown }}</span
              >)
            </div>
            <div>
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-red)]">
                ${{ formatNumber(maxDailyLossEquityLimit, 2) }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Max.Daily Loss Equity Limit</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
  <AboutAccountDialog v-if="showAboutAccountDialog" @close="showAboutAccountDialog = false" />
  <HeroPrizeDescDialog v-if="showHeroPrizeDescDialog" @close="showHeroPrizeDescDialog = false" />
</template>
