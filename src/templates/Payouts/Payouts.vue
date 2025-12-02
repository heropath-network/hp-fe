<script setup lang="ts">
import { ellipsisMiddle, formatDate, formatNumber, getWithdrawalStatusLabel } from '@/utils/common'
import { computed, ref } from 'vue'
import { useConnection, useSignTypedData } from '@wagmi/vue'
import { useUserPayoutsStorage, useUserWithdrawalHistoryStorage } from '@/storages/heroPath'
import { LoadingIcon } from '@/components'
import { UserWithdrawalHistory } from '@/types/heroPath'

const MIN_WITHDRAWAL_AMOUNT = 50
const USDC_TOKEN_ADDRESS = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const TOKEN_SYMBOL = 'USDC'

const { isConnected, address } = useConnection()
const { signTypedDataAsync } = useSignTypedData()
const withdrawing = ref(false)

const { data: payoutsInfo, updateWithdrawnAmount } = useUserPayoutsStorage(address)
const { data: withdrawalHistory, addWithdrawalHistory } = useUserWithdrawalHistoryStorage(address)

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

const profitAvailable = computed(() => {
  // TODO
  return 100000
})

const totalAccountProfit = computed(() => {
  return payoutsInfo.value.withdrawnAmount + profitAvailable.value
})

const isValidAmount = computed(() => {
  const numeric = parseFloat(amount.value)
  return !Number.isNaN(numeric) && numeric >= MIN_WITHDRAWAL_AMOUNT && numeric <= profitAvailable.value
})

const confirmIsDisabled = computed(() => {
  return !isValidAmount.value || !isConnected.value || withdrawing.value
})

async function handleWithdraw() {
  if (!isValidAmount.value || !isConnected.value) return

  const numeric = parseFloat(amount.value)

  const historyData: UserWithdrawalHistory = {
    timestamp: Math.floor(Date.now() / 1000),
    address: USDC_TOKEN_ADDRESS,
    amount: numeric,
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
        token: TOKEN_SYMBOL,
        address: USDC_TOKEN_ADDRESS,
        amount: BigInt(numeric),
      },
    })
    addWithdrawalHistory(historyData)
    updateWithdrawnAmount(payoutsInfo.value.withdrawnAmount + numeric)
    amount.value = ''
  } catch (error) {
    console.error('Withdrawal failed:', error)
  } finally {
    withdrawing.value = false
  }
}
</script>

<template>
  <section class="mx-auto mt-4 flex w-full max-w-[1160px] flex-col gap-10 px-4 text-[var(--hp-white-color)] sm:px-6">
    <h1 class="text-2xl font-semibold leading-8">Payouts</h1>

    <div class="flex flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
      <p class="text-xl font-semibold leading-7">Profit Structure Overview</p>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] px-6 py-5">
          <p class="text-xl font-semibold leading-7">
            {{ isConnected ? formatNumber(profitAvailable, 2) : 'N/A' }}
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Profit Available</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] px-6 py-5">
          <p class="text-xl font-semibold leading-7">
            {{ isConnected ? formatNumber(totalAccountProfit, 2) : 'N/A' }}
          </p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">Your Total Account Profit</p>
        </div>
        <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] px-6 py-5">
          <p class="text-xl font-semibold leading-7">90%</p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">The Share of Profit You Keep</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
      <p class="text-xl font-semibold leading-7">Withdrawals</p>

      <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
        <label class="text-sm leading-5 text-[var(--hp-text-color)]">
          Withdrawal Amount (Min. Withdrawal: ${{ MIN_WITHDRAWAL_AMOUNT }})
          <span class="text-[var(--hp-primary-green)]"> *</span>
        </label>

        <div class="flex flex-col gap-2 border border-[var(--hp-line-light-color)] p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex w-full items-center gap-2">
              <span class="text-xl font-semibold text-[#var(--hp-text-color)]">$</span>
              <input
                v-model="amount"
                type="text"
                inputmode="decimal"
                @input="handleAmountInput"
                placeholder="0.00"
                class="w-full bg-transparent text-xl font-semibold text-[var(--hp-white-color)] placeholder:text-[var(--hp-text-color)] focus:outline-none"
              />
            </div>

            <button
              type="button"
              class="flex items-center justify-center h-10 w-full bg-[var(--hp-primary-green)] px-3 text-sm font-medium text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[120px]"
              :disabled="confirmIsDisabled"
              @click="handleWithdraw"
            >
              Withdraw <LoadingIcon v-if="withdrawing" :is-black="true" class="ml-1" />
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm leading-5 text-[var(--hp-text-color)]">
          <span>Account Withdrawal</span>
          <span class="text-[var(--hp-white-color)]">{{ amount ? formatNumber(amount, 2) : 'N/A' }}</span>
        </div>
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
              <div class="px-6">{{ formatNumber(item.amount, 2) }} {{ TOKEN_SYMBOL }}</div>
              <div class="px-6">{{ getWithdrawalStatusLabel(item.status) }}</div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </section>
</template>
