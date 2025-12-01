<template>
  <header class="flex h-16 items-center justify-between border-b border-[var(--hp-line-color)] bg-[var(--hp-bg-dark)] px-6">
    <!-- Left: Logo and Brand -->
    <div class="flex items-center gap-3">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-[var(--hp-brand-blue)]">
        <span class="text-lg font-bold text-white">M</span>
      </div>
      <span class="text-base font-semibold text-[var(--hp-white-color)]">MUX Trade</span>
    </div>

    <!-- Right: Account Info and Controls -->
    <div class="flex items-center gap-2">
      <!-- Account Balance -->
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--hp-white-color)] transition hover:bg-[var(--hp-bg-normal)]"
        >
          <span class="font-medium">Training Account 1: {{ formatCurrency(accountBalance) }}</span>
          <svg class="h-4 w-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div class="mx-1 h-6 w-px bg-gray-800"></div>

      <!-- Wallet Address -->
      <div class="flex items-center gap-2">
        <ConnectWalletButton />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTradeStore } from '@/stores/tradeStore'
import { formatCurrency } from '@/utils/bigint'
import ConnectWalletButton from '@/views/Header/ConnectWalletButton.vue'

const tradeStore = useTradeStore()
const accountBalance = computed(() => tradeStore.accountBalance)
</script>


