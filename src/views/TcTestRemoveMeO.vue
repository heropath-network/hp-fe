<template>
  <div class="min-h-screen bg-gray-950 p-6 text-gray-100">
    <div class="mx-auto max-w-6xl space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">tc-test-remove-me-o</h1>
          <p class="text-sm text-gray-400">Goals: hardcode markets → fetch latest price → keep WS updates → hook tradingview history.</p>
        </div>
        <button
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          @click="refreshAll"
        >
          Refresh
        </button>
      </div>

      <section class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="mb-2 text-sm text-gray-400">Select Market</div>
          <select
            v-model="selectedMarketId"
            class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option v-for="m in markets" :key="m.id" :value="m.id">
              {{ m.symbol }} · {{ m.name }}
            </option>
          </select>
        </div>

        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="text-sm text-gray-400">Latest Price</div>
          <div class="mt-2 text-2xl font-bold text-white">
            {{ latestPrice || '---' }}
          </div>
          <div class="mt-1 text-xs text-gray-500">from /meme-api/v1/private/token/getById</div>
        </div>

        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="text-sm text-gray-400">WS Status</div>
          <div class="mt-2 text-2xl font-bold" :class="wsConnected ? 'text-green-400' : 'text-red-400'">
            {{ wsConnected ? 'Connected' : 'Disconnected' }}
          </div>
          <div class="mt-1 text-xs text-gray-500">updates: {{ updateCount }}</div>
        </div>
      </section>

      <section class="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Debug Log</h2>
          <button
            class="rounded border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:border-blue-500 hover:text-blue-300"
            @click="debugLogs = []"
          >Clear</button>
        </div>
        <div class="h-64 overflow-y-auto rounded bg-gray-800 p-3 font-mono text-xs text-gray-300">
          <div v-for="(log, idx) in debugLogs" :key="idx" class="mb-1">
            <span class="text-gray-500">{{ log.time }}</span>
            <span :class="log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-300'">
              {{ log.message }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";

interface Market {
  id: number;
  symbol: string;
  name: string;
  address: string;
  networkCode: string;
  dexType: string;
  image: string;
}

type LogType = "info" | "success" | "error";

interface DebugLog {
  time: string;
  type: LogType;
  message: string;
}

const markets = ref<Market[]>([]);
const selectedMarketId = ref<number | null>(null);
const latestPrice = ref<string>("");
const wsConnected = ref(false);
const updateCount = ref(0);
const debugLogs = ref<DebugLog[]>([]);

let ws: WebSocket | null = null;

function addLog(message: string, type: LogType = "info") {
  const time = new Date().toLocaleTimeString();
  debugLogs.value.push({ time, type, message });
  if (debugLogs.value.length > 120) {
    debugLogs.value.shift();
  }
}

import configData from "./TcTestRemoveMeO-config.json";

async function loadConfig() {
  try {
    markets.value = (configData as { markets: Market[] }).markets || [];
    selectedMarketId.value = markets.value[0]?.id ?? null;
    addLog(`config loaded, markets=${markets.value.length}`, "success");
  } catch (error) {
    addLog(`config load failed: ${error}`, "error");
  }
}

async function fetchLatestPrice() {
  if (!selectedMarketId.value) {
    addLog("no market selected, skip price fetch", "error");
    return;
  }
  try {
    const url = `https://four.meme/meme-api/v1/private/token/getById?id=${selectedMarketId.value}`;
    const res = await fetch(url);
    const json = await res.json();
    const price = json?.data?.tokenPrice?.price ?? "";
    latestPrice.value = price;
    addLog(`price fetched: ${price}`, "success");
  } catch (error) {
    addLog(`price fetch failed: ${error}`, "error");
  }
}

function connectWs() {
  if (!selectedMarketId.value) {
    addLog("no market selected, skip ws", "error");
    return;
  }
  disconnectWs();
  ws = new WebSocket("wss://ws.four.meme/ws");
  ws.onopen = () => {
    wsConnected.value = true;
    addLog("ws connected", "success");
    try {
      const payload = { cmd: "sub", topic: "ticker", id: selectedMarketId.value };
      ws?.send(JSON.stringify(payload));
      addLog(`ws subscribe: ${JSON.stringify(payload)}`, "info");
    } catch (err) {
      addLog(`ws subscribe failed: ${err}`, "error");
    }
  };
  ws.onmessage = (event) => {
    updateCount.value += 1;
    const text = typeof event.data === "string" ? event.data : "[binary]";
    if (updateCount.value <= 5) {
      addLog(`ws message: ${text.slice(0, 120)}`, "info");
    }
    try {
      const parsed = JSON.parse(text);
      const price = parsed?.price ?? parsed?.lastPrice ?? parsed?.data?.price;
      if (price) {
        latestPrice.value = price;
      }
    } catch (_err) {
      /* ignore parse errors, log already captured */
    }
  };
  ws.onerror = (event) => {
    addLog(`ws error: ${JSON.stringify(event)}`, "error");
  };
  ws.onclose = () => {
    wsConnected.value = false;
    addLog("ws closed", "info");
  };
}

function disconnectWs() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

function refreshAll() {
  fetchLatestPrice();
  connectWs();
}

watch(selectedMarketId, (val) => {
  if (val) {
    addLog(`switch market: ${val}`, "info");
    fetchLatestPrice();
    connectWs();
  }
});

onMounted(async () => {
  addLog("mounted", "info");
  await loadConfig();
  if (selectedMarketId.value) {
    fetchLatestPrice();
    connectWs();
  }
});

onUnmounted(() => {
  disconnectWs();
});
</script>

<style scoped>
.min-h-screen {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
</style>
