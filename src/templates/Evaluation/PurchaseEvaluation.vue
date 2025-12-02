<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { STEP1, STEP2 } from '@/config/evaluation'
import { ROUTE_NAMES } from '@/router'
import {
  EvaluationPlan,
  EvaluationSteps,
  type EvaluationStep1Config,
  type EvaluationStep2Config,
} from '@/types/evaluation'
import { useConnection, useSignTypedData } from '@wagmi/vue'
import { MOCK_TOKEN_PRICES, PaymentTokens } from '@/config/paymentTokens'
import { useUserEvaluationsStorage } from '@/storages/heroPath'
import { generateTimeBasedSixDigitId } from '@/utils/common'
import { BaseIcon, LoadingIcon } from '@/components'

type AccountOption = EvaluationStep1Config | EvaluationStep2Config

const requireSymbolIcon = (symbol: string) => {
  return new URL(`/src/assets/icons/tokens/${symbol}.svg`, import.meta.url).href
}

const stepTabs = [
  { label: '1 Step', value: EvaluationSteps.Step1 },
  { label: '2 Step', value: EvaluationSteps.Step2 },
]

const planTabs = [
  { label: 'Classic Plan', value: EvaluationPlan.Classic },
  { label: 'Pro Plan', value: EvaluationPlan.Pro },
  { label: 'Turbo Plan', value: EvaluationPlan.Turbo },
]

const { signTypedDataAsync } = useSignTypedData()
const { isConnected, address } = useConnection()

const signing = ref(false)

const { addEvaluation } = useUserEvaluationsStorage(address)

const paymentTokens = PaymentTokens

const route = useRoute()
const router = useRouter()

const activeStep = ref<EvaluationSteps>(EvaluationSteps.Step1)
const activePlan = ref<EvaluationPlan>(EvaluationPlan.Classic)
const selectedAccountIndex = ref(0)
const showAccountDropdown = ref(false)
const showTokenDropdown = ref(false)
const selectedToken = ref(paymentTokens[0])
const profitSplitChecked = ref(false)
const affiliateChecked = ref(false)
const affiliateCode = ref('')
const agreeProgram = ref(false)
const agreeRefund = ref(false)
const pendingLevel = ref<number | null>(null)

const activePlanList = computed(() => (activeStep.value === EvaluationSteps.Step1 ? planTabs : []))

const accountOptions = computed<AccountOption[]>(() => {
  return activeStep.value === EvaluationSteps.Step1 ? STEP1[activePlan.value] : STEP2
})

watch(
  accountOptions,
  () => {
    if (selectedAccountIndex.value >= accountOptions.value.length) {
      selectedAccountIndex.value = 0
    }
  },
  { immediate: true },
)

const selectedTokenUsdBalance = computed(() => {
  const balance = Number(selectedToken.value.balance ?? 0)
  const price = MOCK_TOKEN_PRICES[selectedToken.value.symbol] ?? 0
  return balance * price
})

const selectedAccount = computed(() => accountOptions.value[selectedAccountIndex.value])

const basePrice = computed(() => (selectedAccount.value ? selectedAccount.value.fee : 0))
const profitSplitFee = computed(() => (profitSplitChecked.value ? Number((basePrice.value * 0.1).toFixed(2)) : 0))
const purchaseTotal = computed(() => (basePrice.value + profitSplitFee.value).toFixed(2))

const productLabel = computed(() => {
  const size = selectedAccount.value?.accountSize ?? 0
  const stepLabel = activeStep.value === EvaluationSteps.Step1 ? '1 Step' : '2 Step'
  return `$${size.toLocaleString()} - ${stepLabel}`
})

function formatCurrency(value: number | string) {
  const num = typeof value === 'string' ? Number(value) : value
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function selectAccount(index: number) {
  selectedAccountIndex.value = index
  showAccountDropdown.value = false
}

function selectToken(token: (typeof paymentTokens)[number]) {
  selectedToken.value = token
  showTokenDropdown.value = false
}

function toggleStep(step: EvaluationSteps) {
  activeStep.value = step
  if (step === EvaluationSteps.Step2) {
    activePlan.value = EvaluationPlan.Classic
  }
}

function initFromQuery() {
  const { step, plan, level } = route.query

  if (step === EvaluationSteps.Step2 || step === EvaluationSteps.Step1) {
    activeStep.value = step as EvaluationSteps
  }

  if (plan && Object.values(EvaluationPlan).includes(plan as EvaluationPlan)) {
    activePlan.value = plan as EvaluationPlan
  }

  const indexLevel = Number(level)
  if (!Number.isNaN(indexLevel) && indexLevel >= 0) {
    pendingLevel.value = indexLevel
  }
}

initFromQuery()

watch(
  accountOptions,
  (options) => {
    if (pendingLevel.value !== null) {
      const foundIndex = options.findIndex((item) => item.level === pendingLevel.value)
      if (foundIndex >= 0) {
        selectedAccountIndex.value = foundIndex
      } else {
        selectedAccountIndex.value = 0
      }
      pendingLevel.value = null
    } else if (selectedAccountIndex.value >= options.length) {
      selectedAccountIndex.value = 0
    }
  },
  { immediate: true },
)

watch(
  () => route.query,
  () => {
    initFromQuery()
  },
)

function handleBack() {
  router.push({ name: ROUTE_NAMES.Evaluation })
}

const isInsufficientBalance = computed(() => {
  const balanceUsd = selectedTokenUsdBalance.value
  return balanceUsd < Number(purchaseTotal.value)
})

const confirmButtonDisabled = computed(() => {
  return !isConnected.value || !agreeRefund.value || !agreeProgram.value || isInsufficientBalance.value || signing.value
})

async function handlePurchase() {
  const payload = {
    step: activeStep.value,
    plan: activeStep.value === EvaluationSteps.Step1 ? activePlan.value : undefined,
    account: selectedAccount.value,
    token: selectedToken.value,
    profitSplit: profitSplitChecked.value,
    affiliate: affiliateChecked.value ? affiliateCode.value : undefined,
    agreeProgram: agreeProgram.value,
    agreeRefund: agreeRefund.value,
    total: purchaseTotal.value,
  }

  const evaluationId = generateTimeBasedSixDigitId()
  const signMsg = `Purchase Evaluation Order\n\nEvaluation ID: ${evaluationId}\nProduct: ${productLabel.value}\nTotal: $${purchaseTotal.value}\n\n.`

  try {
    const evaluationConfig = payload.account
    if (!evaluationConfig) {
      throw new Error('No evaluation account configuration found')
    }
    signing.value = true
    await signTypedDataAsync({
      types: {
        Person: [{ name: 'wallet', type: 'address' }],
        Purchase: [
          { name: 'account', type: 'Person' },
          { name: 'token', type: 'string' },
          { name: 'address', type: 'string' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Purchase',
      message: {
        account: {
          wallet: address.value!,
        },
        token: selectedToken.value.symbol!,
        address: selectedToken.value.address!,
        contents: signMsg,
      },
    })

    addEvaluation({
      accountId: evaluationId,
      evaluationConfig,
      accountType: 'evaluation',
      accountStatus: 'active',
      displayStatus: {
        showDrawdown: true,
        showPublic: true,
      },
      timestamp: Math.floor(Date.now() / 1000),
    })

    router.push({ name: ROUTE_NAMES.Dashboard })
  } catch (error) {
    // handle error (e.g., user rejected signing)
    console.error('Purchase failed:', error)
  } finally {
    signing.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-[var(--hp-bg-dark)] text-[var(--hp-white-color)] px-4 pb-12 pt-10">
    <div class="mx-auto flex w-full max-w-[720px] items-center gap-3">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded hover:[&>span]:text-[var(--hp-text-color)]"
        @click="handleBack"
      >
        <span class="text-2xl font-semibold text-[var(--hp-white-color)]">←</span>
      </button>
      <h1 class="text-2xl font-semibold leading-[30px]">Purchase Evaluation Order Info</h1>
    </div>

    <div class="mx-auto mt-6 w-full max-w-[720px]">
      <div class="space-y-6 bg-[var(--hp-bg-normal)] p-6">
        <div class="space-y-4">
          <p class="text-lg font-semibold">Evaluation Type</p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="tab in stepTabs"
              :key="tab.value"
              type="button"
              class="px-4 py-[14px] text-base font-medium"
              :class="
                tab.value === activeStep
                  ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
                  : 'text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]'
              "
              @click="toggleStep(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
          <div v-if="activePlanList.length" class="flex flex-wrap gap-3">
            <button
              v-for="tab in activePlanList"
              :key="tab.value"
              type="button"
              class="px-4 py-[14px] text-base font-medium"
              :class="
                tab.value === activePlan
                  ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
                  : 'text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]'
              "
              @click="activePlan = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="space-y-6 bg-[var(--hp-bg-light)] p-4">
          <!-- Account size -->
          <div class="space-y-2 border border-[var(--hp-line-light-color)] p-4">
            <div class="text-sm text-[var(--hp-text-color)]">
              Account Size <span class="text-[var(--hp-primary-green)]">*</span>
            </div>
            <div class="relative">
              <button
                type="button"
                class="flex w-full items-center justify-between text-lg font-semibold group"
                @click="showAccountDropdown = !showAccountDropdown"
              >
                <span>{{
                  selectedAccount?.accountSize ? `$${selectedAccount.accountSize.toLocaleString()}` : '--'
                }}</span>
                <BaseIcon
                  name="downArrow"
                  size="12"
                  class="text-[var(--hp-text-color)] transition-transform duration-200 group-hover:text-[var(--hp-primary-green)]"
                  :class="showAccountDropdown ? 'rotate-180' : ''"
                />
              </button>

              <!-- backdrop to capture outside clicks and close the dropdown -->
              <div v-if="showAccountDropdown" class="fixed inset-0 z-10" @click="showAccountDropdown = false" />

              <div
                v-if="showAccountDropdown"
                class="absolute left-[-17px] top-[42px] z-20 mt-2 w-[calc(100%+34px)] overflow-hidden border border-[var(--hp-line-light-color)] bg-[var(--hp-bg-light)]"
              >
                <button
                  v-for="(item, idx) in accountOptions"
                  :key="item.level"
                  type="button"
                  class="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[var(--hp-line-light-color)]"
                  :class="idx === selectedAccountIndex ? 'text-[var(--hp-text-color)]' : 'text-[var(--hp-white-color)]'"
                  @click="selectAccount(idx)"
                >
                  <span class="text-base font-semibold">${{ item.accountSize.toLocaleString() }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="space-y-2 border border-[var(--hp-line-light-color)] p-4">
            <div class="flex items-center justify-between text-sm text-[var(--hp-text-color)]">
              <span>Pay <span class="text-[var(--hp-primary-green)]">*</span></span>
              <span>
                Balance:
                {{
                  Number(selectedToken.balance ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: Number(selectedToken.formatDecimals ?? 0),
                    maximumFractionDigits: Number(selectedToken.formatDecimals ?? 0),
                  })
                }}
              </span>
            </div>
            <div class="relative">
              <button
                type="button"
                class="flex w-full items-center justify-between text-lg font-semibold group"
                @click="showTokenDropdown = !showTokenDropdown"
              >
                <div class="flex items-center gap-2">
                  <img class="h-[22px] w-[22px]" :src="requireSymbolIcon(selectedToken.symbol)" />
                  <span>{{ selectedToken.symbol }}</span>
                </div>
                <BaseIcon
                  name="downArrow"
                  size="12"
                  class="text-[var(--hp-text-color)] transition-transform duration-200 group-hover:text-[var(--hp-primary-green)]"
                  :class="showTokenDropdown ? 'rotate-180' : ''"
                />
              </button>

              <!-- backdrop to capture outside clicks and close the dropdown -->
              <div v-if="showTokenDropdown" class="fixed inset-0 z-10" @click="showTokenDropdown = false" />

              <div
                v-if="showTokenDropdown"
                class="absolute left-[-17px] top-[42px] z-20 mt-2 w-[calc(100%+34px)] overflow-hidden border border-[var(--hp-line-light-color)] bg-[var(--hp-bg-light)]"
              >
                <button
                  v-for="token in paymentTokens"
                  :key="token.symbol"
                  type="button"
                  class="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[var(--hp-line-light-color)]"
                  @click="selectToken(token)"
                >
                  <div
                    class="flex items-center gap-2"
                    :class="[selectedToken.symbol === token.symbol ? 'opacity-60' : '']"
                  >
                    <img class="h-[22px] w-[22px]" :src="requireSymbolIcon(token.symbol)" />
                    <span class="text-base font-semibold text-[var(--hp-white-color)]">{{ token.symbol }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between text-[var(--hp-text-color)]">
              <span>Product</span>
              <span class="text-[var(--hp-white-color)]">{{ productLabel }}</span>
            </div>
            <div class="flex items-center justify-between text-[var(--hp-text-color)]">
              <span>Price</span>
              <span class="text-[var(--hp-white-color)]">{{ formatCurrency(basePrice) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="flex cursor-pointer items-center gap-2 text-[var(--hp-text-color)]">
                <input v-model="profitSplitChecked" type="checkbox" class="h-4 w-4 accent-[var(--hp-primary-green)]" />
                <span>{{ selectedAccount.profitSplit }}/{{ 100 - selectedAccount.profitSplit }} Profit Split</span>
              </label>
              <span class="text-[var(--hp-white-color)]">{{ formatCurrency(profitSplitFee) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--hp-text-color)]">Purchase</span>
              <span class="text-xl font-semibold text-[var(--hp-primary-green)]">
                {{ profitSplitChecked ? `${purchaseTotal} ${selectedToken.symbol}` : formatCurrency(basePrice) }}
              </span>
            </div>
          </div>

          <div class="h-px w-full bg-[var(--hp-line-light-color)]" />

          <div class="space-y-3">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-[var(--hp-text-color)]">
              <input v-model="affiliateChecked" type="checkbox" class="h-4 w-4 accent-[var(--hp-primary-green)]" />
              <span>Affiliate code</span>
            </label>
            <div
              v-if="affiliateChecked"
              class="flex flex-col gap-3 border border-[var(--hp-line-light-color)] p-4 md:flex-row md:items-center md:justify-between"
            >
              <div class="flex flex-1 items-center gap-3">
                <input
                  v-model="affiliateCode"
                  type="text"
                  placeholder="Type your Affiliate Code here"
                  class="w-full bg-transparent text-lg font-semibold text-[var(--hp-white-color)] placeholder:text-[var(--hp-text-color)] focus:outline-none"
                />
              </div>
              <button
                type="button"
                class="mt-2 inline-flex items-center justify-center bg-[var(--hp-primary-green)] px-4 py-2 text-sm font-medium text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)] md:mt-0 md:w-[120px]"
              >
                Verify
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-3 text-sm text-[var(--hp-text-color)]">
          <label class="flex cursor-pointer items-start gap-2">
            <input v-model="agreeProgram" type="checkbox" class="mt-0.5 h-4 w-4 accent-[var(--hp-primary-green)]" />
            <span class="leading-5">
              I have read, understood, and agree to the
              <span class="underline">Program Rules</span> and the <span class="underline">Evaluation Agreement</span>
              <span class="text-[var(--hp-primary-green)]">*</span>
            </span>
          </label>
          <label class="flex cursor-pointer items-start gap-2">
            <input v-model="agreeRefund" type="checkbox" class="mt-0.5 h-4 w-4 accent-[var(--hp-primary-green)]" />
            <span class="leading-5">
              I agree to the <span class="underline">Refund Policy</span> and
              <span class="underline">Chargeback Policy</span>
              <span class="text-[var(--hp-primary-green)]">*</span>
            </span>
          </label>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center bg-[var(--hp-primary-green)] px-6 py-3 text-base font-medium text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)]"
          :class="[confirmButtonDisabled ? 'opacity-50 cursor-not-allowed' : '']"
          :disabled="confirmButtonDisabled"
          @click="handlePurchase"
        >
          {{ isInsufficientBalance ? 'Insufficient Balance' : 'Purchase' }}
          <LoadingIcon v-if="signing" class="ml-2" :isBlack="true" />
        </button>
      </div>
    </div>
  </section>
</template>
