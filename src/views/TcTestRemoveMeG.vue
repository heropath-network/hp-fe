<template>
  <div class="tc-test-page p-4">
    <h1 class="text-2xl font-bold mb-4">TC Test Remove Me G</h1>
    
    <div class="section mb-6">
      <h2 class="text-xl font-semibold mb-2">1. Market Config (Loaded from TcTestRemoveMeGConfig.json)</h2>
      <div class="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
        <pre class="text-sm">{{ JSON.stringify(marketConfig.markets, null, 2) }}</pre>
      </div>
    </div>

    <div class="section mb-6">
      <h2 class="text-xl font-semibold mb-2">2. Latest Price (Polling for: {{ selectedMarket?.symbol || 'N/A' }})</h2>
      <div class="text-lg">
        Current Price: <span class="font-mono text-green-600 font-bold">{{ currentPrice || 'Loading...' }}</span>
      </div>
      <p class="text-sm text-gray-500">
        (Polling every 5 seconds. WebSocket integration requires API details.)
      </p>
    </div>

    <div class="section mb-6">
      <h2 class="text-xl font-semibold mb-2">4. Chart (TradingView)</h2>
      <div id="tv_chart_container" class="h-[600px] w-full border border-gray-300 rounded flex items-center justify-center text-gray-400">
    Chart placeholder. Historical data API not yet integrated.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import marketConfigData from './TcTestRemoveMeGConfig.json';

interface Market {
  id: number;
  symbol: string;
  name: string;
  address: string;
  baseToken: { symbol: string; decimals: number; };
  quoteToken: { symbol: string; decimals: number; };
  currentPrice?: string; // Add currentPrice as optional for the initial config load
}

const marketConfig = ref<{ markets: Market[] }>({ markets: [] });
const currentPrice = ref<string | null>(null);
const selectedMarket = ref<Market | null>(null);
let pricePollingInterval: ReturnType<typeof setInterval> | null = null;

// Initialize market config from the loaded JSON
marketConfig.value = marketConfigData;

// Function to fetch the latest price for a given token address
async function fetchLatestPrice(tokenAddress: string) {
  try {
    // Query for the specific token address directly to get its latest data including price
    const url = `https://four.meme/meme-api/v1/private/token/query?orderBy=BnTimeDesc&queryMode=Binance&tokenName=&listedPancake=true&pageIndex=1&pageSize=1&address=${tokenAddress}`;
    const response = await fetch(url);
    const json = await response.json();
    
    if (json.code === 0 && json.data && (json.data as any[]).length > 0) {
      const tokenData = (json.data as any[])[0]; // Assuming the first item is our token
      if (tokenData && tokenData.tokenPrice) {
        currentPrice.value = tokenData.tokenPrice.price;
        // Optionally update the price in the config itself
        const index = marketConfig.value.markets.findIndex(m => m.address === tokenAddress);
        if (index !== -1) {
          marketConfig.value.markets[index].currentPrice = tokenData.tokenPrice.price;
        }
      } else {
        console.warn(`Price data not found for ${tokenAddress}`);
      }
    } else {
      console.error(`Failed to fetch token data for ${tokenAddress}:`, json.msg);
    }
  } catch (error) {
    console.error(`Error fetching latest price for ${tokenAddress}:`, error);
  }
}

onMounted(() => {
  console.log('TcTestRemoveMeG mounted');
  if (marketConfig.value.markets.length > 0) {
    selectedMarket.value = marketConfig.value.markets[0]; // Select the first market
    fetchLatestPrice(selectedMarket.value.address); // Fetch initial price

    // Start polling for price updates
    pricePollingInterval = setInterval(() => {
      if (selectedMarket.value) {
        fetchLatestPrice(selectedMarket.value.address);
      }
    }, 5000); // Poll every 5 seconds
  } else {
    console.warn('No markets found in config.');
  }

  // Placeholder for TradingView chart initialization
  // if (window.TradingView) {
  //   new window.TradingView.widget({
  //     // ... chart config using selectedMarket
  //   });
  // }
});

onBeforeUnmount(() => {
  if (pricePollingInterval) {
    clearInterval(pricePollingInterval);
  }
});
</script>

<style scoped>
.tc-test-page {
  max-width: 1200px;
  margin: 0 auto;
}
.section pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
