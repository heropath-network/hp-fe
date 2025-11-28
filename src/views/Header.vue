<template>
  <header
    class="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--hp-line-color)] bg-[var(--hp-bg-dark)] px-6"
  >
    <div class="flex items-center gap-3 text-sm">
      <span class="h-6 w-6 rounded-sm bg-[var(--hp-primary-green)]"> </span>
    </div>
    <div class="flex items-center gap-4 text-sm text-[var(--hp-text-color)]">
      <button
        type="button"
        class="rounded bg-[var(--hp-primary-green)] px-3 py-2 text-[var(--hp-black-color)] font-semibold leading-none transition hover:brightness-105 active:brightness-95"
      >
        New Evaluation
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded px-3 py-2 text-[13px] transition hover:bg-[var(--hp-line-color)]"
      >
        <span
          class="flex h-5 w-5 items-center justify-center rounded border border-[var(--hp-text-color)]/40"
        >
          <span class="h-3 w-3 rounded-full bg-[var(--hp-brand-blue)]"></span>
        </span>
        <span class="leading-none text-[var(--hp-text-color)]"
          >0x4D31...8a23</span
        >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          class="h-4 w-4 text-[var(--hp-text-color)]"
        >
          <path
            d="M3.5 6 8 10.5 12.5 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
