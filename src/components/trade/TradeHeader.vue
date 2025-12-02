<template>
  <header
    class="flex h-16 items-center justify-between bg-[var(--hp-bg-dark)] p-[16px] sticky top-0 left-0 right-0 z-10"
  >
    <!-- Left: Logo and Navigation -->
    <div class="flex items-center gap-5">
      <!-- Logo -->
      <div class="flex items-center h-[21px]">
        <span class="text-white font-semibold text-lg leading-[21px]">MUX</span>
      </div>
      <!-- Navigation -->
      <div class="flex items-center">
        <button
          class="flex items-center justify-center h-[32px] px-4 py-3 text-[14px] font-semibold leading-[20px] text-white"
        >
          Trade
        </button>
      </div>
    </div>

    <!-- Right: Account Info and Controls -->
    <div class="flex items-center gap-2">
      <!-- Account Selector -->
      <Menu as="div" class="relative inline-block text-left" v-slot="{ open }">
        <MenuButton
          class="flex items-center gap-1 px-2 py-[6px] text-[14px] font-medium leading-[20px]  transition-colors hover:bg-[#5dd88a] active:bg-[#4fc777] focus:outline-none"
          :class="open ? 'bg-green-success text-neutral-950' : 'text-white'"
          >
          <span>{{ selectedAccount.label }}: {{ formatCurrency(selectedAccount.balance) }}</span>
          <div class="flex items-center justify-center">
            <svg class="h-4 w-4 scale-y-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </MenuButton>

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems
            class="absolute right-0 z-[9999] mt-2 w-[280px] origin-top-right bg-[#272727] border border-[#373737] shadow-[0px_4px_8px_0px_rgba(0,2,10,0.25)] focus:outline-none"
          >
              <div class="flex flex-col py-3">
                <MenuItem
                  v-for="account in accounts"
                  :key="account.id"
                  v-slot="{ active }"
                >
                  <button
                    @click="selectAccount(account)"
                    :class="[
                      'flex items-center gap-[10px] px-2 py-2.5 w-full text-left transition-colors ',
                      account.id === selectedAccount.id ? 'text-gray-400 opacity-50' : 'text-gray-400',
                      account.id !== selectedAccount.id && active ? 'bg-[#373737] !text-white' : ''
                    ]"
                  >
                    <span
                      class="text-[14px] font-medium leading-[20px]"
                    >
                      {{ account.label }}: {{ formatCurrency(account.balance) }}
                    </span>
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
      </Menu>

      <!-- Divider -->
      <div class="h-5 w-px bg-[#272727]"></div>

      <!-- Chain Selector -->
      <button
        class="flex items-center gap-1 px-2 py-1.5 text-[14px] font-medium leading-[20px] text-white transition-colors hover:bg-[rgba(255,255,255,0.05)]"
      >
        <img src="/img/tokens/BNB.svg" alt="BNB Chain" class="h-5 w-5" />
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Divider -->
      <div class="h-5 w-px bg-[#272727]"></div>

      <!-- Wallet Address -->
      <div class="flex items-center gap-1 px-2 py-1.5">
        <div class="flex items-center justify-center shrink-0" style="width: 12.5px; height: 12.5px;">
          <Avatar :address="walletAddress" :size="16" />
        </div>
        <span class="text-[14px] font-medium leading-[20px] text-[#9b9b9b]">
          {{ ellipsisMiddle(walletAddress) }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useConnection } from '@wagmi/vue'
import { formatCurrency } from '@/utils/bigint'
import { ellipsisMiddle } from '@/utils/common'
import Avatar from '@/components/Wallet/Avatar.vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

interface Account {
  id: string
  label: string
  balance: bigint
}

// Mock accounts data - replace with actual data from store/API
const accounts = ref<Account[]>([
  {
    id: 'training-1',
    label: 'Training Account 1',
    balance: BigInt(5000) * BigInt(10 ** 18),
  },
  {
    id: 'evaluation-1',
    label: 'Evaluation Account 1',
    balance: BigInt(5000) * BigInt(10 ** 18),
  },
  {
    id: 'evaluation-2',
    label: 'Evaluation Account 2',
    balance: BigInt(10000) * BigInt(10 ** 18),
  },
  {
    id: 'funded-1',
    label: 'Funded Account 1',
    balance: BigInt(5000) * BigInt(10 ** 18),
  },
])

const selectedAccount = ref<Account>(accounts.value[0])

function selectAccount(account: Account) {
  selectedAccount.value = account
  // TODO: Update store/API with selected account
}

const { address } = useConnection()
const walletAddress = computed(() => address.value || '0x0000000000000000000000000000000000000000')
</script>


