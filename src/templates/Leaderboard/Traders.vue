<script setup lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import Avatar from '@/components/Wallet/Avatar.vue'
import { ellipsisMiddle } from '@/utils/common'

type TraderRow = {
  address: string
  volume: number
  leverage: number
  win: number
  loss: number
  pnl: number
}

const timeframes = ['24 Hours', '7 Days', '1 Month']
const selectedTimeframe = ref<string>(timeframes[0])
const traderRows = ref<TraderRow[]>(generateRows(selectedTimeframe.value, 20))

watch(selectedTimeframe, (frame) => {
  traderRows.value = generateRows(frame, 20)
})

const formattedRows = computed(() =>
  traderRows.value.map((row) => ({
    ...row,
    volumeLabel: `$${formatNumber(row.volume)}`,
    leverageLabel: `${row.leverage.toFixed(1)}x`,
    pnlLabel: `${row.pnl >= 0 ? '+' : '-'} $${formatNumber(Math.abs(row.pnl))}`,
    isPositive: row.pnl >= 0,
  })),
)

function generateRows(frame: string, count = 20): TraderRow[] {
  const volumeMultiplier = frame === '24 Hours' ? 1 : frame === '7 Days' ? 2.4 : 4
  return Array.from({ length: count }).map(() => {
    const wins = Math.floor(randomNumber(1, 8))
    const losses = Math.max(0, Math.floor(randomNumber(0, 5)))
    const pnlBase = randomNumber(40_000, 520_000)
    const pnlNoise = randomNumber(0.85, 1.2)

    return {
      address: randomAddress(),
      volume: randomNumber(5000, 1000000) * volumeMultiplier,
      leverage: randomNumber(1, 5),
      win: wins,
      loss: losses,
      pnl: pnlBase * pnlNoise * (Math.random() > 0.22 ? 1 : -1) * 0.013,
    }
  })
}

function randomAddress(): string {
  let addr = '0x'
  for (let i = 0; i < 40; i++) {
    addr += Math.floor(Math.random() * 16).toString(16)
  }
  return addr
}

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

const SortIcon = defineComponent({
  props: {
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  template: `
    <svg
      :class="['h-3 w-3', highlight ? 'text-[var(--hp-white-color)]' : 'text-[var(--hp-text-color)]']"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2.5 4.5 6 1l3.5 3.5h-7Z" stroke="currentColor" stroke-width="1" fill="none" />
      <path d="M2.5 7.5 6 11l3.5-3.5h-7Z" stroke="currentColor" stroke-width="1" fill="none" />
    </svg>
  `,
})
</script>

<template>
  <section class="flex w-full max-w-[1160px] flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold leading-8 text-[var(--hp-white-color)]">Traders Leaderboard</h2>
    </div>

    <div class="flex items-center gap-3">
      <button
        v-for="frame in timeframes"
        :key="frame"
        type="button"
        class="px-4 py-[14px] text-base font-medium transition"
        :class="[
          selectedTimeframe === frame
            ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
            : 'bg-transparent text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]',
        ]"
        @click="selectedTimeframe = frame"
      >
        {{ frame }}
      </button>
    </div>

    <div class="flex w-full flex-col overflow-hidden rounded-sm">
      <div
        class="grid grid-cols-[196px_205px_165px_116px_116px_1fr] items-center gap-6 bg-[var(--hp-bg-normal)] px-6 py-4 text-sm text-[var(--hp-text-color)]"
      >
        <div>Account</div>
        <div class="flex items-center justify-end gap-1">
          <span>Trading Volume</span>
          <SortIcon />
        </div>
        <div class="flex items-center justify-end gap-1">
          <span>Average Lev.</span>
          <SortIcon />
        </div>
        <div class="flex items-center justify-end gap-1">
          <span>Win</span>
          <SortIcon />
        </div>
        <div class="flex items-center justify-end gap-1">
          <span>Loss</span>
          <SortIcon />
        </div>
        <div class="flex items-center justify-end gap-1">
          <span>PNL w. Fees</span>
          <SortIcon highlight />
        </div>
      </div>

      <div
        v-for="(row, index) in formattedRows"
        :key="row.address + index"
        :class="[index % 2 === 0 ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]']"
        class="grid grid-cols-[196px_205px_165px_116px_116px_1fr] h-[72px] items-center gap-6 px-6 py-4 text-base text-[var(--hp-white-color)]"
      >
        <div class="flex items-center gap-2">
          <div class="relative flex h-6 w-6 items-center justify-center">
            <Avatar :address="row.address" :size="24" />
          </div>
          <span class="truncate">{{ ellipsisMiddle(row.address) }}</span>
        </div>

        <div class="text-right">{{ row.volumeLabel }}</div>
        <div class="text-right">{{ row.leverageLabel }}</div>
        <div class="text-right">{{ row.win }}</div>
        <div class="text-right">{{ row.loss }}</div>
        <div class="text-right" :class="row.isPositive ? 'text-[var(--hp-text-green)]' : 'text-[var(--hp-text-red)]'">
          {{ row.pnlLabel }}
        </div>
      </div>
    </div>
  </section>
</template>
