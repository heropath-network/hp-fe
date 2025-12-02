<script setup lang="ts">
import { computed, ref } from 'vue'

type ProfitStat = {
  label: string
  value: string
}

type Withdrawal = {
  date: string
  address: string
  amount: string
  status: string
}

const profitStats: ProfitStat[] = [
  { label: 'Profit Available', value: 'N/A' },
  { label: 'Your Total Account Profit', value: 'N/A' },
  { label: 'The Share of Profit You Keep', value: 'N/A' },
]

const withdrawalHistory = ref<Withdrawal[]>([
  { date: '2025-11-28', address: '0x4D31...8a23', amount: '500.00 USDC', status: 'Success' },
])

const amount = ref('')

const isValidAmount = computed(() => {
  const numeric = parseFloat(amount.value)
  return !Number.isNaN(numeric) && numeric >= 50
})

const lastWithdrawalStatus = computed(() => withdrawalHistory.value[0]?.status ?? 'N/A')

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

function handleWithdraw() {
  if (!isValidAmount.value) return

  const numeric = parseFloat(amount.value)
  const formatted = numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  withdrawalHistory.value = [
    {
      date: new Date().toISOString().slice(0, 10),
      address: '0x0000...0000',
      amount: `${formatted} USDC`,
      status: 'Pending',
    },
    ...withdrawalHistory.value,
  ]

  amount.value = ''
}
</script>

<template>
  <section class="mx-auto mt-4 flex w-full max-w-[1160px] flex-col gap-10 px-4 text-[var(--hp-white-color)] sm:px-6">
    <h1 class="text-2xl font-semibold leading-8">Payouts</h1>

    <div class="flex flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
      <p class="text-xl font-semibold leading-7">Profit Structure Overview</p>

      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="card in profitStats"
          :key="card.label"
          class="flex flex-col gap-1 bg-[var(--hp-bg-light)] px-6 py-5"
        >
          <p class="text-xl font-semibold leading-7">{{ card.value }}</p>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ card.label }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
      <p class="text-xl font-semibold leading-7">Withdrawals</p>

      <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
        <label class="text-sm leading-5 text-[var(--hp-text-color)]">
          Withdrawal Amount (Min. Withdrawal: $50)
          <span class="text-[var(--hp-primary-green)]"> *</span>
        </label>

        <div class="flex flex-col gap-2 border border-[var(--hp-line-light-color)] p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex w-full items-center gap-2">
              <span class="text-xl font-semibold text-[#545454]">$</span>
              <input
                v-model="amount"
                type="text"
                inputmode="decimal"
                @input="handleAmountInput"
                placeholder="0.00"
                class="w-full bg-transparent text-xl font-semibold text-[var(--hp-white-color)] placeholder:text-[#545454] focus:outline-none"
              />
            </div>

            <button
              type="button"
              class="h-10 w-full bg-[var(--hp-primary-green)] px-3 text-sm font-medium text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[120px]"
              :disabled="!isValidAmount"
              @click="handleWithdraw"
            >
              Withdraw
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm leading-5 text-[var(--hp-text-color)]">
          <span>Account Withdrawal</span>
          <span class="text-[var(--hp-white-color)]">{{ lastWithdrawalStatus }}</span>
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

          <div
            v-for="(item, index) in withdrawalHistory"
            :key="`${item.date}-${item.address}-${index}`"
            class="grid h-[72px] grid-cols-[1.2fr_1.4fr_1.1fr_1fr] items-center bg-[var(--hp-bg-light)] text-base font-medium text-[var(--hp-white-color)]"
          >
            <div class="px-6">{{ item.date }}</div>
            <div class="px-6">{{ item.address }}</div>
            <div class="px-6">{{ item.amount }}</div>
            <div class="px-6">{{ item.status }}</div>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
