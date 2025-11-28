<script setup lang="ts">
import { useChainId, useConnect, useConnectors } from "@wagmi/vue";

const chainId = useChainId();
const { connect } = useConnect();
const connectors = useConnectors();
</script>

<template>
  <div>
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
  </div>
</template>
