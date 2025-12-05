<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router'
import { EvaluationPlan, EvaluationConfig } from '@/types/evaluation'
import { useConnection, useSignTypedData } from '@wagmi/vue'
import { TOKEN_PRICES, PaymentTokens } from '@/config/paymentTokens'
import { useUserEvaluationsStorage } from '@/storages/heroPath'
import { generateTimeBasedSixDigitId } from '@/utils/common'
import { BaseIcon, LoadingIcon } from '@/components'
import { usePaymentTokenPrices } from '@/use/usePaymentTokenPrices'
import { EvaluationPlanConfig } from '@/config/evaluation'
import { useUserQuestDiscountStatusStorage } from '@/storages/heroPath'
import { QUEST_DISCOUNT_AMOUNT } from '@/constants'
import { divideBigInt, formatNumber, fromBigInt, multiplyBigInt, toBigInt } from '@/utils/bigint'
import HeroIcon from '@/assets/icons/tokens/HERO.svg'

const requireSymbolIcon = (symbol: string) => {
  return new URL(`/src/assets/icons/tokens/${symbol}.svg`, import.meta.url).href
}

const { prices: apiPrices } = usePaymentTokenPrices()

const planTabs = [
  { label: 'Champion Plan', value: EvaluationPlan.ChampionPlan },
  { label: 'Warrior Plan', value: EvaluationPlan.WarriorPlan },
  { label: 'Legend Plan', value: EvaluationPlan.LegendPlan },
]

const PayMethod = [
  { label: 'Crypto', value: 'Crypto' },
  { label: 'Binance Pay', value: 'BinancePay' },
  { label: 'Credit Card', value: 'CreditCard' },
]

const { signTypedDataAsync } = useSignTypedData()
const { isConnected, address } = useConnection()

const signing = ref(false)

const { addEvaluation } = useUserEvaluationsStorage(address)
const { data: discountData, updateDiscountStatus } = useUserQuestDiscountStatusStorage(address)
const unusedDiscounts = computed(() => discountData.value?.filter((item) => !item.isUsed) ?? [])

const paymentTokens = PaymentTokens

const route = useRoute()
const router = useRouter()

const activePlan = ref<EvaluationPlan>(EvaluationPlan.ChampionPlan)
const selectedAccountIndex = ref(0)
const showAccountDropdown = ref(false)
const showTokenDropdown = ref(false)
const showPayMethodDropdown = ref(false)
const selectedToken = ref(paymentTokens[0])
const selectedPayMethod = ref(PayMethod[0])
const profitSplitChecked = ref(false)
const affiliateChecked = ref(false)
const affiliateCode = ref('')
const agreeProgram = ref(false)
const agreeRefund = ref(true)
const pendingLevel = ref<number | null>(null)

const accountOptions = computed<EvaluationConfig[]>(() => {
  return EvaluationPlanConfig[activePlan.value].levels
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

const selectedTokenPrice = computed(() => {
  return apiPrices.value[selectedToken.value.symbol] ?? TOKEN_PRICES[selectedToken.value.symbol] ?? 0
})

const selectedTokenPriceBigInt = computed(() => toBigInt(selectedTokenPrice.value))
const selectedTokenBalanceBigInt = computed(() => toBigInt(selectedToken.value.balance ?? 0))

const selectedTokenUsdBalance = computed(() => {
  return multiplyBigInt(selectedTokenBalanceBigInt.value, selectedTokenPriceBigInt.value)
})

const selectedAccount = computed(() => accountOptions.value[selectedAccountIndex.value])

const questDiscountBigInt = toBigInt(QUEST_DISCOUNT_AMOUNT)
const basePrice = computed(() => (selectedAccount.value ? toBigInt(selectedAccount.value.fee) : BigInt(0)))
const profitSplitFee = computed(() =>
  profitSplitChecked.value ? multiplyBigInt(basePrice.value, toBigInt(0.1)) : BigInt(0),
)

const usdToHeroToken = (usdAmount: number) => {
  const heroTokenPrice = TOKEN_PRICES['HERO'] || 0
  if (heroTokenPrice === 0) return 0
  return usdAmount / heroTokenPrice
}

const purchaseTotal = computed(() => basePrice.value + profitSplitFee.value)
const purchaseTotalHeroAmount = computed(() => {
  return toBigInt(usdToHeroToken(Number(fromBigInt(purchaseTotal.value, 2))))
})
const discountPurchaseInfo = computed(() => {
  const _usdValue =
    unusedDiscounts.value.length > 0
      ? purchaseTotal.value > questDiscountBigInt
        ? purchaseTotal.value - questDiscountBigInt
        : BigInt(0)
      : purchaseTotal.value
  const usdValue = _usdValue < 0n ? 0n : _usdValue

  const tokenAmount = divideBigInt(usdValue, selectedTokenPriceBigInt.value)
  const heroTokenAmount = toBigInt(usdToHeroToken(Number(fromBigInt(usdValue, 2))))

  return {
    usdValue,
    tokenAmount,
    heroTokenAmount,
  }
})

const productLabel = computed(() => {
  const size = selectedAccount.value?.accountSize ?? 0
  return `$${formatNumber(toBigInt(size), 0)} - ${planTabs.find((tab) => tab.value === activePlan.value)?.label || ''}`
})

function formatCurrency(value: bigint) {
  return `$${formatNumber(value, 2)}`
}

function selectAccount(index: number) {
  selectedAccountIndex.value = index
  showAccountDropdown.value = false
}

function selectToken(token: (typeof paymentTokens)[number]) {
  selectedToken.value = token
  showTokenDropdown.value = false
}

function selectPayMethod(method: (typeof PayMethod)[number]) {
  if (method.value === 'CreditCard' || method.value === 'BinancePay') {
    return
  }
  selectedPayMethod.value = method
  showPayMethodDropdown.value = false
}

function initFromQuery() {
  const { plan, level } = route.query

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
  return balanceUsd < discountPurchaseInfo.value.usdValue
})

const confirmButtonDisabled = computed(() => {
  return !isConnected.value || !agreeRefund.value || !agreeProgram.value || isInsufficientBalance.value || signing.value
})

async function handlePurchase() {
  const payload = {
    plan: activePlan.value,
    account: selectedAccount.value,
    token: selectedToken.value,
    profitSplit: profitSplitChecked.value,
    affiliate: affiliateChecked.value ? affiliateCode.value : undefined,
    agreeProgram: agreeProgram.value,
    agreeRefund: agreeRefund.value,
    total: purchaseTotal.value,
  }

  const evaluationId = generateTimeBasedSixDigitId()
  const signMsg = `Purchase Evaluation Order\n\nEvaluation ID: ${evaluationId}\nProduct: ${
    productLabel.value
  }\nTotal: $${fromBigInt(purchaseTotal.value, 2)}\n\n.`

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
        showDashboard: true,
        showPublic: true,
      },
      timestamp: Math.floor(Date.now() / 1000),
    })

    if (unusedDiscounts.value.length > 0) {
      updateDiscountStatus(unusedDiscounts.value[0]?.id || '', true)
    }

    router.push({ name: ROUTE_NAMES.Dashboard, query: { id: evaluationId } })
  } catch (error) {
    // handle error (e.g., user rejected signing)
    console.error('Purchase failed:', error)
  } finally {
    signing.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-[var(--hp-bg-dark)] text-[var(--hp-white-color)] pb-12 pt-10">
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
              v-for="tab in planTabs"
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
                  class="flex w-full items-center cursor-pointer justify-between px-4 py-3 text-left transition bg-[var(--hp-line-normal-color)] hover:bg-[var(--hp-line-light-color)] group"
                  :class="idx === selectedAccountIndex ? 'text-[var(--hp-text-color)]' : 'text-[var(--hp-white-color)]'"
                  @click="selectAccount(idx)"
                >
                  <span class="text-base font-semibold">${{ item.accountSize.toLocaleString() }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="flex justify-between">
            <div class="border border-[var(--hp-line-light-color)] p-4 w-[calc(50%-6px)]">
              <div class="flex items-center justify-between text-sm text-[var(--hp-text-color)]">
                <span>Pay Method <span class="text-[var(--hp-primary-green)]">*</span></span>
              </div>
              <div class="relative">
                <button
                  type="button"
                  class="flex w-full items-center justify-between text-lg font-semibold group"
                  @click="showPayMethodDropdown = !showPayMethodDropdown"
                >
                  <div class="flex items-center gap-2">
                    <span>{{ selectedPayMethod.label }}</span>
                  </div>
                  <BaseIcon
                    name="downArrow"
                    size="12"
                    class="text-[var(--hp-text-color)] transition-transform duration-200 group-hover:text-[var(--hp-primary-green)]"
                    :class="showPayMethodDropdown ? 'rotate-180' : ''"
                  />
                </button>

                <!-- backdrop to capture outside clicks and close the dropdown -->
                <div v-if="showPayMethodDropdown" class="fixed inset-0 z-10" @click="showPayMethodDropdown = false" />

                <div
                  v-if="showPayMethodDropdown"
                  class="absolute left-[-17px] top-[42px] z-20 mt-2 w-[calc(100%+34px)] overflow-hidden border border-[var(--hp-line-light-color)] bg-[var(--hp-bg-light)]"
                >
                  <button
                    v-for="method in PayMethod"
                    :key="method.value"
                    type="button"
                    class="flex w-full items-center justify-between px-4 py-3 text-left transition bg-[var(--hp-line-normal-color)] hover:bg-[var(--hp-line-light-color)]"
                    @click="selectPayMethod(method)"
                  >
                    <div
                      class="flex items-center gap-2"
                      :class="[selectedPayMethod.value === method.value ? 'opacity-60' : '']"
                    >
                      <span class="text-base font-semibold text-[var(--hp-white-color)]">{{ method.label }}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div class="border border-[var(--hp-line-light-color)] p-4 w-[calc(50%-6px)]">
              <div class="flex items-center justify-between text-sm text-[var(--hp-text-color)]">
                <span>Pay <span class="text-[var(--hp-primary-green)]">*</span></span>
                <span>
                  Balance: {{ formatNumber(toBigInt(selectedToken.balance ?? 0), selectedToken.formatDecimals) }}
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
                    class="flex w-full items-center justify-between px-4 py-3 text-left transition bg-[var(--hp-line-normal-color)] hover:bg-[var(--hp-line-light-color)]"
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
            <div
              v-if="discountPurchaseInfo.usdValue > 0n || unusedDiscounts.length <= 0"
              class="flex items-center justify-between text-[var(--hp-text-color)]"
            >
              <span>Swap {{ selectedToken.symbol }} Into HERO</span>
              <span class="text-[var(--hp-white-color)]">
                {{
                  `${formatNumber(discountPurchaseInfo.tokenAmount, selectedToken.formatDecimals)} ${
                    selectedToken.symbol
                  }`
                }}
                →
                {{ `${formatNumber(discountPurchaseInfo.heroTokenAmount, 0)} HERO` }}
              </span>
            </div>

            <!-- <div class="flex items-center justify-between">
              <label class="flex cursor-pointer items-center gap-2 text-[var(--hp-text-color)]">
                <input v-model="profitSplitChecked" type="checkbox" class="h-4 w-4 accent-[var(--hp-primary-green)]" />
                <span>{{ profitSplitLabel }}</span>
              </label>
              <span class="text-[var(--hp-white-color)]">{{ formatCurrency(profitSplitFee) }}</span>
            </div> -->
            <div class="flex items-center justify-between">
              <span class="text-[var(--hp-text-color)]">Purchase</span>
              <span class="text-xl font-semibold text-[var(--hp-primary-green)]">
                <template v-if="unusedDiscounts.length > 0 && discountPurchaseInfo.usdValue <= 0n">Free</template>
                <template v-else>
                  <div class="flex items-center">
                    <span v-if="unusedDiscounts.length > 0" class="mr-1 opacity-70 line-through">
                      {{ formatNumber(purchaseTotalHeroAmount, 0) }} HERO
                    </span>
                    {{ `${formatNumber(discountPurchaseInfo.heroTokenAmount, 0)}HERO` }}
                    <img :src="HeroIcon" alt="HERO" class="w-[22px] h-[22px] mx-1" />
                    <span class="font-[500] text-[16px] leading-4"
                      >(${{ formatNumber(discountPurchaseInfo.usdValue, 2) }})</span
                    >
                  </div>
                </template>
              </span>
            </div>
          </div>

          <div class="h-px w-full bg-[var(--hp-line-normal-color)]" />

          <div class="space-y-3">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-[var(--hp-text-color)]">
              <input v-model="affiliateChecked" type="checkbox" class="h-4 w-4 accent-[var(--hp-primary-green)]" />
              <span>Affiliate code</span>
            </label>
            <div
              v-if="affiliateChecked"
              class="flex flex-col gap-3 border border-[var(--hp-line-normal-color)] p-4 md:flex-row md:items-center md:justify-between"
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
          <!-- <label class="flex cursor-pointer items-start gap-2">
            <input v-model="agreeRefund" type="checkbox" class="mt-0.5 h-4 w-4 accent-[var(--hp-primary-green)]" />
            <span class="leading-5">
              I agree to the <span class="underline">Refund Policy</span> and
              <span class="underline">Chargeback Policy</span>
              <span class="text-[var(--hp-primary-green)]">*</span>
            </span>
          </label> -->
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
