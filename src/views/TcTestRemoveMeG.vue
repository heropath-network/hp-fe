<template>
  <div class="tc-test-page p-4">
    <h1 class="text-2xl font-bold mb-4">TC Test Remove Me G</h1>
    
    <div class="section mb-6">
      <h2 class="text-xl font-semibold mb-2">1. Market Config</h2>
      <div class="bg-gray-100 p-4 rounded">
        <pre class="text-sm">{{ JSON.stringify(marketConfig, null, 2) }}</pre>
      </div>
    </div>

    <div class="section mb-6">
      <h2 class="text-xl font-semibold mb-2">2. Latest Price</h2>
      <div class="text-lg">
        Current Price: <span class="font-mono">{{ currentPrice || 'Loading...' }}</span>
      </div>
    </div>

    <div class="section mb-6">
      <h2 class="text-xl font-semibold mb-2">4. Chart</h2>
      <div id="tv_chart_container" class="h-[600px] w-full border border-gray-300 rounded"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import marketConfigData from './TcTestRemoveMeGConfig.json';

const marketConfig = ref(marketConfigData);
const currentPrice = ref<number | null>(null);

onMounted(() => {
  console.log('TcTestRemoveMeG mounted');
  // Initialize chart or data fetching here
});
</script>

<style scoped>
.tc-test-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
