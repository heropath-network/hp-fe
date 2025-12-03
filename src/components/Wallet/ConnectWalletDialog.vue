<script lang="ts" setup>
import { ref, computed } from 'vue'
import { tryOnMounted } from '@vueuse/core'
import { HpDialog, LoadingIcon } from '@/components'
import { useConnectors, useChainId, useConnect, useConnection } from '@wagmi/vue'
import MetaMaskIcon from '@/assets/icons/wallet/MetaMask.svg'
import WalletConnectIcon from '@/assets/icons/wallet/WalletConnect.svg'
import TrustWalletIcon from '@/assets/icons/wallet/TrustWallet.svg'
import BinanceWalletIcon from '@/assets/icons/wallet/BinanceWallet.svg'
import EmailIcon from '@/assets/icons/wallet/Email.svg'

const emits = defineEmits<{
  (e: 'close'): void
}>()

const visible = ref(false)

const chainId = useChainId()
const { connectAsync } = useConnect()
const connectors = useConnectors()
const { connector, isConnecting, isConnected } = useConnection()

type WalletItem = {
  name: string
  connector: ReturnType<typeof useConnectors>['value'][number] | undefined
  icon: string
  firstCloseDialog: boolean
  disabled: boolean
}

const wallets = computed<WalletItem[]>(() => [
  {
    name: 'Trust Wallet',
    connector: connectors.value.find((c) => c.name === 'Trust Wallet'),
    icon: TrustWalletIcon,
    firstCloseDialog: false,
    disabled: false,
  },
  {
    name: 'MetaMask',
    connector:
      connectors.value.find((c) => c.name === 'MetaMask') || connectors.value.find((c) => c.name === 'Injected'),
    icon: MetaMaskIcon,
    firstCloseDialog: false,
    disabled: false,
  },
  {
    name: 'WalletConnect',
    connector: connectors.value.find((c) => c.name === 'WalletConnect'),
    icon: WalletConnectIcon,
    firstCloseDialog: true,
    disabled: false,
  },
  {
    name: 'Binance Wallet',
    connector: undefined,
    icon: BinanceWalletIcon,
    firstCloseDialog: false,
    disabled: true,
  },
])

function isConnectedStatus(name: string) {
  const walletName = connector.value?.name
  const finedWallet = wallets.value.find((w) => w.name === walletName)
  if (!finedWallet && isConnected.value && name === 'MetaMask') {
    return true
  }
  return walletName === name && isConnected.value
}

const delayCloseDialog = () => {
  window.setTimeout(() => {
    onCloseDialog()
  }, 200)
}

function onCloseDialog() {
  visible.value = false
  emits('close')
}

async function onConnectWallet(wallet: WalletItem, chainId: any) {
  if (wallet.disabled || !wallet.connector) {
    return
  }
  if (wallet.firstCloseDialog) {
    delayCloseDialog()
  }
  await connectAsync({ connector: wallet.connector, chainId: chainId })
  onCloseDialog()
}

tryOnMounted(() => {
  visible.value = true
})
</script>

<template>
  <HpDialog :show="visible" @close="onCloseDialog">
    <template #title>Connect Wallet</template>
    <template #default>
      <div class="mt-4">
        <div
          v-for="wallet in wallets"
          :key="wallet.name"
          class="flex justify-between items-center cursor-pointer h-[52px] px-[16px] py-[10px] bg-[var(--hp-bg-light)] border-[1px] border-[var(--hp-bg-light)] hover:border-[var(--hp-primary-green)] mt-2 first:mt-0"
          @click="onConnectWallet(wallet, chainId)"
        >
          <div class="flex items-center">
            <img class="w-8 h-8 mr-3" :src="wallet.icon" :alt="wallet.name" />
            <span class="text-[16px] leading-6 font-semibold text-[var(--hp-white-color)]">{{ wallet.name }}</span>
          </div>
          <span>
            <template v-if="connector?.name === wallet.name && isConnecting">
              <LoadingIcon size="24" class="ml-2" />
            </template>
            <template v-else-if="isConnectedStatus(wallet.name)">
              <div class="inline-block h-2 w-2 rounded-full bg-[var(--hp-text-green)]"></div>
            </template>
          </span>
        </div>
        <div class="h-[1px] my-4 w-full bg-[var(--hp-line-normal-color)]"></div>
        <div
          class="flex justify-between items-center cursor-pointer h-[52px] px-[16px] py-[10px] bg-[var(--hp-bg-light)] border-[1px] border-[var(--hp-bg-light)] hover:border-[var(--hp-primary-green)] mt-2 first:mt-0"
        >
          <div class="flex items-center">
            <img class="w-8 h-8 mr-3" :src="EmailIcon" alt="Email Login in" />
            <span class="text-[16px] leading-6 font-semibold text-[var(--hp-white-color)]">Email Login In</span>
          </div>
        </div>
      </div>
    </template>
  </HpDialog>
</template>
