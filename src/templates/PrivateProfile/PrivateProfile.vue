<script setup lang="ts">
const stats = [
  ["Lifetime Trading Volume", "Funded Trading Volume"],
  ["Current Withdrawable Profit", "Highest Win Rate Asset"],
  ["Trading Win Rate", "Lifetime Profit Withdrawn"],
];
</script>

<template>
  <div class="space-y-8 text-[var(--hp-white-color)]">
    <section class="space-y-1">
      <h1 class="text-2xl font-semibold leading-8">Welcome Back, Woden</h1>
      <p class="text-sm text-[var(--hp-text-color)]">2025-11-27</p>
    </section>

    <section class="space-y-6 rounded bg-[var(--hp-bg-normal)] p-6">
      <h2 class="text-lg font-semibold">Public Profile Settings</h2>
      <div class="space-y-4">
        <div
          v-for="(row, idx) in stats"
          :key="idx"
          class="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <div
            v-for="item in row"
            :key="item"
            class="rounded bg-[var(--hp-bg-light)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--hp-line-color)]"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold leading-7">Accounts</h2>
        <p class="text-sm text-[var(--hp-text-color)]">
          A list of all of your accounts.
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm font-medium">
          <button
            type="button"
            class="rounded bg-[var(--hp-line-color)] px-3 py-2 text-[var(--hp-white-color)] transition hover:brightness-110"
          >
            All
          </button>
          <button
            type="button"
            class="rounded px-3 py-2 text-[var(--hp-text-color)] transition hover:bg-[var(--hp-line-color)] hover:text-[var(--hp-white-color)]"
          >
            Active
          </button>
          <button
            type="button"
            class="rounded px-3 py-2 text-[var(--hp-text-color)] transition hover:bg-[var(--hp-line-color)] hover:text-[var(--hp-white-color)]"
          >
            Inactive
          </button>
        </div>
        <div
          class="flex items-center gap-3 text-sm text-[var(--hp-text-color)]"
        >
          <span>Show on Leaderboard</span>
          <div
            class="flex h-4 w-7 items-center rounded-full bg-[var(--hp-line-color)] px-[2px]"
          >
            <div
              class="ml-auto h-3 w-3 rounded-full bg-[var(--hp-primary-green)]"
            ></div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded border border-[var(--hp-line-color)]">
        <div
          class="grid grid-cols-6 bg-[var(--hp-bg-normal)] px-4 py-3 text-[13px] text-[var(--hp-text-color)]"
        >
          <span>Date</span>
          <span>Account Number</span>
          <span>Dropdown (Hide/Show)</span>
          <span>Account Type</span>
          <span>Public Profile (Hide/Show)</span>
          <span>Status</span>
        </div>
        <div
          class="grid grid-cols-6 items-center bg-[var(--hp-bg-light)] px-4 py-6 text-center text-sm text-[var(--hp-white-color)]"
        >
          <span class="col-span-6">No data available</span>
        </div>
      </div>
    </section>
  </div>
</template>
