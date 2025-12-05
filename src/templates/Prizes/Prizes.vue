<script setup lang="ts">
import { ellipsisMiddle, formatDate, getWithdrawalStatusLabel } from '@/utils/common'
import { computed, ref } from 'vue'
import { useConnection, useSignTypedData } from '@wagmi/vue'
import { useUserWithdrawalHistoryStorage, useUserEvaluationsStorage } from '@/storages/heroPath'
import { LoadingIcon, BaseIcon } from '@/components'
import { UserWithdrawalHistory } from '@/types/heroPath'
import { useUserTradeHistoryStorage } from '@/storages/trading'
import { getAccountHistoryPnl, getPrizeWithdrawalAmount } from '@/utils/evaluation'
import { SHARE_OF_PROFIT } from '@/constants'
import { formatNumber, fromBigInt, multiplyBigInt, toBigInt } from '@/utils/bigint'
import { PrizeTokens } from '@/config/prizeTokens'

const USDC_TOKEN_ADDRESS = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const PAYOUT_NETWORK = 'BEP20'

const { isConnected, address } = useConnection()
const { signTypedDataAsync } = useSignTypedData()
const withdrawing = ref(false)

const requireSymbolIcon = (symbol: string) => {
  return new URL(`/src/assets/icons/tokens/${symbol}.svg`, import.meta.url).href
}

const { data: evaluations } = useUserEvaluationsStorage(address)
const { data: withdrawalHistory, addWithdrawalHistory } = useUserWithdrawalHistoryStorage(address)
const { data: allTradeHistory } = useUserTradeHistoryStorage(address)

const showTokenDropdown = ref(false)
const selectedToken = ref(PrizeTokens[0])

function selectToken(token: (typeof PrizeTokens)[number]) {
  selectedToken.value = token
  showTokenDropdown.value = false
}

function getPrizeTokenBySymbol(symbol: string) {
  return PrizeTokens.find((token) => token.symbol === symbol) ?? undefined
}

const amount = ref('')

function handleAmountInput(event: Event) {
  const target = event.target as HTMLInputElement
  // Keep digits and a single decimal point
  let value = target.value.replace(/[^0-9.]/g, '')
  const dotIndex = value.indexOf('.')
  if (dotIndex !== -1) {
    value = value.slice(0, dotIndex + 1) + value.slice(dotIndex + 1).replace(/\./g, '')
  }
  amount.value = value
}

const fundedTradeHistory = computed(() => {
  const fundedAccountIds = evaluations.value
    .filter((item) => item.accountType === 'funded')
    .map((item) => item.accountId)
  return allTradeHistory.value.filter((trade) => fundedAccountIds.includes(trade.accountId))
})

const totalPnl = computed(() => {
  return multiplyBigInt(getAccountHistoryPnl(fundedTradeHistory.value), toBigInt(SHARE_OF_PROFIT))
})

const withdrawnAmount = computed(() => {
  return toBigInt(getPrizeWithdrawalAmount(withdrawalHistory.value.filter((item) => item.status === 'success')))
})

const profitAvailable = computed(() => {
  const available = totalPnl.value - withdrawnAmount.value
  return available > 0n ? available : BigInt(0)
})

const totalAccountProfit = computed(() => {
  return withdrawnAmount.value + profitAvailable.value
})

const isValidAmount = computed(() => {
  const parsed = amount.value ? toBigInt(amount.value) : null
  return parsed !== null && parsed > 0n && parsed <= profitAvailable.value
})

const confirmIsDisabled = computed(() => {
  return !isValidAmount.value || !isConnected.value || withdrawing.value
})

async function handleWithdraw() {
  if (!isValidAmount.value || !isConnected.value) return

  const parsedAmount = toBigInt(amount.value)
  const decimalShift = 10n ** BigInt(18 - selectedToken.value.formatDecimals)
  const amountBigInt = parsedAmount / decimalShift
  const historyAmount = parseFloat(fromBigInt(parsedAmount, 6))

  const historyData: UserWithdrawalHistory = {
    id: crypto.randomUUID(),
    timestamp: Math.floor(Date.now() / 1000),
    address: address.value!,
    amount: historyAmount,
    tokenSymbol: selectedToken.value.symbol,
    status: 'success',
  }

  try {
    withdrawing.value = true
    await signTypedDataAsync({
      types: {
        Person: [{ name: 'wallet', type: 'address' }],
        Withdrawal: [
          { name: 'account', type: 'Person' },
          { name: 'token', type: 'string' },
          { name: 'address', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
      },
      primaryType: 'Withdrawal',
      message: {
        account: {
          wallet: address.value!,
        },
        token: selectedToken.value.symbol,
        address: address.value!,
        amount: amountBigInt,
      },
    } as any)
    addWithdrawalHistory(historyData)
    amount.value = ''
  } catch (error) {
    console.error('Withdrawal failed:', error)
  } finally {
    withdrawing.value = false
  }
}
</script>

<template>
  <section class="mt-4 flex flex-col gap-10 text-[var(--hp-white-color)]">
    <div>
      <h1 class="text-2xl font-semibold leading-8">Hero Prizes</h1>
      <div class="text-[14px] mt-2 leading-[20px] text-[var(--hp-text-color)]">
        After contributing trading signals/insights to the protocol’s own independent trading strategy, the protocol
        will distribute hero prizes every 7 days.The prizes for each hero account are calculated based on the
        contribution to the protocol’s trading strategy. <span class="underline">Learn More</span>
      </div>
    </div>

    <div class="flex flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
      <p class="text-xl font-semibold leading-7">Profit Structure Overview</p>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] px-6 py-5">
          <p class="text-xl font-semibold leading-7">
            {{ isConnected && profitAvailable > 0n ? `$${formatNumber(profitAvailable, 2)}` : 'N/A' }}
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Profit Available</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] px-6 py-5">
          <p class="text-xl font-semibold leading-7">
            {{ isConnected && totalAccountProfit > 0n ? `$${formatNumber(totalAccountProfit, 2)}` : 'N/A' }}
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Your Total Account Profit</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] px-6 py-5">
          <p class="text-xl font-semibold leading-7">5 Days</p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Next Prize Distribution In</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
      <p class="text-xl font-semibold leading-7">Payout Details</p>

      <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
        <div class="grid gap-3 md:grid-cols-2 h-[86px]">
          <div
            class="flex flex-col gap-2 border border-[var(--hp-line-normal-color)] bg-[var(--hp-bg-light)] px-4 py-3"
          >
            <div class="flex items-center gap-1 text-sm leading-5 text-[var(--hp-text-color)]">
              <span>To Claim</span>
              <span class="text-[var(--hp-primary-green)]">*</span>
            </div>
            <div class="relative flex w-full items-center gap-3">
              <input
                v-model="amount"
                type="text"
                inputmode="decimal"
                @input="handleAmountInput"
                placeholder="$0.00"
                class="flex-1 bg-transparent text-xl font-semibold text-[var(--hp-white-color)] placeholder:text-[var(--hp-text-color)] focus:outline-none"
              />
              <div class="shrink-0">
                <button
                  type="button"
                  class="group flex items-center gap-2 rounded-sm text-lg font-semibold text-[var(--hp-white-color)] transition hover:text-[var(--hp-primary-green)]"
                  @click="showTokenDropdown = !showTokenDropdown"
                >
                  <img
                    class="h-[22px] w-[22px]"
                    :src="requireSymbolIcon(selectedToken.symbol)"
                    :alt="selectedToken.symbol"
                  />
                  <span>{{ selectedToken.symbol }}</span>
                  <BaseIcon
                    name="downArrow"
                    size="12"
                    class="text-[var(--hp-text-color)] transition-transform duration-200 group-hover:text-[var(--hp-primary-green)]"
                    :class="showTokenDropdown ? 'rotate-180' : ''"
                  />
                </button>
              </div>

              <div v-if="showTokenDropdown" class="fixed inset-0 z-10" @click="showTokenDropdown = false" />
              <div
                v-if="showTokenDropdown"
                class="absolute left-[-16px] top-[calc(100%+24px)] z-20 w-[calc(100%+32px)] overflow-hidden border border-[var(--hp-line-light-color)] bg-[var(--hp-bg-light)] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
              >
                <button
                  v-for="token in PrizeTokens"
                  :key="token.symbol"
                  type="button"
                  class="flex w-full items-center gap-2 px-4 py-3 text-left transition hover:bg-[var(--hp-line-normal-color)]"
                  @click="selectToken(token)"
                >
                  <img class="h-[22px] w-[22px]" :src="requireSymbolIcon(token.symbol)" :alt="token.symbol" />
                  <span
                    class="text-base font-semibold"
                    :class="
                      selectedToken.symbol === token.symbol
                        ? 'text-[var(--hp-text-color)]'
                        : 'text-[var(--hp-white-color)]'
                    "
                  >
                    {{ token.symbol }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div
            class="flex flex-col gap-2 border border-[var(--hp-line-normal-color)] bg-[var(--hp-bg-light)] px-4 py-3"
          >
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Network</p>
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">{{ PAYOUT_NETWORK }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span class="text-[var(--hp-text-color)]">Wallet Address</span>
          <span class="break-all text-right text-[var(--hp-white-color)]">
            {{ isConnected ? address : 'N/A' }}
          </span>
        </div>

        <button
          type="button"
          class="flex h-12 w-full items-center justify-center bg-[var(--hp-primary-green)] px-6 text-base font-semibold text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="confirmIsDisabled"
          @click="handleWithdraw"
        >
          {{ selectedToken.symbol }} Prizes<LoadingIcon v-if="withdrawing" :is-black="true" class="ml-2" />
        </button>
      </div>
    </div>

    <section class="flex flex-col gap-6">
      <p class="text-2xl font-semibold leading-8">Withdrawals History</p>

      <div class="overflow-x-auto">
        <div class="min-w-[720px]">
          <div
            class="grid h-[52px] grid-cols-[1.2fr_1.4fr_1.1fr_1fr] items-center bg-[var(--hp-bg-normal)] text-sm text-[var(--hp-text-color)]"
          >
            <div class="px-6">Date</div>
            <div class="px-6">Address</div>
            <div class="px-6">Amount</div>
            <div class="px-6">Status</div>
          </div>

          <template v-if="!withdrawalHistory.length">
            <div
              class="h-[72px] flex justify-center items-center bg-[var(--hp-bg-light)] text-base font-medium text-[var(--hp-white-color)]"
            >
              No data available.
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, index) in withdrawalHistory"
              :key="`${item.timestamp}-${item.address}-${index}`"
              class="grid h-[72px] grid-cols-[1.2fr_1.4fr_1.1fr_1fr] items-center text-base font-medium text-[var(--hp-white-color)]"
              :class="[index % 2 === 0 ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]']"
            >
              <div class="px-6">{{ formatDate(item.timestamp) }}</div>
              <div class="px-6">{{ ellipsisMiddle(item.address) }}</div>
              <div class="px-6">
                {{ formatNumber(toBigInt(item.amount), getPrizeTokenBySymbol(item.tokenSymbol)?.formatDecimals ?? 2) }}
                {{ item.tokenSymbol }}
              </div>
              <div class="px-6">{{ getWithdrawalStatusLabel(item.status) }}</div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </section>
</template>
