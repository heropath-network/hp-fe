<script lang="ts" setup>
import { ref } from 'vue'
import { useConnection } from '@wagmi/vue'
import Avatar from '@/components/Wallet/Avatar.vue'
import { ellipsisMiddle } from '@/utils/common'
import ConnectedWalletInfoDialog from './ConnectedWalletInfoDialog.vue'
import emitter from '@/event'
import { WALLET_EVENTS } from '@/event/walletEvent'

const emits = defineEmits<{
  (e: 'close'): void
}>()

const showInfoDialog = ref(false)

const { address, isConnected } = useConnection()

const showConnectWalletInfoDialog = () => {
  emitter.emit(WALLET_EVENTS.SHOW_WALLET_CONNECTOR_MODAL)
}
</script>

<template>
  <template v-if="isConnected">
    <div
      class="flex items-center cursor-pointer group gap-1 py-[6px] px-[8px] hover:bg-[var(--hp-primary-green)] text-[var(--hp-text-color)] hover:text-[#0A0A0A]"
      @click="showInfoDialog = true"
    >
      <Avatar :address="address" :size="20" />
      <span class="mx-1 text-sm font-medium">
        {{ ellipsisMiddle(address) }}
      </span>
    </div>
  </template>
  <template v-else>
    <button
      type="button"
      class="bg-[var(--hp-white-color)] h-[32px] px-2 py-1.5 text-[var(--hp-black-color)] text-[14px] font-[500] leading-none transition hover:bg-[var(--hp-primary-green)] active:bg-[var(--hp-primary-green)]"
      @click="showConnectWalletInfoDialog"
    >
      Connect Wallet
    </button>
  </template>
  <ConnectedWalletInfoDialog v-if="showInfoDialog" @close="showInfoDialog = false" />
</template>
