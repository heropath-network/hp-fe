<script lang="ts" setup>
import { computed, ref } from "vue";
import { tryOnMounted, useClipboard } from "@vueuse/core";
import { HpDialog } from "@/components";
import { useConnection, useDisconnect, useConfig } from "@wagmi/vue";
import Avatar from "@/components/Wallet/Avatar.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import emitter from "@/event";
import { WALLET_EVENTS } from "@/event/walletEvent";

const emits = defineEmits<{
  (e: "close"): void;
}>();

const visible = ref(false);

const { address, connector } = useConnection();
const { disconnect } = useDisconnect();
const config = useConfig();

const chainBlockExplorers = computed(async () => {
  const id = await connector.value?.getChainId();
  const chainConfig = config.chains.find((c) => c.id === id);
  return chainConfig?.blockExplorers["default"]?.url;
});

const { copy } = useClipboard();

function onCloseDialog() {
  visible.value = false;
  emits("close");
}

async function viewOnExplorer() {
  const chainBlockExplorer = await chainBlockExplorers.value;
  const url = chainBlockExplorer
    ? `${chainBlockExplorer}/address/${address.value}`
    : undefined;
  if (url) {
    window.open(url, "_blank");
  }
}

tryOnMounted(() => {
  visible.value = true;
});
</script>

<template>
  <HpDialog :show="visible" @close="onCloseDialog">
    <template #title>Account</template>
    <template #default>
      <div class="mt-4 bg-[var(--hp-bg-light)] w-full h-[144px] p-4">
        <div class="flex items-center justify-between">
          <span
            class="font-[500] text-[var(--hp-text-color)] text-[14px] leading-[20px]"
            >{{ connector?.name }}</span
          >
          <div class="flex items-center">
            <div
              class="bg-[var(--hp-white-color)] text-[var(--hp-black-color)] h-[24px] px-2 py-1 flex items-center font-[500] cursor-pointer"
              @click="
                () => {
                  onCloseDialog();
                  emitter.emit(WALLET_EVENTS.SHOW_WALLET_CONNECTOR_MODAL);
                }
              "
            >
              Change
            </div>
            <div
              class="bg-[var(--hp-white-color)] text-[var(--hp-black-color)] h-[24px] px-2 py-1 ml-3 flex items-center font-[500] cursor-pointer"
              @click="
                () => {
                  disconnect();
                  onCloseDialog();
                }
              "
            >
              Disconnect
            </div>
          </div>
        </div>
        <div class="flex items-center mt-4">
          <Avatar :address="address" :size="32" class="flex-shrink-0" />
          <div
            class="ml-2 flex-1 min-w-0 font-[500] text-[var(--hp-white-color)] text-[16px] leading-[24px] break-all"
          >
            {{ address }}
          </div>
        </div>
        <div class="mt-2 flex items-center">
          <div
            class="flex item-center cursor-pointer group"
            @click="copy(address!)"
          >
            <span
              class="text-[14px] leading-5 group-hover:text-[var(--hp-primary-green)]"
              >Copy Address</span
            >
            <BaseIcon
              name="copy"
              size="16"
              class="ml-1 h-4 w-4 text-[var(--hp-text-color)] transition-colors group-hover:text-[var(--hp-primary-green)]"
            />
          </div>
          <div
            class="flex item-center cursor-pointer group ml-6"
            @click="viewOnExplorer"
          >
            <span
              class="text-[14px] leading-5 group-hover:text-[var(--hp-primary-green)]"
              >View on Explorer</span
            >
            <BaseIcon
              name="blockLink"
              size="16"
              class="ml-1 h-4 w-4 text-[var(--hp-text-color)] transition-colors group-hover:text-[var(--hp-primary-green)]"
            />
          </div>
        </div>
      </div>
    </template>
  </HpDialog>
</template>
