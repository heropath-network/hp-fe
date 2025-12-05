<template>
  <header
    class="flex h-16 items-center justify-between bg-[var(--hp-bg-dark)] p-[16px] sticky top-0 left-0 right-0 z-10 border-b border-gray-700"
  >
    <!-- Left: Logo and Navigation -->
    <div class="flex items-center gap-5">
      <!-- Logo -->
      <div class="flex items-center">
        <img src="@/assets/img/HeroPath.svg" alt="Hero PATH" class="h-[32px] w-auto" />
      </div>
      <!-- Navigation -->
      <div class="flex items-center">
        <div
          class="flex items-center justify-center h-[32px] px-[7px] py-[2px] text-[14px] leading-[20px] border border-solid"
          :class="modeConfig?.classes || 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white'"
        >
          {{ modeConfig?.label || 'Training Mode' }}
        </div>
      </div>
    </div>

    <!-- Right: Account Info and Controls -->
    <div class="flex items-center gap-2">
      <!-- Account Selector or New Evaluation Button -->
      <template v-if="!accounts.length">
        <button
          type="button"
          class="flex items-center gap-1 px-2 py-[6px] text-[14px] font-medium leading-[20px] bg-[#6CE99E] text-gray-950 transition-colors hover:bg-[#76FFAD] focus:outline-none"
          @click="router.push({ name: ROUTE_NAMES.Evaluation })"
        >
          New Evaluation
        </button>
      </template>
      <template v-else>
        <Menu as="div" class="relative inline-block text-left" v-slot="{ open }">
          <MenuButton
            class="flex items-center gap-1 px-2 py-[6px] text-[14px] font-medium leading-[20px]  transition-colors hover:bg-[#5dd88a] hover:text-gray-950 focus:outline-none group/icon text-[#9B9B9B]"
            :class="open ? 'bg-[#6CE99E] text-neutral-950' : ''"
            >
            <span v-if="selectedAccount">
              {{ selectedAccount.label }}
            </span>
            <span v-else>Select Evaluation</span>

            <svg :class="open ? 'rotate-180 stroke-[#0A0A0A]' : 'stroke-[#9B9B9B] group-hover/icon:stroke-[#0A0A0A]'" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 6L8 10.5L12.5 6" stroke="stroke-current" stroke-width="2"/>
            </svg>
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
                        account.id === selectedEvaluationId ? 'text-gray-400 opacity-50' : 'text-gray-400',
                        account.id !== selectedEvaluationId && active ? 'bg-[#373737] !text-white' : ''
                      ]"
                    >
                      <span
                        class="text-[14px] font-medium leading-[20px]"
                      >
                        {{ account.label }}
                      </span>
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
        </Menu>
      </template>

      <!-- Divider -->
      <div class="h-5 w-px bg-[#272727]"></div>

      <!-- Chain Selector -->
      <Menu as="div" class="relative inline-block text-left" v-slot="{ open }">
        <MenuButton
          class="flex items-center gap-1 px-2 py-[6px] text-[14px] font-medium leading-[20px] transition-colors hover:bg-[#6CE99E] hover:text-gray-1000 focus:outline-none group/icon"
          :class="open ? 'bg-[#6CE99E] text-gray-1000' : 'text-white'"
        >
          <img :src="currentChain.icon" :alt="currentChain.name" class="h-5 w-5" />
          <svg :class="open ? 'rotate-180 stroke-[#0A0A0A]' : 'stroke-[#9B9B9B] group-hover/icon:stroke-[#0A0A0A]'" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 6L8 10.5L12.5 6" stroke="stroke-current" stroke-width="2"/>
          </svg>
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
            class="absolute right-0 z-[9999] mt-2 w-[150px] origin-top-right bg-[#272727] border border-[#373737] shadow-[0px_4px_8px_0px_rgba(0,2,10,0.25)] focus:outline-none"
          >
            <div class="flex flex-col py-3">
              <MenuItem
                v-for="chain in availableChains"
                :key="chain.id"
                v-slot="{ active }"
              >
                <button
                  @click="switchChain(chain.id)"
                  :class="[
                    'flex items-center gap-[10px] px-2 py-2.5 w-full text-left transition-colors',
                    chain.id === currentChainId ? 'text-gray-400 opacity-50' : 'text-gray-400',
                    chain.id !== currentChainId && active ? 'bg-[#373737] !text-white' : ''
                  ]"
                >
                  <img :src="chain.icon" :alt="chain.name" class="h-5 w-5" />
                  <span class="text-[14px] font-medium leading-[20px]">
                    {{ chain.name }}
                  </span>
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>

      <!-- Divider -->
      <div class="h-5 w-px bg-[#272727]"></div>

      <!-- Wallet Connect Button -->
      <ConnectWalletButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChainId, useSwitchChain } from '@wagmi/vue'
import { bsc } from '@wagmi/vue/chains'
import { toBigInt } from '@/utils/bigint'
import { formatNumber, getAccountTypeLabel } from '@/utils/common'
import { useEvaluationAccount } from '@/composables/useEvaluationAccount'
import { useTradeStore } from '@/stores/tradeStore'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import BSCIcon from '@/assets/img/BSC.svg'
import ConnectWalletButton from '@/views/Header/ConnectWalletButton.vue'
import { ROUTE_NAMES } from '@/router'
import downIcon from '@/assets/icons/down.svg'

interface Account {
  id: string
  label: string
  balance: bigint
}

const router = useRouter()
const tradeStore = useTradeStore()

// Use the shared composable for account balance logic
const {
  evaluationList,
  selectedEvaluationId,
  selectedEvaluation,
  selectEvaluation: selectEvaluationBase,
} = useEvaluationAccount()

// Convert evaluations to Account format
const accounts = computed<Account[]>(() => {
  return evaluationList.value.map((evaluation) => {
    const accountSize = evaluation.evaluationConfig.accountSize
    const label = `${getAccountTypeLabel(evaluation.accountType)} #${evaluation.accountId}: $${formatNumber(accountSize, 0)}`
    return {
      id: evaluation.accountId,
      label,
      balance: toBigInt(accountSize),
    }
  })
})

const selectedAccount = computed<Account | null>(() => {
  if (!selectedEvaluationId.value) {
    return accounts.value[0] || null
  }
  return accounts.value.find((account) => account.id === selectedEvaluationId.value) || accounts.value[0] || null
})

watch(
  selectedEvaluationId,
  (accountId) => {
    tradeStore.currentAccountId = accountId
  },
  { immediate: true },
)

function selectAccount(account: Account) {
  selectEvaluationBase(account.id)
  router.push({ name: ROUTE_NAMES.Dashboard })
}

const modeConfig = computed(() => {
  if (!selectedEvaluation.value) {
    return null
  }

  const accountType = selectedEvaluation.value.accountType

  switch (accountType) {
    case 'trading':
      return {
        label: 'Training Mode',
        classes: 'bg-white bg-opacity-10 border-white border-opacity-10 text-white',
      }
    case 'evaluation':
      return {
        label: 'Evaluation Mode',
        classes: 'bg-[#FFB110] bg-opacity-10 border-[#FFB110] border-opacity-10 text-[#FFB110]',
      }
    case 'funded':
      return {
        label: 'Funded Mode',
        classes: 'bg-[#10C8A8] bg-opacity-10 border-[#10C8A8] border-opacity-10 text-[#10C8A8]',
      }
    default:
      return null
  }
})


// Chain selector logic
interface Chain {
  id: number
  name: string
  icon: string
}

const availableChains: Chain[] = [
{
    id: bsc.id,
    name: 'BNB Chain',
    icon: BSCIcon,
  },
]

const chainId = useChainId()
const currentChainId = computed(() => chainId.value)
const { switchChain: switchChainWagmi } = useSwitchChain()

const currentChain = computed(() => {
  return availableChains.find((chain) => chain.id === currentChainId.value) || availableChains[0] // Default to BNB Chain
})

async function switchChain(targetChainId: number) {
  try {
    await switchChainWagmi({ chainId: targetChainId as 10 | 56 | 42161 })
  } catch (error) {
    console.error('Failed to switch chain:', error)
  }
}
</script>


