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
        (Polling every 5 seconds. WebSocket connected: {{ isWsConnected ? 'Yes' : 'No' }})
      </p>
    </div>

    <div class="section mb-6">
      <h2 class="text-xl font-semibold mb-2">3. WebSocket Log</h2>
      <div class="bg-black text-green-400 p-4 rounded h-40 overflow-y-auto font-mono text-xs">
        <div v-for="(log, i) in wsLogs" :key="i">{{ log }}</div>
      </div>
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
const isWsConnected = ref(false);
const wsLogs = ref<string[]>([]);
let pricePollingInterval: ReturnType<typeof setInterval> | null = null;
let ws: WebSocket | null = null;

// Initialize market config from the loaded JSON
marketConfig.value = marketConfigData;

function logWs(msg: string) {
  wsLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (wsLogs.value.length > 50) wsLogs.value.pop();
}

function connectWebSocket() {
  ws = new WebSocket('wss://ws.four.meme/ws');

  ws.onopen = () => {
    isWsConnected.value = true;
    logWs('Connected');
    
    // Try to request text mode instead of binary
    ws?.send(JSON.stringify({ method: "BINARY", params: "false" }));
    
    // Subscribe to general ticker or specific token if selected
    // Using the ID from the first market if available
    if (selectedMarket.value) {
      const tokenId = selectedMarket.value.id;
      logWs(`Subscribing to token ID: ${tokenId}`);
      ws?.send(JSON.stringify({ method: "SUBSCRIBE", params: `${tokenId}@TOKEN_EVENT@0` }));
      ws?.send(JSON.stringify({ method: "SUBSCRIBE", params: `${tokenId}@BAR_EVENT-MIN5@0` }));
    }
    
    // Also subscribe to general price events just in case
    ws?.send(JSON.stringify({ method: "SUBSCRIBE", params: "@TOKEN_PRICE_EVENT@0" }));
  };

  ws.onmessage = (event) => {
    try {
      if (typeof event.data === 'string') {
         logWs(`Received (Text): ${event.data.substring(0, 100)}...`);
         const data = JSON.parse(event.data);
         // Handle price update logic here if structure is known
      } else {
         logWs(`Received (Binary): ${event.data.byteLength} bytes`);
         // If we still get binary, we might need a protobuf decoder
      }
    } catch (e) {
      logWs(`Error parsing message: ${e}`);
    }
  };

  ws.onerror = (e) => {
    logWs('Error: ' + JSON.stringify(e));
  };

  ws.onclose = () => {
    isWsConnected.value = false;
    logWs('Disconnected');
  };
}

// Function to fetch the latest price for a given token address
async function fetchLatestPrice(tokenAddress: string) {
  try {
    const url = `https://four.meme/meme-api/v1/private/token/get?address=${tokenAddress}`;
    const response = await fetch(url);
    const json = await response.json();
    
    if (json.code === 0 && json.data && json.data.tokenPrice) {
      currentPrice.value = json.data.tokenPrice.price;
      // Optionally update the price in the config itself
      const index = marketConfig.value.markets.findIndex(m => m.address === tokenAddress);
      if (index !== -1) {
        marketConfig.value.markets[index].currentPrice = json.data.tokenPrice.price;
      }
    } else {
      console.warn(`Price data not found for ${tokenAddress}`);
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
    
    connectWebSocket();

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
  if (ws) {
    ws.close();
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
