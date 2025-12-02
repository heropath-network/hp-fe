<script setup lang="ts">
import { ref } from 'vue'

type QuestTask = {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
}

const tasks = ref<QuestTask[]>([
  {
    id: 'follow-x',
    title: 'Follow @Aster_DEX on X',
    description: 'Follow @Aster_DEX on X to stay updated with quests and announcements.',
    status: 'pending',
  },
  {
    id: 'trade-perps',
    title: 'Trade Perps on Aster',
    description: 'Open at least one perpetual position on Aster (any pair).',
    status: 'pending',
  },
  {
    id: 'swap-pancake',
    title: 'Swap on Pancake',
    description: 'Complete one swap on Pancake with your connected wallet.',
    status: 'pending',
  },
  {
    id: 'trade-meme',
    title: 'Trade Meme Coin on Form',
    description: 'Trade $20 Meme Coin on Form',
    status: 'completed',
  },
])

const openTasks = ref<Set<string>>(new Set(['trade-meme']))

function toggleTask(id: string) {
  const next = new Set(openTasks.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  openTasks.value = next
}

function isOpen(id: string) {
  return openTasks.value.has(id)
}
</script>

<template>
  <section class="mx-auto mt-4 flex w-full max-w-[1160px] flex-col gap-6 px-4 text-[var(--hp-white-color)] sm:px-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold leading-8">Hero&apos;s Rebirth - Get Evaluation Opportunities</h1>
      <p class="text-sm leading-5 text-[var(--hp-text-color)]">
        Complete the following tasks to get a free evaluation opportunity.
      </p>
    </header>

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
      <span>2025/11/24 16:00- 2025/12/31 16:00 GMT+08:00</span>
    </div>

    <div class="flex flex-col gap-4">
      <article
        v-for="task in tasks"
        :key="task.id"
        class="bg-[var(--hp-bg-normal)]"
        :class="task.id === 'swap-pancake' ? 'bg-[var(--hp-bg-light)]' : 'bg-[var(--hp-bg-normal)]'"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-6 py-5 text-left"
          @click="toggleTask(task.id)"
        >
          <div class="flex items-center gap-6">
            <span
              class="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--hp-text-color)] transition"
              :class="isOpen(task.id) ? 'rotate-180 border-[var(--hp-white-color)]' : ''"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor">
                <path d="m4 6 4 4 4-4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>

            <div class="flex items-center gap-3">
              <span
                class="flex h-[18px] w-[18px] items-center justify-center rounded-sm"
                :class="task.status === 'completed' ? 'bg-[var(--hp-primary-green)]' : 'bg-[var(--hp-bg-light)]'"
              >
                <svg
                  v-if="task.status === 'completed'"
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  class="h-3.5 w-3.5 text-[var(--hp-black-color)]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m4 8 2.5 2.5L12 5" />
                </svg>
              </span>
              <p class="text-base font-medium leading-6">{{ task.title }}</p>
            </div>
          </div>

          <span class="text-[var(--hp-primary-green)]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </span>
        </button>

        <div v-if="isOpen(task.id)" class="px-14 pb-5 text-sm leading-5 text-[var(--hp-text-color)]">
          {{ task.description }}
        </div>
      </article>
    </div>
  </section>
</template>
