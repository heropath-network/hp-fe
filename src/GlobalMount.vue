<script lang="ts" setup>
import { ConnectWalletDialog } from "@/components";
import { tryOnMounted, tryOnUnmounted } from "@vueuse/core";
import { ref } from "vue";
import emitter from "./event";
import { WALLET_EVENTS } from "./event/walletEvent";

// ----- connect wallet dialog -----
const showConnectWalletDialog = ref(false);
const showWalletConnectorModal = () => {
  showConnectWalletDialog.value = true;
};
// ---------------------------------

tryOnMounted(() => {
  emitter.on(
    WALLET_EVENTS.SHOW_WALLET_CONNECTOR_MODAL,
    showWalletConnectorModal
  );
});

tryOnUnmounted(() => {
  emitter.off(
    WALLET_EVENTS.SHOW_WALLET_CONNECTOR_MODAL,
    showWalletConnectorModal
  );
});
</script>
<template>
  <ConnectWalletDialog
    v-if="showConnectWalletDialog"
    @close="showConnectWalletDialog = false"
  />
</template>
