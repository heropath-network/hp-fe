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

function onCloseDialog() {
  visible.value = false
  emits('close')
}

tryOnMounted(() => {
  visible.value = true
})
</script>

<template>
  <HpDialog :show="visible" @close="onCloseDialog">
    <template #title>About Hero Account</template>
    <template #default>
      <div class="mt-4 text-[14px] leading-[22px] text-[var(--hp-text-color)] space-y-2">
        <div>
          The protocol combines all hero account activity into aggregated insights that help inform the protocol’s own
          independent trading strategy.
        </div>
        <div>
          The protocol never mirrors or duplicates any individual hero account’s trades, never manages user funds, and
          never provides personalized investment advice. All data is blended and anonymized so no single user’s actions
        </div>
        <div>
          can be identified.Participation is optional, and users always retain full control over their own hero
          accounts.
        </div>
      </div>
    </template>
  </HpDialog>
</template>
