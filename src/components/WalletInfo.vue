<script lang="ts" setup>
import { useConnection, useDisconnect } from "@wagmi/vue";

const { address, connector } = useConnection();
const { disconnect } = useDisconnect();

const t = async () => {
  const p = await connector.value?.getProvider();
};
</script>

<template>
  <div>
    <div>Address: {{ address }}</div>
    <div>Connected to {{ connector?.name }} Connector.</div>
    <button @click="disconnect()">Disconnect</button>
  </div>
</template>
