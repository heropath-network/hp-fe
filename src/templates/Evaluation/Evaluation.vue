<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EvaluationPlan } from '@/types/evaluation'
import { ROUTE_NAMES } from '@/router'
import BaseIcon from '@/components/BaseIcon.vue'
import { useUserQuestDiscountStatusStorage } from '@/storages/heroPath'
import { useConnection } from '@wagmi/vue'
import { QUEST_DISCOUNT_AMOUNT } from '@/constants'
import { EvaluationGlobalConfigInfo, EvaluationPlanConfig } from '@/config/evaluation'

const planTabs = [
  { label: 'Champion Plan', value: EvaluationPlan.ChampionPlan },
  { label: 'Warrior Plan', value: EvaluationPlan.WarriorPlan },
  { label: 'Legend Plan', value: EvaluationPlan.LegendPlan },
]

const { address } = useConnection()

const { data: discountData } = useUserQuestDiscountStatusStorage(address)

const unusedDiscounts = computed(() => discountData.value?.filter((item) => !item.isUsed) ?? [])

const activePlan = ref<EvaluationPlan>(EvaluationPlan.ChampionPlan)
const router = useRouter()

const formatCurrency = (value: number) => `$${value.toLocaleString()}`
const formatFee = (value: number) => `$${value.toFixed(2)}`
const formatPercent = (value: number) => `${value}%`
const formatSplit = (value: number) => `Up to ${formatPercent(value)}`
const formatLeverage = (value: number) => `Up to ${value}x`

const tableData = computed(() => EvaluationPlanConfig[activePlan.value])

const highlights = computed(() => [
  {
    label: 'Profit Split',
    value: formatSplit(EvaluationGlobalConfigInfo.profitSplit),
  },
  {
    label: 'Max. Daily Loss',
    value: formatPercent(EvaluationGlobalConfigInfo.maxDailyLoss),
  },
  {
    label: 'Max. Drawdown',
    value: formatPercent(EvaluationGlobalConfigInfo.maxDrawdown),
  },
  {
    label: 'Leverage',
    value: formatLeverage(EvaluationGlobalConfigInfo.leverage),
  },
])

const hasDiscount = computed(() => unusedDiscounts.value.length > 0)

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

const getDiscountedFee = (fee: number) => Math.max(0, fee - QUEST_DISCOUNT_AMOUNT)
</script>

<template>
  <section class="mt-4 flex flex-col gap-6 text-[var(--hp-white-color)]">
    <header class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold leading-[32px]">Evaluation</h1>
        <button
          type="button"
          class="evaluation-discount-btn flex h-[40px] items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--hp-primary-green)] transition-colors"
          @click="
            () => {
              router.push({ name: ROUTE_NAMES.Quest })
            }
          "
        >
          <BaseIcon name="discount" size="20" class="text-[var(--hp-primary-green)]" />
          <span>Discount: {{ unusedDiscounts.length }}</span>
          <BaseIcon name="arrow" size="16" class="rotate-[-90deg]" />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          v-for="tab in planTabs"
          :key="tab.value"
          class="px-4 py-[14px] text-base font-medium transition-colors"
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
    </header>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="stat in highlights" :key="stat.label" class="flex flex-col gap-1">
        <p class="text-[20px] font-semibold leading-[28px]">{{ stat.value }}</p>
        <div class="flex items-center gap-1 text-sm leading-5 text-[var(--hp-text-color)]">
          <span>{{ stat.label }}</span>
          <BaseIcon name="question" size="16" class="opacity-60 text-[var(--hp-text-color)]" />
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="(item, index) in tableData"
        :key="`${item.level}-${item.accountSize}`"
        class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6"
      >
        <p class="text-[20px] font-semibold leading-[28px]">
          <span class="text-[var(--hp-primary-green)]">{{ formatCurrency(item.accountSize) }}</span>
          <span> Account Size</span>
        </p>

        <div class="flex flex-col gap-2 bg-[var(--hp-bg-light)] p-6">
          <p class="text-[20px] font-semibold leading-[28px]">{{ formatCurrency(item.profitGoal) }}</p>
          <div class="flex items-center gap-1 text-sm leading-5 text-[var(--hp-text-color)]">
            <span>Profit Goal</span>
            <BaseIcon name="question" size="16" class="opacity-60 text-[var(--hp-text-color)]" />
          </div>
        </div>

        <button
          type="button"
          class="evaluation-pay-btn mt-auto flex h-[52px] group items-center justify-center gap-2 px-6 text-[var(--hp-primary-green)] transition-colors"
          @click="handleFeeClick(index)"
        >
          <template v-if="hasDiscount">
            <template v-if="getDiscountedFee(item.fee) === 0">
              <span class="text-[20px] font-semibold leading-[20px]">Free</span>
            </template>
            <template v-else>
              <span class="text-base font-medium leading-[24px]">Pay</span>
              <div
                class="flex flex-col leading-none text-[var(--hp-primary-green)] group-hover:text-[var(--hp-black-color)]"
              >
                <span class="text-[20px] font-semibold leading-[20px]">{{
                  formatFee(getDiscountedFee(item.fee))
                }}</span>
                <span class="text-sm font-medium leading-[16px] opacity-60 line-through">{{
                  formatFee(item.fee)
                }}</span>
              </div>
            </template>
          </template>
          <template v-else>
            <span class="text-base font-medium leading-[24px]">Pay</span>
            <span class="text-[20px] font-semibold leading-[20px]">{{ formatFee(item.fee) }}</span>
          </template>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.evaluation-discount-btn {
  border: 1px solid var(--hp-primary-green);
}
.evaluation-discount-btn:hover {
  border-color: var(--hp-primary-green-hover);
}
.evaluation-pay-btn {
  border: 1px solid var(--hp-primary-green);
}
.evaluation-pay-btn:hover {
  background: var(--hp-primary-green);
  color: var(--hp-black-color);
}
</style>
