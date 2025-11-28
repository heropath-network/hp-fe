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

      <section class="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Bars (preview)</h2>
          <div class="flex gap-2">
            <button
              v-for="tf in timeframes"
              :key="tf.label"
              class="rounded border border-gray-700 px-2 py-1 text-xs text-gray-200 hover:border-blue-500"
              @click="fetchBars(tf.type)"
            >{{ tf.label }}</button>
          </div>
        </div>
        <div class="max-h-64 overflow-y-auto rounded bg-gray-800 p-3 font-mono text-xs text-gray-300">
          <div v-if="bars.length === 0" class="text-gray-500">No bars yet.</div>
          <div v-else>
            <div v-for="(bar, idx) in bars.slice(-20).reverse()" :key="idx" class="mb-1">
              <span class="text-gray-500">{{ bar.createDate }}</span>
              <span class="ml-2 text-blue-300">O:{{ bar.open }}</span>
              <span class="ml-2 text-green-300">C:{{ bar.close }}</span>
              <span class="ml-2 text-gray-400">V:{{ bar.volume }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Recent fills (Pancake stage)</h2>
          <button class="rounded border border-gray-700 px-2 py-1 text-xs text-gray-200 hover:border-blue-500" @click="fetchFills()">Refresh fills</button>
        </div>
        <div class="max-h-64 overflow-y-auto rounded bg-gray-800 p-3 font-mono text-xs text-gray-300">
          <div v-if="fills.length === 0" class="text-gray-500">No fills yet.</div>
          <div v-else>
            <div v-for="(f, idx) in fills" :key="idx" class="mb-1">
              <span class="text-gray-500">{{ f.createDate }}</span>
              <span class="ml-2" :class="f.side === 'BID' ? 'text-green-300' : 'text-red-300'">{{ f.side }}</span>
              <span class="ml-2 text-blue-300">P:{{ f.price }}</span>
              <span class="ml-2 text-gray-300">A:{{ f.amount }}</span>
              <span class="ml-2 text-gray-400">Vol:{{ f.volume }}</span>
            </div>
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
const lastBar = ref<Record<string, string> | null>(null);
const bars = ref<any[]>([]);
const fills = ref<any[]>([]);
const timeframes = [
  { label: "1h", type: "MIN5" },
  { label: "4h", type: "MIN5" },
  { label: "1d", type: "MIN5" },
  { label: "15m", type: "MIN15" },
  { label: "1m", type: "MIN1" },
  { label: "1h-c", type: "HOUR1" },
  { label: "4h-c", type: "HOUR4" },
  { label: "1d-c", type: "DAY1" },
];

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
      const cmds = [
        { method: "BINARY", params: "false" },
        { method: "SUBSCRIBE", params: "@TICKER_EVENT" },
        { method: "SUBSCRIBE", params: `${selectedMarketId.value}@TOKEN_EVENT@0` },
        { method: "SUBSCRIBE", params: "@TOKEN_PRICE_EVENT@0" },
        { method: "SUBSCRIBE", params: `${selectedMarketId.value}@BAR_EVENT-MIN5@0` },
      ];
      cmds.forEach((cmd) => {
        ws?.send(JSON.stringify(cmd));
        addLog(`ws send: ${JSON.stringify(cmd)}`, "info");
      });
    } catch (err) {
      addLog(`ws subscribe failed: ${err}`, "error");
    }
  };
  ws.onmessage = (event) => {
    updateCount.value += 1;
    const handleText = (text: string) => {
      if (updateCount.value <= 5) {
        addLog(`ws message: ${text.slice(0, 120)}`, "info");
      }
      try {
        const parsed = JSON.parse(text);
        processWsPayload(parsed);
      } catch (_err) {
        /* ignore parse errors, log already captured */
      }
    };

    if (typeof event.data === "string") {
      handleText(event.data);
    } else if (event.data instanceof Blob) {
      event.data.text().then(handleText).catch((err) => addLog(`blob to text failed: ${err}`, "error"));
    } else if (event.data instanceof ArrayBuffer) {
      const text = new TextDecoder().decode(event.data);
      handleText(text);
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
  fetchBars("MIN5");
  fetchFills();
}

async function fetchBars(type: string, endDate?: number) {
  if (!selectedMarketId.value) {
    addLog("no market selected, skip bars", "error");
    return;
  }
  try {
    const body = {
      tokenId: String(selectedMarketId.value),
      typeEnum: type,
      pageSize: 120,
      endDate: endDate ?? Date.now(),
      symbol: "ORIGINAL",
      isAve: false,
    };
    const res = await fetch("https://four.meme/meme-api/v1/public/bar/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    bars.value = json?.data ?? [];
    if (bars.value.length > 0) {
      lastBar.value = bars.value[bars.value.length - 1];
    }
    addLog(`bars fetched ${bars.value.length} type=${type}`, "success");
  } catch (error) {
    addLog(`bars fetch failed: ${error}`, "error");
  }
}

async function fetchFills() {
  if (!selectedMarketId.value) {
    addLog("no market selected, skip fills", "error");
    return;
  }
  try {
    const url = `https://four.meme/meme-api/v1/public/fill?tokenId=${selectedMarketId.value}&pageIndex=1&pageSize=20`;
    const res = await fetch(url);
    const json = await res.json();
    fills.value = json?.data ?? [];
    addLog(`fills fetched ${fills.value.length}`, "success");
  } catch (error) {
    addLog(`fills fetch failed: ${error}`, "error");
  }
}

function processWsPayload(payload: any) {
  // payload may be a direct ticker or wrapped in { event, data }
  if (!payload) {
    return;
  }

  const currentId = selectedMarketId.value;

  // If it is a simple ticker structure
  const directPrice = payload.price ?? payload.lastPrice ?? payload.data?.price;
  const directId = payload.tokenId ?? payload.id ?? payload.data?.tokenId;
  if (directPrice && directId && currentId && Number(directId) === Number(currentId)) {
    latestPrice.value = directPrice;
    return;
  }

  if (payload.event) {
    const event = payload.event as string;
    const data = payload.data;
    switch (event) {
      case "@TOKEN_PRICE_EVENT@0": {
        const tokenId = data?.tokenId;
        if (tokenId && currentId && Number(tokenId) === Number(currentId)) {
          const price = data?.price ?? data?.lastPrice;
          if (price) {
            latestPrice.value = price;
          }
        }
        break;
      }
      case `${currentId}@BAR_EVENT-MIN5@0`: {
        lastBar.value = data || null;
        break;
      }
      default:
        // ignore other events
        break;
    }
  }
}

watch(selectedMarketId, (val) => {
  if (val) {
    addLog(`switch market: ${val}`, "info");
    fetchLatestPrice();
    connectWs();
    fetchBars("MIN5");
    fetchFills();
  }
});

onMounted(async () => {
  addLog("mounted", "info");
  await loadConfig();
  if (selectedMarketId.value) {
    fetchLatestPrice();
    connectWs();
    fetchBars("MIN5");
    fetchFills();
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
