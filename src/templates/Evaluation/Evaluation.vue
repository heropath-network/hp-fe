<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EvaluationPlan, type EvaluationConfig } from '@/types/evaluation'
import { ROUTE_NAMES } from '@/router'
import BaseIcon from '@/components/BaseIcon.vue'
import { useUserQuestDiscountStatusStorage } from '@/storages/heroPath'
import { useConnection } from '@wagmi/vue'
import { QUEST_DISCOUNT_AMOUNT } from '@/constants'
import { EvaluationGlobalConfigInfo, EvaluationPlanConfig } from '@/config/evaluation'

type StepRowCommon = {
  label: string
  formatter: (value: number) => string
  highlight?: boolean
  isFee?: boolean
  values?: string[]
  rawValues?: number[]
}

type EvaluationRow = StepRowCommon & {
  key?: keyof EvaluationConfig
  staticValue?: number
}

const planTabs = [
  { label: 'Champion Plan', value: EvaluationPlan.ChampionPlan },
  { label: 'Hero Plan', value: EvaluationPlan.HeroPlan },
  { label: 'Legend Plan', value: EvaluationPlan.LegendPlan },
]

const { address } = useConnection()

const { data: discountData } = useUserQuestDiscountStatusStorage(address)

const unusedDiscounts = computed(() => {
  return discountData.value.filter((item) => !item.isUsed)
})

const activePlan = ref<EvaluationPlan>(EvaluationPlan.ChampionPlan)
const router = useRouter()

const formatCurrency = (value: number) => `$${value.toLocaleString()}`
const formatFee = (value: number) => `$${value.toFixed(2)}`
const formatPercent = (value: number) => `${value}%`
const formatSplit = (value: number) => `Up to ${formatPercent(value)}`
const formatLeverage = (value: number) => `Up to ${value}x`

const evaluationRows: EvaluationRow[] = [
  { key: 'accountSize', label: 'Account Size', formatter: formatCurrency, highlight: true },
  { staticValue: EvaluationGlobalConfigInfo.profitSplit, label: 'Profit Split', formatter: formatSplit },
  { key: 'profitGoal', label: 'Profit Goal', formatter: formatCurrency },
  { staticValue: EvaluationGlobalConfigInfo.maxDailyLoss, label: 'Max.daily loss', formatter: formatPercent },
  { staticValue: EvaluationGlobalConfigInfo.maxDrawdown, label: 'Max. drawdown', formatter: formatPercent },
  { staticValue: EvaluationGlobalConfigInfo.leverage, label: 'Leverage', formatter: formatLeverage },
  { key: 'fee', label: 'Evaluation Fee', formatter: formatFee, isFee: true },
]

const tableData = computed(() => EvaluationPlanConfig[activePlan.value])

const tableRows = computed(() => {
  const definition = evaluationRows

  return definition.map((row) => ({
    ...row,
    values: tableData.value.map((item) => {
      const value = row.staticValue ?? (row.key ? (item as EvaluationConfig)[row.key] : 0)
      return row.formatter(value)
    }),
  }))
})

const columnCount = computed(() => tableData.value.length)

function handleFeeClick(index: number) {
  const payload = {
    plan: activePlan.value,
    selection: tableData.value[index],
  }
  router.push({
    name: ROUTE_NAMES.PurchaseEvaluation,
    query: {
      plan: payload.plan,
      level: tableData.value[index]?.level,
    },
  })
}
</script>

<template>
  <section class="mt-4 flex flex-col gap-6 text-[var(--hp-white-color)]">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold leading-[32px]">Evaluation</h1>
      <div
        class="h-[40px] flex items-center px-[12px] py-[10px] border-[1px] cursor-pointer text-[14px] font-[500] border-[var(--hp-primary-green)] text-[var(--hp-primary-green)]"
        @click="
          () => {
            router.push({ name: ROUTE_NAMES.Quest })
          }
        "
      >
        <BaseIcon name="discount" size="20" class="mr-1 text-[var(--hp-primary-green)]" />
        Discount: {{ unusedDiscounts.length }}
        <BaseIcon name="arrow" size="16" class="ml-1 rotate-[-90deg]" />
      </div>
    </div>

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

      <div class="flex items-center gap-3">
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
                  <template v-if="!!unusedDiscounts.length">
                    <div class="font-[500]">
                      <template v-if="tableData[cellIndex].fee - QUEST_DISCOUNT_AMOUNT <= 0">Free</template>
                      <template v-else>
                        <div class="text-[16px] leading-4">
                          {{ formatFee(tableData[cellIndex].fee - QUEST_DISCOUNT_AMOUNT) }}
                        </div>
                        <div class="text-[14px] leading-[14px] line-through">{{ value }}</div>
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    {{ value }}
                  </template>
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
