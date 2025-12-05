<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { ROUTE_NAMES } from '@/router'
import { useRouter } from 'vue-router'
import Edu1Img from '@/assets/icons/edu/edu1.svg'
import Edu2Img from '@/assets/icons/edu/edu2.svg'
import Edu3Img from '@/assets/icons/edu/edu3.svg'
import Edu4Img from '@/assets/icons/edu/edu4.svg'
import Edu5Img from '@/assets/icons/edu/edu5.svg'
import Edu6Img from '@/assets/icons/edu/edu6.svg'

const router = useRouter()

type EducationCard = {
  title: string
  readMinutes: number
  banner: any
  tags: { label: string; variant: 'primary' | 'secondary' }[]
}

const tradingFundamentalsCards: EducationCard[] = [
  {
    title: 'Trader’s Dictionary',
    readMinutes: 12,
    banner: Edu1Img,
    tags: [
      { label: 'Beginner', variant: 'primary' },
      { label: 'Fundamentals', variant: 'secondary' },
    ],
  },
  {
    title: 'Risk Management Basics',
    readMinutes: 9,
    banner: Edu2Img,
    tags: [
      { label: 'Beginner', variant: 'primary' },
      { label: 'Fundamentals', variant: 'secondary' },
    ],
  },
  {
    title: 'Scalping Trading 101',
    readMinutes: 21,
    banner: Edu3Img,
    tags: [
      { label: 'Beginner', variant: 'primary' },
      { label: 'Fundamentals', variant: 'secondary' },
    ],
  },
]

const tradingFundamentalsCardRows = computed(() => {
  const rows: EducationCard[][] = []
  for (let i = 0; i < tradingFundamentalsCards.length; i += 3) {
    rows.push(tradingFundamentalsCards.slice(i, i + 3))
  }
  return rows
})

const technicalAnalysisCards: EducationCard[] = [
  {
    title: 'Market Environment - Ranges vs. Trends',
    readMinutes: 18,
    banner: Edu4Img,
    tags: [
      { label: 'Intermediate', variant: 'primary' },
      { label: 'TA', variant: 'secondary' },
    ],
  },
  {
    title: 'Support and Resistance',
    readMinutes: 14,
    banner: Edu5Img,
    tags: [
      { label: 'Intermediate', variant: 'primary' },
      { label: 'TA', variant: 'secondary' },
    ],
  },
  {
    title: 'Supply and Demand Trading',
    readMinutes: 15,
    banner: Edu6Img,
    tags: [
      { label: 'Intermediate', variant: 'primary' },
      { label: 'TA', variant: 'secondary' },
    ],
  },
]

const technicalAnalysisCardRows = computed(() => {
  const rows: EducationCard[][] = []
  for (let i = 0; i < technicalAnalysisCards.length; i += 3) {
    rows.push(technicalAnalysisCards.slice(i, i + 3))
  }
  return rows
})

function openTradeTerminal() {
  window.open(router.resolve({ name: ROUTE_NAMES.Trade }).href, '_blank')
}
</script>

<template>
  <section class="mt-4 flex flex-col gap-12 pb-28 text-[var(--hp-white-color)]">
    <div class="w-full">
      <div class="flex items-center justify-between bg-[var(--hp-bg-normal)] px-6 py-5 shadow-lg shadow-black/40">
        <p class="text-xl font-semibold leading-7">Ready for Training?</p>
        <button
          type="button"
          class="flex items-center gap-2 bg-[var(--hp-primary-green)] px-6 py-[14px] text-base font-medium text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)]"
          @click="openTradeTerminal"
        >
          Go to Training
          <BaseIcon name="arrow" size="18" class="rotate-[270deg] text-[var(--hp-black-color)]" />
        </button>
      </div>
    </div>
    <div v-for="(row, rowIndex) in tradingFundamentalsCardRows" :key="rowIndex" class="flex flex-col gap-6">
      <h2 class="text-2xl font-semibold leading-8">Crypto Trading</h2>

      <div class="grid gap-4 md:grid-cols-3 items-stretch">
        <article v-for="(card, cardIndex) in row" :key="`${card.title}-${cardIndex}`" class="flex flex-col h-full">
          <div class="h-[216px] w-full bg-[var(--hp-line-normal-color)]">
            <img
              :src="card.banner"
              alt="Education Banner"
              class="h-full w-full object-cover drop select-none"
              draggable="false"
              @dragstart.prevent
            />
          </div>

          <div class="flex flex-col justify-between gap-3 bg-[var(--hp-bg-normal)] px-6 py-5 flex-1">
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span
                  v-for="tag in card.tags"
                  :key="tag.label"
                  class="border px-2 py-1 text-xs font-medium leading-4"
                  :class="
                    tag.variant === 'primary'
                      ? 'border-[var(--hp-text-green)] text-[var(--hp-text-green)]'
                      : 'border-[var(--hp-text-color)] text-[var(--hp-text-color)]'
                  "
                >
                  {{ tag.label }}
                </span>
              </div>

              <h3
                class="text-lg font-semibold leading-7 min-h-[48px] hover:text-[var(--hp-primary-green)] cursor-pointer"
              >
                {{ card.title }}
              </h3>
            </div>

            <div class="flex items-center gap-2 text-sm leading-5 text-[var(--hp-text-color)]">
              <BaseIcon name="time" size="16" class="text-[var(--hp-text-color)]" />
              <span>{{ card.readMinutes }} minutes</span>
            </div>
          </div>
        </article>
      </div>
    </div>
    <div v-for="(row, rowIndex) in technicalAnalysisCardRows" :key="rowIndex" class="flex flex-col gap-6">
      <h2 class="text-2xl font-semibold leading-8">Technical Analysis</h2>

      <div class="grid gap-4 md:grid-cols-3 items-stretch">
        <article v-for="(card, cardIndex) in row" :key="`${card.title}-${cardIndex}`" class="flex flex-col h-full">
          <div class="h-[216px] w-full bg-[var(--hp-line-normal-color)]">
            <img
              :src="card.banner"
              alt="Education Banner"
              class="h-full w-full object-cover drop select-none"
              draggable="false"
              @dragstart.prevent
            />
          </div>

          <div class="flex flex-col justify-between gap-3 bg-[var(--hp-bg-normal)] px-6 py-5 flex-1">
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span
                  v-for="tag in card.tags"
                  :key="tag.label"
                  class="border px-2 py-1 text-xs font-medium leading-4"
                  :class="
                    tag.variant === 'primary'
                      ? 'border-[var(--hp-text-yellow)] text-[var(--hp-text-yellow)]'
                      : 'border-[var(--hp-text-color)] text-[var(--hp-text-color)]'
                  "
                >
                  {{ tag.label }}
                </span>
              </div>

              <h3
                class="text-lg font-semibold leading-7 min-h-[48px] hover:text-[var(--hp-primary-green)] cursor-pointer"
              >
                {{ card.title }}
              </h3>
            </div>

            <div class="flex items-center gap-2 text-sm leading-5 text-[var(--hp-text-color)]">
              <BaseIcon name="time" size="16" class="text-[var(--hp-text-color)]" />
              <span>{{ card.readMinutes }} minutes</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
