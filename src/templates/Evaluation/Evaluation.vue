<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { STEP1, STEP2 } from '@/config/evaluation'
import {
  EvaluationPlan,
  EvaluationSteps,
  type EvaluationStep1Config,
  type EvaluationStep2Config,
} from '@/types/evaluation'
import { ROUTE_NAMES } from '@/router'
import BaseIcon from '@/components/BaseIcon.vue'

type StepRow =
  | {
      key: keyof EvaluationStep1Config
      label: string
      formatter: (value: number) => string
      highlight?: boolean
      isFee?: boolean
    }
  | {
      key: keyof EvaluationStep2Config
      label: string
      formatter: (value: number) => string
      highlight?: boolean
      isFee?: boolean
    }

// const stepTabs = [
//   { label: '1 Step', value: EvaluationSteps.Step1 },
//   // { label: '2 Step', value: EvaluationSteps.Step2 },
// ]

const planTabs = [
  { label: 'Classic Plan', value: EvaluationPlan.Classic },
  { label: 'Pro Plan', value: EvaluationPlan.Pro },
  { label: 'Turbo Plan', value: EvaluationPlan.Turbo },
]

const activeStep = ref<EvaluationSteps>(EvaluationSteps.Step1)
const activePlan = ref<EvaluationPlan>(EvaluationPlan.Classic)
const router = useRouter()

const formatCurrency = (value: number) => `$${value.toLocaleString()}`
const formatFee = (value: number) => `$${value.toFixed(2)}`
const formatPercent = (value: number) => `${value}%`
const formatSplit = (value: number) => `Up to ${formatPercent(value)}`
const formatLeverage = (value: number) => `Up to ${value}x`

const rowsStep1: StepRow[] = [
  { key: 'accountSize', label: 'Account Size', formatter: formatCurrency, highlight: true },
  { key: 'profitSplit', label: 'Profit Split', formatter: formatSplit },
  { key: 'step1Goal', label: 'Step 1 goal', formatter: formatCurrency },
  { key: 'maxDailyLoss', label: 'Max.daily loss', formatter: formatPercent },
  { key: 'maxDrawdown', label: 'Max. drawdown', formatter: formatPercent },
  { key: 'leverage', label: 'Leverage', formatter: formatLeverage },
  { key: 'fee', label: 'Evaluation Fee', formatter: formatFee, isFee: true },
]

const rowsStep2: StepRow[] = [
  { key: 'accountSize', label: 'Account Size', formatter: formatCurrency, highlight: true },
  { key: 'profitSplit', label: 'Profit Split', formatter: formatSplit },
  { key: 'step1Goal', label: 'Step 1 goal', formatter: formatCurrency },
  { key: 'step2Goal', label: 'Step 2 goal', formatter: formatCurrency },
  { key: 'maxDailyLoss', label: 'Max.daily loss', formatter: formatPercent },
  { key: 'maxDrawdown', label: 'Max. drawdown', formatter: formatPercent },
  { key: 'leverage', label: 'Leverage', formatter: formatLeverage },
  { key: 'fee', label: 'Evaluation Fee', formatter: formatFee, isFee: true },
]

const tableData = computed(() => (activeStep.value === EvaluationSteps.Step1 ? STEP1[activePlan.value] : STEP2))

const tableRows = computed(() => {
  const definition = activeStep.value === EvaluationSteps.Step1 ? rowsStep1 : rowsStep2

  return definition.map((row) => ({
    ...row,
    values: tableData.value.map((item) => row.formatter((item as any)[row.key] as number)),
  }))
})

const columnCount = computed(() => tableData.value.length)

function handleFeeClick(index: number) {
  const payload = {
    step: activeStep.value,
    plan: activeStep.value === EvaluationSteps.Step1 ? activePlan.value : undefined,
    selection: tableData.value[index],
  }
  router.push({
    name: ROUTE_NAMES.PurchaseEvaluation,
    query: {
      step: payload.step,
      plan: payload.plan,
      level: tableData.value[index]?.level,
    },
  })
}
</script>

<template>
  <section class="mt-4 flex flex-col gap-6 text-[var(--hp-white-color)]">
    <h1 class="text-2xl font-semibold leading-[32px]">Evaluation</h1>

    <div class="flex flex-col gap-4">
      <!-- <div class="flex items-center gap-3">
        <button
          v-for="tab in stepTabs"
          :key="tab.value"
          class="px-4 py-[14px] text-base font-medium"
          :class="
            tab.value === activeStep
              ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
              : 'text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]'
          "
          @click="activeStep = tab.value"
          type="button"
        >
          {{ tab.label }}
        </button>
      </div> -->

      <div v-if="activeStep === EvaluationSteps.Step1" class="flex items-center gap-3">
        <button
          v-for="tab in planTabs"
          :key="tab.value"
          class="px-4 py-[14px] text-base font-medium"
          :class="
            tab.value === activePlan
              ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
              : 'text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]'
          "
          @click="activePlan = tab.value"
          type="button"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div class="min-w-[960px]">
        <div
          v-for="(row, index) in tableRows"
          :key="row.label"
          class="flex min-h-[72px] w-full items-center"
          :class="index % 2 === 0 ? 'bg-[var(--hp-bg-normal)]' : 'bg-[var(--hp-bg-light)]'"
        >
          <div class="flex w-[160px] items-center gap-1 px-6 text-sm text-[var(--hp-text-color)]">
            <span class="whitespace-nowrap">{{ row.label }}</span>
            <BaseIcon name="menu-question" size="16" class="flex-shrink-0 opacity-60 text-[var(--hp-text-color)]" />
          </div>

          <div
            class="grid h-full flex-1 items-center text-center"
            :style="{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }"
          >
            <div
              v-for="(value, cellIndex) in row.values"
              :key="`${row.label}-${cellIndex}`"
              class="flex h-full items-center justify-center px-2 text-base font-medium"
            >
              <template v-if="row.isFee">
                <button
                  type="button"
                  class="flex h-10 w-[104px] items-center justify-center bg-[var(--hp-primary-green)] text-[16px] font-medium text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)]"
                  @click="handleFeeClick(cellIndex)"
                >
                  {{ value }}
                </button>
              </template>
              <template v-else>
                <span
                  class="text-[16px]"
                  :class="row.highlight ? 'text-[var(--hp-primary-green)]' : 'text-[var(--hp-white-color)]'"
                >
                  {{ value }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
