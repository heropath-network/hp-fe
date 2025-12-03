<script setup lang="ts">
import { computed, defineComponent, ref } from 'vue'
import Avatar from '@/components/Wallet/Avatar.vue'
import BnbIcon from '@/assets/icons/tokens/BNB.svg'
import EthIcon from '@/assets/icons/tokens/ETH.svg'
import BtcIcon from '@/assets/icons/tokens/BTC.svg'
import { ellipsisMiddle } from '@/utils/common'

type MarketKey = 'BNB' | 'ETH' | 'BTC'
type PositionRow = {
  account: string
  market: MarketKey
  side: 'Long' | 'Short'
  leverage: number
  size: number
  entryPrice: number
  pnl: number
  source: {
    name: 'Aster' | 'gTrade'
    icon: string
  }
}

const marketIcons: Record<MarketKey, string> = {
  BNB: BnbIcon,
  ETH: EthIcon,
  BTC: BtcIcon,
}

const liquiditySources = [
  { name: 'Aster', icon: '/img/liquidity/aster.svg' },
  { name: 'gTrade', icon: '/img/liquidity/gtrade.svg' },
] as const

const positions = ref<PositionRow[]>(generatePositions(20))

const formattedRows = computed(() =>
  positions.value.map((row) => ({
    ...row,
    leverageLabel: `${row.leverage.toFixed(1)}x`,
    sizeLabel: `$${formatNumber(row.size)}`,
    entryLabel: `$${formatNumber(row.entryPrice, 1)}`,
    pnlLabel: `${row.pnl >= 0 ? '+' : '-'} $${formatNumber(Math.abs(row.pnl))}`,
    isPositive: row.pnl >= 0,
    marketIcon: marketIcons[row.market],
  })),
)

function randomMarket(): MarketKey {
  const markets: MarketKey[] = ['BNB', 'ETH', 'BTC']
  return markets[Math.floor(Math.random() * markets.length)]
}

function randomEntryPrice(market: MarketKey): number {
  switch (market) {
    case 'BNB':
      return randomNumber(470, 640)
    case 'ETH':
      return randomNumber(1_750, 2_400)
    case 'BTC':
      return randomNumber(78_000, 110_000)
    default:
      return 0
  }
}

function generatePositions(count = 20): PositionRow[] {
  return Array.from({ length: count }).map(() => {
    const market: MarketKey = randomMarket()
    const source = liquiditySources[Math.floor(Math.random() * liquiditySources.length)]
    const isLong = Math.random() > 0.45
    const leverage = randomNumber(6, 32)
    const size = randomNumber(750_000, 4_200_000)
    const entryPrice = randomEntryPrice(market)
    const pnlMagnitude = randomNumber(90_000, 520_000) * randomNumber(0.85, 1.2)
    const pnl = pnlMagnitude * (Math.random() > 0.52 ? 1 : -1)

    return {
      account: randomAddress(),
      market,
      side: isLong ? 'Long' : 'Short',
      leverage,
      size,
      entryPrice,
      pnl,
      source,
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
      <h2 class="text-2xl font-semibold leading-8 text-[var(--hp-white-color)]">Open Positions</h2>
    </div>

    <div class="flex w-full flex-col overflow-hidden rounded-sm">
      <div
        class="grid grid-cols-[220px_140px_100px_110px_170px_135px_1fr] items-center gap-6 bg-[var(--hp-bg-normal)] px-6 py-4 text-sm text-[var(--hp-text-color)]"
      >
        <div>Account</div>
        <div>Market</div>
        <div class="text-right">Side</div>
        <div class="flex items-center justify-end gap-1">
          <span>Lev.</span>
          <SortIcon />
        </div>
        <div class="flex items-center justify-end gap-1">
          <span>Size</span>
          <SortIcon highlight />
        </div>
        <div class="text-right">Entry Price</div>
        <div class="flex items-center justify-end gap-1">
          <span>PNL</span>
          <SortIcon />
        </div>
      </div>

      <div v-for="(row, index) in formattedRows" :key="row.account + index" class="relative">
        <div
          class="absolute left-0 top-0 flex items-center gap-2 px-3 py-1 text-xs text-[var(--hp-text-color)]"
          :style="{
            backgroundImage:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%), linear-gradient(90deg, rgb(55, 55, 55) 0%, rgb(55, 55, 55) 100%)',
          }"
        >
          <img :src="row.source.icon" :alt="row.source.name" class="h-4 w-4 shrink-0" />
          <span class="text-[12px] leading-4">{{ row.source.name }}</span>
        </div>

        <div
          :class="[index % 2 === 0 ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]']"
          class="grid grid-cols-[220px_140px_100px_110px_170px_135px_1fr] h-[72px] gap-6 px-6 py-4 pt-6 text-base text-[var(--hp-white-color)]"
        >
          <div class="flex items-center gap-2">
            <div class="relative flex h-6 w-6 items-center justify-center">
              <Avatar :address="row.account" :size="24" />
            </div>
            <span class="truncate">{{ ellipsisMiddle(row.account) }}</span>
          </div>

          <div class="flex items-center gap-2">
            <img :src="row.marketIcon" :alt="row.market" class="h-6 w-6 shrink-0" />
            <span>{{ row.market }}</span>
          </div>

          <div
            class="text-right font-medium"
            :class="row.side === 'Long' ? 'text-[var(--hp-text-green)]' : 'text-[var(--hp-text-red)]'"
          >
            {{ row.side }}
          </div>

          <div class="text-right">{{ row.leverageLabel }}</div>
          <div class="text-right">{{ row.sizeLabel }}</div>
          <div class="text-right">{{ row.entryLabel }}</div>

          <div
            class="text-right font-medium"
            :class="row.isPositive ? 'text-[var(--hp-text-green)]' : 'text-[var(--hp-text-red)]'"
          >
            {{ row.pnlLabel }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
