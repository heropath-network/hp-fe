<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import copyIcon from '@/assets/icons/copy.svg'
import { ellipsisMiddle } from '@/utils/common'

const { address, isConnected } = useConnection()
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
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">Profit Target</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)] mt-1">&nbsp;</p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7">$0.00</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Equity</p>
              <div class="!mt-4 h-px w-full bg-[var(--hp-line-light-color)]" />
            </div>
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-green)]">$0.00</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Total Equity</p>
            </div>
          </div>
        </article>

        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">Maximum Drawdown</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)] mt-1">
              High Water Mark: (<span class="text-[var(--hp-white-color)]">$0.00</span>)
            </p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7">$0.00</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Equity</p>
              <div class="!mt-4 h-px w-full bg-[var(--hp-line-light-color)]" />
            </div>
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-red)]">$0.00</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Equity Limit</p>
            </div>
          </div>
        </article>

        <article class="flex h-full flex-col gap-6 bg-[var(--hp-bg-normal)] p-6">
          <div class="space-y-1">
            <p class="text-xl font-semibold leading-7">Maximum Daily Loss</p>
            <p class="text-sm leading-5 text-[var(--hp-text-color)] mt-1">
              Prior Day Balance (<span class="text-[var(--hp-white-color)]">$0.00</span>)/10:31:07
            </p>
          </div>
          <div class="flex flex-col gap-4 bg-[var(--hp-bg-light)] p-4">
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7">$0.00</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Current Equity</p>
              <div class="!mt-4 h-px w-full bg-[var(--hp-line-light-color)]" />
            </div>
            <div class="space-y-1">
              <p class="text-xl font-semibold leading-7 text-[var(--hp-text-red)]">$0.00</p>
              <p class="text-sm leading-5 text-[var(--hp-text-color)]">Equity Limit</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
