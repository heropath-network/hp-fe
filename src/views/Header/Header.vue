<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import ConnectWalletButton from './ConnectWalletButton.vue'
import { ROUTE_NAMES } from '@/router'

const router = useRouter()

function goNewEvaluation() {
  router.push({ name: ROUTE_NAMES.Evaluation })
}
</script>

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
        class="rounded bg-[var(--hp-primary-green)] h-[32px] px-2 py-1.5 text-[var(--hp-black-color)] text-[14px] font-[500] leading-none transition hover:bg-[var(--hp-primary-green-hover)] active:bg-[var(--hp-primary-green-hover)]"
        @click="goNewEvaluation"
      >
        New Evaluation
      </button>
      <div class="bg-[var(--hp-line-color)] w-[1px] h-[20px]"></div>
      <ConnectWalletButton />
    </div>
  </header>
</template>
