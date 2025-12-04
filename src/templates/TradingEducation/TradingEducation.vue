<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { ROUTE_NAMES } from '@/router'
import { useRouter } from 'vue-router'

const router = useRouter()

type EducationCard = {
  title: string
  timestamp: string
  tags: { label: string; variant: 'primary' | 'secondary' }[]
}

const tradingFundamentalsCards: EducationCard[] = [
  {
    title: 'Trader’s Dictionary',
    timestamp: '1764828500',
    tags: [
      { label: 'Beginner', variant: 'primary' },
      { label: 'Fundamentals', variant: 'secondary' },
    ],
  },
  {
    title: 'Risk Management Basics',
    timestamp: '1764828500',
    tags: [
      { label: 'Beginner', variant: 'primary' },
      { label: 'Fundamentals', variant: 'secondary' },
    ],
  },
  {
    title: 'Scalping Trading 101',
    timestamp: '1764828500',
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
    timestamp: '1764828500',
    tags: [
      { label: 'Intermediate', variant: 'primary' },
      { label: 'TA', variant: 'secondary' },
    ],
  },
  {
    title: 'Support and Resistance',
    timestamp: '1764828500',
    tags: [
      { label: 'Intermediate', variant: 'primary' },
      { label: 'TA', variant: 'secondary' },
    ],
  },
  {
    title: 'Supply and Demand Trading',
    timestamp: '1764828500',
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

function formatTimeAgo(timestamp: string): string {
  // normalize timestamp to milliseconds
  let timeValue: number
  if (/^\d+$/.test(timestamp)) {
    // numeric timestamp (seconds or milliseconds)
    timeValue = timestamp.length <= 10 ? Number(timestamp) * 1000 : Number(timestamp)
  } else {
    const parsed = Date.parse(timestamp)
    if (isNaN(parsed)) {
      return 'unknown'
    }
    timeValue = parsed
  }

  const now = Date.now()
  const diff = now - timeValue

  if (diff < 0) {
    return 'just now'
  }

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`
  }
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
          @click="
            () => {
              router.push({ name: ROUTE_NAMES.Trade })
            }
          "
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
          <div class="h-[216px] w-full bg-[var(--hp-primary-green)]" />

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

              <h3 class="text-lg font-semibold leading-7 min-h-[48px]">{{ card.title }}</h3>
            </div>

            <div class="flex items-center gap-2 text-sm leading-5 text-[var(--hp-text-color)]">
              <BaseIcon name="time" size="16" class="text-[var(--hp-text-color)]" />
              <span>{{ formatTimeAgo(card.timestamp) }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
    <div v-for="(row, rowIndex) in technicalAnalysisCardRows" :key="rowIndex" class="flex flex-col gap-6">
      <h2 class="text-2xl font-semibold leading-8">Technical Analysis</h2>

      <div class="grid gap-4 md:grid-cols-3 items-stretch">
        <article v-for="(card, cardIndex) in row" :key="`${card.title}-${cardIndex}`" class="flex flex-col h-full">
          <div class="h-[216px] w-full bg-[var(--hp-primary-green)]" />

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

              <h3 class="text-lg font-semibold leading-7 min-h-[48px]">{{ card.title }}</h3>
            </div>

            <div class="flex items-center gap-2 text-sm leading-5 text-[var(--hp-text-color)]">
              <BaseIcon name="time" size="16" class="text-[var(--hp-text-color)]" />
              <span>{{ formatTimeAgo(card.timestamp) }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
