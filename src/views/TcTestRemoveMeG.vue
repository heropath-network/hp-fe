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
const kLineData = ref<KLineBar[]>([]);
let ws: WebSocket | null = null;
let tvWidget: any = null; // TradingView widget instance

// Define a type for K-line bar data
interface KLineBar {
  time: number; // Unix timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// TradingView Datafeed interface (simplified for this example)
interface Datafeed {
  onReady: (callback: (configuration: any) => void) => void;
  resolveSymbol: (
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: any) => void,
    onResolveErrorCallback: (reason: string) => void
  ) => void;
  getBars: (
    symbolInfo: any,
    resolution: string,
    rangeStartDate: number, // Unix timestamp in seconds
    rangeEndDate: number,   // Unix timestamp in seconds
    onHistoryCallback: (bars: KLineBar[], meta: any) => void,
    onErrorCallback: (reason: string) => void,
    firstDataRequest: boolean
  ) => void;
  subscribeBars: (
    symbolInfo: any,
    resolution: string,
    onRealtimeCallback: (bar: KLineBar) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) => void;
  unsubscribeBars: (subscriberUID: string) => void;
}

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
         
         if (data.event === '@TOKEN_PRICE_EVENT@0' && data.data) {
           const { tokenId, price } = data.data;
           if (selectedMarket.value && tokenId === selectedMarket.value.id) {
             currentPrice.value = price;
             logWs(`Updated price for ${selectedMarket.value.symbol}: ${price}`);
           }
         } else if (data.event && data.data && data.event.includes('@BAR_EVENT')) {
             const barData = data.data;
             const newBar: KLineBar = {
               time: barData.createDate, // Use createDate as timestamp
               open: parseFloat(barData.open),
               high: parseFloat(barData.high),
               low: parseFloat(barData.low),
               close: parseFloat(barData.close),
               volume: parseFloat(barData.volume),
             };
             logWs(`Received Bar Event for TokenId ${barData.tokenId} (${data.event.split('@')[0]}): ${newBar.close}`);
             // Iterate through all active subscribers and call their realtime callback
             for (const subscriberUID in subscribers) {
               // A more robust solution would check if the bar belongs to this subscriber's symbol/resolution
               subscribers[subscriberUID](newBar);
             }
         } else {
             logWs(`Received unknown event: ${JSON.stringify(data)}`);
         }
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

// Function to fetch K-line data
async function fetchKLineData(tokenId: number, typeEnum: string, endDate: number, pageSize: number): Promise<KLineBar[]> {
  try {
    const url = `https://four.meme/meme-api/v1/public/bar/new`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: tokenId,
        typeEnum: typeEnum,
        pageSize: pageSize,
        endDate: endDate,
        symbol: "ORIGINAL", // As per documentation
        isAve: false,       // As per documentation
      }),
    });
    const json = await response.json();

    if (json.code === 0 && json.data && json.data.length > 0) {
      return json.data.map((bar: any) => ({
        time: bar.createDate, // Use createDate as timestamp
        open: parseFloat(bar.open),
        high: parseFloat(bar.high),
        low: parseFloat(bar.low),
        close: parseFloat(bar.close),
        volume: parseFloat(bar.volume),
      }));
    } else {
      console.warn(`No K-line data found for tokenId ${tokenId}, type ${typeEnum}`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching K-line data for tokenId ${tokenId}, type ${typeEnum}:`, error);
    return [];
  }
}

const subscribers: { [key: string]: (bar: KLineBar) => void } = {};
let nextSubscriberUID = 1;

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

onMounted(async () => { // Make onMounted async
  console.log('TcTestRemoveMeG mounted');
  if (marketConfig.value.markets.length > 0) {
    selectedMarket.value = marketConfig.value.markets[0]; // Select the first market
    await fetchLatestPrice(selectedMarket.value.address); // Fetch initial price
    
    connectWebSocket();

    // Fetch initial K-line data
    if (selectedMarket.value) {
      // kLineData.value = await fetchKLineData(selectedMarket.value.id, 'MIN5', Date.now(), 100);
      
      // Initialize TradingView Widget
      if (window.TradingView) {
        tvWidget = new window.TradingView.widget({
          container: "tv_chart_container",
          datafeed: {
            onReady: (callback) => {
              setTimeout(() => callback({
                supported_resolutions: ['1', '5', '15', '60', '240', '1D'],
              }), 0);
            },
            resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
              const symbolInfo = {
                name: symbolName,
                description: symbolName,
                type: 'crypto',
                session: '24x7',
                timezone: 'exchange',
                has_intraday: true,
                has_seconds: false,
                has_daily: true,
                has_weekly_and_monthly: false,
                supported_resolutions: ['1', '5', '15', '60', '240', '1D'],
                pricescale: 1000000000000000000, // Example for high precision, adjust as needed
                minmov: 1,
                minmov2: 0,
                pointvalue: 1,
                ticker: symbolName,
              };
              onSymbolResolvedCallback(symbolInfo);
            },
            getBars: async (symbolInfo, resolution, rangeStartDate, rangeEndDate, onHistoryCallback, onErrorCallback, firstDataRequest) => {
              if (selectedMarket.value) {
                try {
                  const typeEnum = resolution.includes('D') ? 'DAY1' : (resolution === '60' ? 'HOUR1' : (resolution === '240' ? 'HOUR4' : `MIN${resolution}`));
                  const data = await fetchKLineData(
                    selectedMarket.value.id,
                    typeEnum,
                    rangeEndDate * 1000, // Convert to milliseconds
                    500 // Fetch more data for chart initial load
                  );
                  if (data.length > 0) {
                    onHistoryCallback(data, { noData: false });
                  } else {
                    onHistoryCallback([], { noData: true });
                  }
                } catch (e) {
                  onErrorCallback((e as Error).message);
                }
              } else {
                onErrorCallback('No market selected');
              }
            },
            subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
                subscribers[subscriberUID] = onRealtimeCallback;
                console.log(`Subscribing to bars for ${symbolInfo.name} with resolution ${resolution}, UID: ${subscriberUID}`);
                // If you need to send a WS subscription message specific to resolution, do it here
                if (ws && ws.readyState === WebSocket.OPEN && selectedMarket.value) {
                  const typeEnum = resolution.includes('D') ? 'DAY1' : (resolution === '60' ? 'HOUR1' : (resolution === '240' ? 'HOUR4' : `MIN${resolution}`));
                  ws.send(JSON.stringify({ method: "SUBSCRIBE", params: `${selectedMarket.value.id}@BAR_EVENT-${typeEnum}@0` }));
                }
            },
            unsubscribeBars: (subscriberUID) => {
                delete subscribers[subscriberUID];
                console.log(`Unsubscribing from bars for ${subscriberUID}`);
            }
          } as unknown as Datafeed, // Cast to Datafeed
          symbol: selectedMarket.value.symbol,
          interval: '5', // Default interval
          locale: 'en',
          fullscreen: false,
          autosize: true,
          container_id: "tv_chart_container",
          theme: 'dark' // Or 'light'
        });
      } else {
        console.error("TradingView is not loaded.");
      }
    }

    // Polling interval is removed, relying on WS and chart updates
    // pricePollingInterval = setInterval(() => {
    //   if (selectedMarket.value) {
    //     fetchLatestPrice(selectedMarket.value.address);
    //   }
    // }, 5000); // Poll every 5 seconds
  } else {
    console.warn('No markets found in config.');
  }
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
