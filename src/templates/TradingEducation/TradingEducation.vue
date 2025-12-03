<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { ROUTE_NAMES } from '@/router'
import { useRouter } from 'vue-router'

const router = useRouter()

type EducationCard = {
  title: string
  duration: string
  tags: { label: string; variant: 'primary' | 'secondary' }[]
}

const cards: EducationCard[] = Array.from({ length: 6 }, () => ({
  title: 'How to Use the Crypto Trade Analyzer',
  duration: '10 minutes',
  tags: [
    { label: 'Beginner', variant: 'primary' },
    { label: 'Trading', variant: 'secondary' },
  ],
}))

const cardRows = computed(() => {
  const rows: EducationCard[][] = []
  for (let i = 0; i < cards.length; i += 3) {
    rows.push(cards.slice(i, i + 3))
  }
  return rows
})
</script>

<template>
  <section
    class="mt-4 flex flex-col gap-12 pb-28 text-[var(--hp-white-color)]"
  >
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
    <div v-for="(row, rowIndex) in cardRows" :key="rowIndex" class="flex flex-col gap-6">
      <h2 class="text-2xl font-semibold leading-8">Crypto Trading</h2>

      <div class="grid gap-4 md:grid-cols-3">
        <article v-for="(card, cardIndex) in row" :key="`${card.title}-${cardIndex}`" class="flex flex-col">
          <div class="h-[216px] w-full bg-[var(--hp-primary-green)]" />

          <div class="flex flex-col gap-3 bg-[var(--hp-bg-normal)] px-6 py-5">
            <div class="flex flex-wrap items-center gap-2">
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

            <h3 class="text-lg font-semibold leading-7">{{ card.title }}</h3>

            <div class="flex items-center gap-2 text-sm leading-5 text-[var(--hp-text-color)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="h-4 w-4 text-[var(--hp-text-color)]"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7.5V12l2.5 2.5" />
              </svg>
              <span>{{ card.duration }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
