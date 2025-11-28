<template>
  <div class="test-page min-h-screen bg-gray-950 p-6">
    <div class="mx-auto max-w-7xl">
      <h1 class="mb-6 text-3xl font-bold text-white">Four.meme Market Test</h1>

      <!-- market selector -->
      <div class="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
        <label class="mb-2 block text-sm font-medium text-gray-400">Select Market</label>
        <select
          v-model="selectedMarketId"
          class="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option v-for="market in markets" :key="market.id" :value="market.id">
            {{ market.symbol }} - {{ market.name }}
          </option>
        </select>
      </div>

      <!-- current price display -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="text-sm text-gray-400">Latest Price</div>
          <div class="mt-2 text-2xl font-bold text-white">
            {{ latestPrice ? `$${latestPrice}` : 'Loading...' }}
          </div>
        </div>

        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="text-sm text-gray-400">WebSocket Status</div>
          <div class="mt-2 text-2xl font-bold" :class="wsConnected ? 'text-green-500' : 'text-red-500'">
            {{ wsConnected ? 'Connected' : 'Disconnected' }}
          </div>
        </div>

        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="text-sm text-gray-400">Updates Received</div>
          <div class="mt-2 text-2xl font-bold text-white">
            {{ updateCount }}
          </div>
        </div>
      </div>

      <!-- chart placeholder -->
      <div class="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h2 class="mb-4 text-xl font-semibold text-white">Price Chart (TradingView)</h2>
        <div class="h-96 rounded bg-gray-800 flex items-center justify-center text-gray-500">
          Chart will be implemented here
        </div>
      </div>

      <!-- debug log -->
      <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h2 class="mb-4 text-xl font-semibold text-white">Debug Log</h2>
        <div class="h-64 overflow-y-auto rounded bg-gray-800 p-3 font-mono text-xs text-gray-300">
          <div v-for="(log, idx) in debugLogs" :key="idx" class="mb-1">
            <span class="text-gray-500">{{ log.time }}</span>
            <span :class="log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : 'text-blue-500'">
              {{ log.message }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Market {
  id: string
  tokenId: number
  symbol: string
  name: string
  address: string
}

interface Config {
  apiBaseUrl: string
  network: string
  listedPancake: boolean
  markets: Market[]
}

interface WsMessage {
  event: string
  data: {
    tokenId: number
    price: string
    symbol: string
    increase: string
    marketCap: string
    trading: string
    dayIncrease: string
    dayTrading: string
  }
}

interface TokenPrice {
  price: string
  maxPrice: string
  increase: string
  marketCap: string
}

interface TokenData {
  id: string
  address: string
  symbol: string
  name: string
  tokenPrice: TokenPrice
  trading: string
  dayIncrease: string
  tradingUsd: string
}

interface DebugLog {
  time: string
  type: 'info' | 'success' | 'error'
  message: string
}

const config = ref<Config | null>(null)
const markets = ref<Market[]>([])
const selectedMarketId = ref<string>('')
const latestPrice = ref<string>('')
const wsConnected = ref(false)
const updateCount = ref(0)
const debugLogs = ref<DebugLog[]>([])

let ws: WebSocket | null = null
let priceUpdateInterval: number | null = null

function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const time = new Date().toLocaleTimeString()
  debugLogs.value.push({ time, type, message })
  // keep only last 100 logs
  if (debugLogs.value.length > 100) {
    debugLogs.value.shift()
  }
}

async function loadMarketsConfig() {
  try {
    const configModule = await import('./TcTestRemoveMeC-config.json')
    config.value = configModule.default
    markets.value = config.value.markets || []
    if (markets.value.length > 0) {
      selectedMarketId.value = markets.value[0].id
    }
    addLog(`Loaded ${markets.value.length} markets from config`, 'success')
  } catch (error) {
    addLog(`Failed to load markets config: ${error}`, 'error')
  }
}

async function fetchLatestPrice() {
  if (!config.value || !selectedMarketId.value) {
    addLog('Config or market not selected', 'error')
    return
  }
  const market = markets.value.find(m => m.id === selectedMarketId.value)
  if (!market) {
    addLog('Market not found', 'error')
    return
  }
  try {
    addLog(`Fetching price for ${market.symbol} (${market.address})...`, 'info')
    const url = `${config.value.apiBaseUrl}/private/token/get?address=${market.address}`
    const response = await fetch(url)
    const data = await response.json()
    if (data.code === 0 && data.data) {
      const tokenData: TokenData = data.data
      latestPrice.value = parseFloat(tokenData.tokenPrice.price).toFixed(10)
      addLog(`Price updated: $${latestPrice.value}`, 'success')
      updateCount.value++
    } else {
      addLog(`API error: ${data.msg || 'Unknown error'}`, 'error')
    }
  } catch (error) {
    addLog(`Failed to fetch price: ${error}`, 'error')
  }
}

function connectWebSocket() {
  disconnectWebSocket()
  const market = markets.value.find(m => m.id === selectedMarketId.value)
  if (!market) {
    addLog('Market not found', 'error')
    return
  }
  try {
    addLog('Connecting to wss://ws.four.meme/ws...', 'info')
    ws = new WebSocket('wss://ws.four.meme/ws')
    ws.onopen = () => {
      addLog('WebSocket connected', 'success')
      wsConnected.value = true
      // disable binary mode
      ws?.send(JSON.stringify({ method: 'BINARY', params: 'false' }))
      addLog('Sent: BINARY=false', 'info')
      // subscribe to price events
      ws?.send(JSON.stringify({ method: 'SUBSCRIBE', params: '@TOKEN_PRICE_EVENT@0' }))
      addLog('Sent: SUBSCRIBE @TOKEN_PRICE_EVENT@0', 'info')
      // subscribe to ticker events
      ws?.send(JSON.stringify({ method: 'SUBSCRIBE', params: '@TICKER_EVENT' }))
      addLog('Sent: SUBSCRIBE @TICKER_EVENT', 'info')
    }
    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data)
        // only log price events for our token, filter out noise
        if (msg.event === '@TOKEN_PRICE_EVENT@0' && msg.data?.tokenId === market.tokenId) {
          const price = parseFloat(msg.data.price).toFixed(10)
          latestPrice.value = price
          addLog(`WS price update: $${price} (${msg.data.dayIncrease > '0' ? '+' : ''}${(parseFloat(msg.data.dayIncrease) * 100).toFixed(2)}%)`, 'success')
          updateCount.value++
        }
      } catch (error) {
        addLog(`WS message parse error: ${error}`, 'error')
      }
    }
    ws.onerror = (error) => {
      addLog(`WebSocket error: ${error}`, 'error')
      wsConnected.value = false
    }
    ws.onclose = () => {
      addLog('WebSocket closed', 'info')
      wsConnected.value = false
    }
  } catch (error) {
    addLog(`Failed to connect WebSocket: ${error}`, 'error')
  }
}

function disconnectWebSocket() {
  if (ws) {
    ws.close()
    ws = null
    wsConnected.value = false
    addLog('WebSocket disconnected', 'info')
  }
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
    priceUpdateInterval = null
  }
}

watch(selectedMarketId, (newId) => {
  if (newId) {
    const market = markets.value.find(m => m.id === newId)
    addLog(`Market changed to: ${market?.symbol}`, 'info')
    disconnectWebSocket()
    fetchLatestPrice()
    connectWebSocket()
  }
})

onMounted(() => {
  addLog('Component mounted', 'success')
  loadMarketsConfig()
})

onUnmounted(() => {
  disconnectWebSocket()
  addLog('Component unmounted', 'info')
})
</script>

<style scoped>
.test-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
