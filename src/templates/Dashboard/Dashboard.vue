<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import { ellipsisMiddle, formatNumber, getAccountTypeLabel } from '@/utils/common'
import { useUserEvaluationsStorage } from '@/storages/heroPath'
import { computed, ref, watch } from 'vue'
import DownArrowIcon from '@/assets/icons/downArrow.svg'
import { useDayCountDown } from '@/use/useDayCountDown'

const { remainingText: dayCountDown } = useDayCountDown()

const { address, isConnected } = useConnection()
const { data: evaluations } = useUserEvaluationsStorage(address)

const selectedEvaluationId = ref<string | null>(null)
const selectedEvaluation = computed(
  () => evaluations.value?.find((evaluation) => evaluation.accountId === selectedEvaluationId.value) || null,
)

const evaluationList = computed(() => {
  return evaluations.value.filter((item) => item.displayStatus.showDrawdown)
})

const displayDate = computed(() => {
  const now = new Date()
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join(
    '-',
  )
})

const selectedEvaluationLabel = computed(() => {
  if (!selectedEvaluation.value) {
    return 'Select Evaluation'
  }
  const size = selectedEvaluation.value.evaluationConfig.accountSize
  return `${getAccountTypeLabel(selectedEvaluation.value.accountType)} #${
    selectedEvaluation.value.accountId
  }: $${formatNumber(size, 0)}`
})

const pnl = computed(() => {
  return 0
})

const accountBalance = computed(() => {
  if (!selectedEvaluation.value) {
    return 0
  }
  return selectedEvaluation.value.evaluationConfig.accountSize + pnl.value
})

const priorDayBalance = computed(() => {
  if (!selectedEvaluation.value) {
    return 0
  }
  return selectedEvaluation.value.evaluationConfig.accountSize
})

const totalVolume = computed(() => {
  return 0
})

const targetEquity = computed(() => {
  if (!selectedEvaluation.value) {
    return 0
  }
  return (
    selectedEvaluation.value.evaluationConfig.accountSize *
    (1 + selectedEvaluation.value.evaluationConfig.profitSplit / 100)
  )
})

const maxDrawdownEquityLimit = computed(() => {
  if (!selectedEvaluation.value) {
    return 0
  }
  return (
    selectedEvaluation.value.evaluationConfig.accountSize *
    (1 - selectedEvaluation.value.evaluationConfig.maxDrawdown / 100)
  )
})

const maxDailyLossEquityLimit = computed(() => {
  if (!selectedEvaluation.value) {
    return 0
  }
  return priorDayBalance.value * (1 - selectedEvaluation.value.evaluationConfig.maxDailyLoss / 100)
})

const highWaterMark = computed(() => {
  return 0
})

const showEvaluationDropdown = ref(false)

function selectEvaluation(id: string) {
  selectedEvaluationId.value = id
  showEvaluationDropdown.value = false
}

watch(
  evaluationList,
  (list) => {
    if (!list.length) {
      selectedEvaluationId.value = null
      return
    }
    if (!selectedEvaluationId.value || !list.some((item) => item.accountId === selectedEvaluationId.value)) {
      selectedEvaluationId.value = list[0].accountId
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="mt-4 mx-auto flex w-full max-w-[1160px] flex-col gap-8 px-4 text-[var(--hp-white-color)] sm:px-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold leading-8">
          <template v-if="isConnected">Welcome Back, {{ ellipsisMiddle(address) }}</template>
          <template v-else>Welcome Back, Guest</template>
        </h1>
        <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ displayDate }}</p>
      </div>

      <div class="flex items-center">
        <div class="relative w-full sm:w-[292px] border-[1px] border-[var(--hp-bg-light)]">
          <button
            type="button"
            class="flex h-[40px] w-full items-center justify-between rounded border px-4 py-3 text-left text-base font-medium active:bg-transparent focus:outline-none focus:ring-0"
            :style="{ borderColor: showEvaluationDropdown ? 'var(--hp-primary-green)' : 'var(--hp-line-light-color)' }"
            @click="showEvaluationDropdown = !showEvaluationDropdown"
          >
            <div class="flex flex-col">
              <span class="text-[var(--hp-white-color)]">{{ selectedEvaluationLabel }}</span>
            </div>
            <span
              class="icon-mask !h-3 !w-3 !bg-[var(--hp-white-color)] transition-transform duration-150"
              :style="{
                '--icon-url': `url(${DownArrowIcon})`,
                transform: showEvaluationDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              }"
            />
          </button>

          <div v-if="showEvaluationDropdown" class="fixed inset-0 z-10" @click="showEvaluationDropdown = false" />

          <div
            v-if="showEvaluationDropdown"
            class="absolute right-0 top-[calc(100%+8px)] z-20 w-full min-w-[280px] overflow-hidden border border-[var(--hp-line-light-color)] bg-[var(--hp-bg-normal)]"
          >
            <div v-if="!evaluationList.length" class="px-4 py-3 text-sm text-[var(--hp-text-color)]">
              No evaluation accounts
            </div>
            <button
              v-for="evaluation in evaluationList"
              :key="evaluation.accountId"
              type="button"
              class="flex w-full items-center cursor-pointer justify-between px-4 py-3 text-left transition hover:bg-[var(--hp-bg-light)] group"
              :class="[
                selectedEvaluationId === evaluation.accountId
                  ? 'text-[var(--hp-primary-green)]'
                  : 'text-[var(--hp-white-color)]',
              ]"
              @click="selectEvaluation(evaluation.accountId)"
            >
              <div
                class="text-base font-semibold text-[var(--hp-text-color)] group-hover:text-[var(--hp-white-color)]"
                :class="[selectedEvaluationId === evaluation.accountId && 'opacity-70']"
              >
                {{
                  `${getAccountTypeLabel(evaluation.accountType)} #${evaluation.accountId}: $${formatNumber(
                    evaluation.evaluationConfig.accountSize,
                    0,
                  )}`
                }}
              </div>
            </button>
          </div>
        </div>
        <button
          type="button"
          class="ml-3 bg-[var(--hp-primary-green)] h-[40px] px-3 py-2.5 text-[var(--hp-black-color)] text-[14px] font-[500] leading-none transition hover:bg-[var(--hp-primary-green-hover)] active:bg-[var(--hp-primary-green-hover)]"
        >
          Open Trading Terminal
        </button>
      </div>
    </header>

    <div class="flex flex-col gap-4">
      <div class="space-y-6 bg-[var(--hp-bg-normal)] p-6">
        <p class="text-xl font-semibold leading-7">
          <span class="text-[var(--hp-primary-green)]">${{ formatNumber(accountBalance, 2) }}</span>
          <span class="pl-1">Evaluation</span>
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
              ${{ formatNumber(accountBalance, 2) }}
            </p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Account Balance</p>
          </div>

          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">${{ formatNumber(pnl, 2) }}</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">PNL</p>
          </div>

          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">
              ${{ formatNumber(totalVolume, 2) }}
            </p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Total Volume</p>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-2xl font-semibold leading-[30px]">Goals Overview</p>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">Profit Target</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)] mt-1">&nbsp;</p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7">${{ formatNumber(accountBalance, 2) }}</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Equity</p>
              <div class="!mt-4 h-px w-full bg-[var(--hp-line-light-color)]" />
            </div>
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-green)]">
                ${{ formatNumber(targetEquity, 2) }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Target Equity</p>
            </div>
          </div>
        </article>

        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">Maximum Drawdown</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)] mt-1">
              High Water Mark: (<span class="text-[var(--hp-white-color)]">${{ formatNumber(highWaterMark, 2) }}</span
              >)
            </p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7">${{ formatNumber(accountBalance, 2) }}</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Equity</p>
              <div class="!mt-4 h-px w-full bg-[var(--hp-line-light-color)]" />
            </div>
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-red)]">
                ${{ formatNumber(maxDrawdownEquityLimit, 2) }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Equity Limit</p>
            </div>
          </div>
        </article>

        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">Maximum Daily Loss</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)] mt-1">
              Prior Day Balance (<span class="text-[var(--hp-white-color)]"
                >${{ formatNumber(priorDayBalance, 2) }}</span
              >)/<span class="text-[var(--hp-primary-green)]">{{ dayCountDown }}</span>
            </p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7">${{ formatNumber(accountBalance, 2) }}</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Equity</p>
              <div class="!mt-4 h-px w-full bg-[var(--hp-line-light-color)]" />
            </div>
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-red)]">
                ${{ formatNumber(maxDailyLossEquityLimit, 2) }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Equity Limit</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
