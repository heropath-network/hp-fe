<script lang="ts" setup>
import {
  useConnection,
  useConnectors,
  useConnect,
  useChainId,
} from "@wagmi/vue";
import Avatar from "@/components/Wallet/Avatar.vue";
import { ellipsisMiddle } from "@/utils/common";
import ArrowIcon from "@/assets/icons/arrow.svg";
import { useDisconnect } from "@wagmi/vue";

const chainId = useChainId();
const { address, isConnected } = useConnection();
const connectors = useConnectors();
const { connect } = useConnect();
const { disconnect } = useDisconnect();
</script>

<template>
  <template v-if="isConnected">
    <div class="flex items-center cursor-pointer group">
      <Avatar :address="address" :size="20" />
      <span
        class="mx-1 text-[var(--hp-text-color)] group-hover:text-[var(--hp-primary-green)]"
      >
        {{ ellipsisMiddle(address) }}
      </span>
      <span
        class="icon-mask text-[var(--hp-text-color)] group-hover:bg-[var(--hp-primary-green)]"
        :style="{
          '--icon-url': `url(${ArrowIcon})`,
        }"
      />
    </div>
    <button @click="disconnect()">Disconnect</button>
  </template>
  <template v-else>
    <!-- <button
      type="button"
      class="rounded bg-[var(--hp-white-color)] h-[32px] px-2 py-1.5 text-[var(--hp-black-color)] text-[14px] font-[500] leading-none transition hover:bg-[var(--hp-primary-green)] active:bg-[var(--hp-primary-green)]"
    >
      Connect Wallet
    </button> -->
    <button
      class="block"
      v-for="connector in connectors"
      :key="connector.id"
      @click="
        connect({
          connector,
          chainId: chainId,
        })
      "
    >
      {{ connector.name }}
    </button>
  </template>
</template>
