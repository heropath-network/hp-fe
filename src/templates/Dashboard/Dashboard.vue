<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import copyIcon from '@/assets/icons/copy.svg'
import { ellipsisMiddle } from '@/utils/common'

const { address, isConnected } = useConnection()

const goalCards = [
  {
    title: 'Profit Target',
    subtitleSegments: [],
    rows: [
      { label: 'Current Equity', value: '$0.00', valueClass: 'text-[var(--hp-white-color)]' },
      { label: 'Target Equity', value: '$0.00', valueClass: 'text-[var(--hp-text-green)]' },
    ],
  },
  {
    title: 'Maximum Drawdown',
    subtitleSegments: [
      { text: 'High Water Mark: (', class: 'text-[var(--hp-text-color)]' },
      { text: '$0.00', class: 'text-[var(--hp-white-color)]' },
      { text: ')', class: 'text-[var(--hp-text-color)]' },
    ],
    rows: [
      { label: 'Current Equity', value: '$0.00', valueClass: 'text-[var(--hp-white-color)]' },
      { label: 'Equity Limit', value: '$0.00', valueClass: 'text-[var(--hp-text-red)]' },
    ],
  },
  {
    title: 'Maximum Daily Loss',
    subtitleSegments: [
      { text: 'Prior Day Balance: (', class: 'text-[var(--hp-text-color)]' },
      { text: '$0.00', class: 'text-[var(--hp-white-color)]' },
      { text: ' / ', class: 'text-[var(--hp-text-color)]' },
      { text: '10:31:07', class: 'text-[var(--hp-white-color)]' },
      { text: ')', class: 'text-[var(--hp-text-color)]' },
    ],
    rows: [
      { label: 'Current Equity', value: '$0.00', valueClass: 'text-[var(--hp-white-color)]' },
      { label: 'Equity Limit', value: '$0.00', valueClass: 'text-[var(--hp-text-red)]' },
    ],
  },
]
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1160px] flex-col gap-8 px-4 text-[var(--hp-white-color)] sm:px-6">
    <header class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold leading-8">
        <template v-if="isConnected">Welcome Back, {{ ellipsisMiddle(address) }}</template>
      </h1>
      <p class="text-sm leading-5 text-[var(--hp-text-color)]">
        {{
          [
            new Date().getFullYear(),
            String(new Date().getMonth() + 1).padStart(2, '0'),
            String(new Date().getDate()).padStart(2, '0'),
          ].join('-')
        }}
      </p>
    </header>

    <div class="flex flex-col gap-4">
      <div class="space-y-6 bg-[var(--hp-bg-normal)] p-6">
        <p class="text-xl font-semibold leading-7">
          <span class="text-[var(--hp-primary-green)]">$0.00</span>
          <span class="pl-1">Evaluation</span>
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">$0.00</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Account Balance</p>
          </div>

          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">$0.00</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Total Volume</p>
          </div>

          <div class="flex flex-col gap-1 bg-[var(--hp-bg-light)] p-6">
            <p class="text-xl font-semibold leading-7 text-[var(--hp-white-color)]">$0.00</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)]">Evaluation</p>
          </div>
        </div>
      </div>

      <div class="space-y-4 bg-[var(--hp-bg-normal)] p-6">
        <p class="text-xl font-semibold leading-7">Terminal Details</p>
        <div class="space-y-3">
          <div class="flex items-center justify-between bg-[var(--hp-bg-light)] px-4 py-[14px] text-sm">
            <span class="text-[var(--hp-text-color)]">Login</span>
            <div class="flex items-center gap-2">
              <span class="text-base font-medium leading-6 text-[var(--hp-white-color)]">TBD</span>
              <button
                type="button"
                class="flex items-center text-[var(--hp-text-color)] transition hover:text-[var(--hp-white-color)]"
                aria-label="Copy"
              >
                <span
                  class="icon-mask bg-[var(--hp-text-color)] !w-4 !h-4 hover:!bg-[var(--hp-primary-green)]"
                  :style="{
                    '--icon-url': `url(${copyIcon})`,
                  }"
                ></span>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between bg-[var(--hp-bg-light)] px-4 py-[14px] text-sm">
            <span class="text-[var(--hp-text-color)]">Password</span>
            <div class="flex items-center gap-2">
              <span class="text-base font-medium leading-6 text-[var(--hp-white-color)]">******</span>
              <button
                type="button"
                class="flex items-center text-[var(--hp-text-color)] transition hover:text-[var(--hp-white-color)]"
                aria-label="Copy"
              >
                <span
                  class="icon-mask bg-[var(--hp-text-color)] !w-4 !h-4 hover:!bg-[var(--hp-primary-green)]"
                  :style="{
                    '--icon-url': `url(${copyIcon})`,
                  }"
                ></span>
              </button>
            </div>
          </div>
        </div>
        <div
          class="flex h-[52px] w-full items-center justify-center cursor-pointer border border-[var(--hp-primary-green)] text-[15px] font-medium text-[var(--hp-primary-green)] transition hover:bg-[rgba(108,233,158,0.08)]"
        >
          Open Terminal
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-2xl font-semibold leading-[30px]">Goals Overview</p>
        <div class="text-[var(--hp-white-color)]">
          <svg class="h-6 w-6 rotate-180" fill="none" viewBox="0 0 16 16" stroke="currentColor">
            <path d="M3.5 6 8 10.5 12.5 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">{{ goalCards[0].title }}</p>
            <p v-if="goalCards[0].subtitleSegments && goalCards[0].subtitleSegments.length" class="text-sm leading-5">
              <span
                v-for="(segment, index) in goalCards[0].subtitleSegments"
                :key="`${goalCards[0].title}-${index}-${segment.text}`"
                :class="segment.class"
              >
                {{ segment.text }}
              </span>
            </p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div v-for="(row, index) in goalCards[0].rows" :key="row.label" class="space-y-1">
              <p class="text-xl font-semibold leading-7" :class="row.valueClass">
                {{ row.value }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ row.label }}</p>
              <div v-if="index === 0" class="mt-2 h-px w-full bg-[#373737]" />
            </div>
          </div>
        </article>

        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">{{ goalCards[1].title }}</p>
            <p v-if="goalCards[1].subtitleSegments && goalCards[1].subtitleSegments.length" class="text-sm leading-5">
              <span
                v-for="(segment, index) in goalCards[1].subtitleSegments"
                :key="`${goalCards[1].title}-${index}-${segment.text}`"
                :class="segment.class"
              >
                {{ segment.text }}
              </span>
            </p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div v-for="(row, index) in goalCards[1].rows" :key="row.label" class="space-y-1">
              <p class="text-xl font-semibold leading-7" :class="row.valueClass">
                {{ row.value }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ row.label }}</p>
              <div v-if="index === 0" class="mt-2 h-px w-full bg-[#373737]" />
            </div>
          </div>
        </article>

        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">{{ goalCards[2].title }}</p>
            <p v-if="goalCards[2].subtitleSegments && goalCards[2].subtitleSegments.length" class="text-sm leading-5">
              <span
                v-for="(segment, index) in goalCards[2].subtitleSegments"
                :key="`${goalCards[2].title}-${index}-${segment.text}`"
                :class="segment.class"
              >
                {{ segment.text }}
              </span>
            </p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div v-for="(row, index) in goalCards[2].rows" :key="row.label" class="space-y-1">
              <p class="text-xl font-semibold leading-7" :class="row.valueClass">
                {{ row.value }}
              </p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ row.label }}</p>
              <div v-if="index === 0" class="mt-2 h-px w-full bg-[#373737]" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
