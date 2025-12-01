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
            {{ market.symbol }}/BNB
          </option>
        </select>
        <a
          v-if="selectedMarket"
          :href="`https://four.meme/token/${selectedMarket.address}`"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
        >
          View on four.meme →
        </a>
      </div>

      <!-- current price display -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="text-sm text-gray-400">BNB/USD Rate</div>
          <div class="mt-2 text-2xl font-bold text-yellow-500">
            {{ bnbPrice ? `$${bnbPrice}` : 'Loading...' }}
          </div>
        </div>

        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="text-sm text-gray-400">
            Token Phase
            <span v-if="tokenPhase" class="ml-1 text-xs">
              ({{ tokenPhase === 1 ? 'Bonding Curve' : 'PancakeSwap' }})
            </span>
          </div>
          <div class="mt-2 text-2xl font-bold" :class="tokenPhase === 1 ? 'text-blue-500' : 'text-green-500'">
            {{ tokenPhase ? `Phase ${tokenPhase}` : 'Loading...' }}
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

      <!-- price details -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-sm text-gray-400">Price (USD)</div>
          </div>
          <div class="text-2xl font-bold text-white">
            {{ latestPriceUsd ? `$${latestPriceUsd}` : 'Loading...' }}
          </div>
        </div>

        <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-sm text-gray-400">Price (BNB)</div>
          </div>
          <div class="text-2xl font-bold text-gray-300">
            {{ latestPriceBnb ? `${latestPriceBnb} BNB` : 'Loading...' }}
          </div>
        </div>
      </div>

      <!-- chart -->
      <div class="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h2 class="mb-4 text-xl font-semibold text-white">Price Chart (BNB)</h2>
        <div id="tv_chart_container" class="h-96"></div>
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
import { widget as TradingViewWidget } from '../../vendor/charting_library/charting_library'
import { createDatafeed } from './TcTestRemoveMeC-datafeed'
import type { IChartingLibraryWidget } from '../../vendor/charting_library/charting_library'

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
  progress?: string
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
  status?: string
  dexType?: string
}

interface DebugLog {
  time: string
  type: 'info' | 'success' | 'error'
  message: string
}

const config = ref<Config | null>(null)
const markets = ref<Market[]>([])
const selectedMarketId = ref<string>('')
const latestPriceBnb = ref<string>('') // Always in BNB
const latestPriceUsd = ref<string>('') // Always in USD
const bnbPrice = ref<string>('') // BNB/USD rate
const tokenPhase = ref<number>(0) // 1 = Bonding Curve (BNB), 2 = PancakeSwap (USD)
const tokenStatus = ref<string>('')
const tokenProgress = ref<string>('')
const wsConnected = ref(false)
const updateCount = ref(0)
const debugLogs = ref<DebugLog[]>([])

const selectedMarket = computed(() => {
  return markets.value.find(m => m.id === selectedMarketId.value)
})

let ws: WebSocket | null = null
let priceUpdateInterval: number | null = null
let tvWidget: IChartingLibraryWidget | null = null

function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const time = new Date().toLocaleTimeString()
  debugLogs.value.push({ time, type, message })
  // keep only last 100 logs
  if (debugLogs.value.length > 100) {
    debugLogs.value.shift()
  }
}

async function fetchBnbPrice() {
  if (!config.value) return

  try {
    addLog('Fetching BNB/USD price...', 'info')
    const url = `${config.value.apiBaseUrl}/public/ticker`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    })
    const data = await response.json()

    if (data.code === 0 && data.data) {
      const bnbUsdPair = data.data.find((item: any) => item.symbol === 'BNBUSDT')
      if (bnbUsdPair) {
        bnbPrice.value = parseFloat(bnbUsdPair.price).toFixed(2)
        addLog(`BNB price: $${bnbPrice.value}`, 'success')
      } else {
        addLog('BNBUSDT pair not found', 'error')
      }
    } else {
      addLog(`Ticker API error: ${data.msg || 'Unknown'}`, 'error')
    }
  } catch (error) {
    addLog(`Failed to fetch BNB price: ${error}`, 'error')
  }
}

async function loadMarketsConfig() {
  try {
    const configModule = await import('./TcTestRemoveMeC-config.json')
    config.value = configModule.default
    markets.value = config.value.markets || []
    addLog(`Loaded ${markets.value.length} markets from config`, 'success')

    // Fetch BNB price FIRST before loading token data
    await fetchBnbPrice()

    // Now set the selected market (this will trigger fetchLatestPrice via watch)
    if (markets.value.length > 0) {
      selectedMarketId.value = markets.value[0].id
    }

    // Initialize TradingView after config is loaded
    initTradingView()
  } catch (error) {
    addLog(`Failed to load markets config: ${error}`, 'error')
  }
}

function initTradingView() {
  if (!config.value || markets.value.length === 0) {
    addLog('Cannot init TradingView: config not loaded', 'error')
    return
  }
  try {
    const datafeed = createDatafeed(config.value)
    tvWidget = new TradingViewWidget({
      symbol: markets.value[0].symbol,
      datafeed: datafeed,
      interval: '5' as any,
      container: 'tv_chart_container',
      library_path: '/charting_library/',
      locale: 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      fullscreen: false,
      autosize: true,
      theme: 'dark',
    })
    addLog('TradingView widget initialized', 'success')
  } catch (error) {
    addLog(`Failed to init TradingView: ${error}`, 'error')
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
      const apiPrice = parseFloat(tokenData.tokenPrice.price)

      // Detect token phase
      tokenStatus.value = tokenData.status || ''
      tokenProgress.value = tokenData.tokenPrice.progress || '0'
      const dexType = tokenData.dexType || ''

      // Phase 1: Bonding curve (API returns BNB)
      // Phase 2: PancakeSwap mature token (API returns USD)
      if (tokenStatus.value === 'PUBLISH' && parseFloat(tokenProgress.value) === 0) {
        tokenPhase.value = 1 // New token, API returns BNB
      } else if (dexType === 'PANCAKE_SWAP') {
        tokenPhase.value = 2 // Mature token, API returns USD
      } else {
        tokenPhase.value = 1 // Default to phase 1
      }

      // Set prices based on phase
      if (!bnbPrice.value) {
        addLog('Error: BNB price not available yet', 'error')
        return
      }

      const bnbUsd = parseFloat(bnbPrice.value)
      if (tokenPhase.value === 1) {
        // Phase 1: API returns BNB
        latestPriceBnb.value = apiPrice.toFixed(18)
        latestPriceUsd.value = (apiPrice * bnbUsd).toFixed(10)
        addLog(`Phase 1: ${latestPriceBnb.value} BNB = $${latestPriceUsd.value}`, 'success')
      } else {
        // Phase 2: API returns USD
        latestPriceUsd.value = apiPrice.toFixed(10)
        latestPriceBnb.value = (apiPrice / bnbUsd).toFixed(18)
        addLog(`Phase 2: $${latestPriceUsd.value} = ${latestPriceBnb.value} BNB`, 'success')
      }

      updateCount.value++
    } else {
      addLog(`API error: ${data.msg || 'Unknown error'}`, 'error')
    }
  } catch (error) {
    addLog(`Failed to fetch price: ${error}`, 'error')
  }
}

async function decompressGzip(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip')
  const writer = ds.writable.getWriter()
  writer.write(data)
  writer.close()

  const chunks: Uint8Array[] = []
  const reader = ds.readable.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
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
      // enable binary mode (gzip compressed)
      ws?.send(JSON.stringify({ method: 'BINARY', params: 'true' }))
      addLog('Sent: BINARY=true', 'info')
      // subscribe to ticker events
      ws?.send(JSON.stringify({ method: 'SUBSCRIBE', params: '@TICKER_EVENT' }))
      addLog('Sent: SUBSCRIBE @TICKER_EVENT', 'info')
      // subscribe to specific token events
      ws?.send(JSON.stringify({ method: 'SUBSCRIBE', params: `${market.tokenId}@TOKEN_EVENT@0` }))
      addLog(`Sent: SUBSCRIBE ${market.tokenId}@TOKEN_EVENT@0`, 'info')
      // subscribe to price events
      ws?.send(JSON.stringify({ method: 'SUBSCRIBE', params: '@TOKEN_PRICE_EVENT@0' }))
      addLog('Sent: SUBSCRIBE @TOKEN_PRICE_EVENT@0', 'info')
    }
    ws.onmessage = async (event) => {
      try {
        let msg: any

        // Handle binary (gzip compressed) messages
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer()
          const decompressed = await decompressGzip(new Uint8Array(arrayBuffer))
          msg = JSON.parse(new TextDecoder().decode(decompressed))
        } else {
          // Handle text messages
          msg = JSON.parse(event.data)
        }

        // Log all received messages
        if (msg.event === '@TICKER_EVENT' && msg.data?.symbol) {
          addLog(`WS Ticker: ${msg.data.symbol} = ${msg.data.price}`, 'info')
        } else if (msg.event === '@TOKEN_PRICE_EVENT@0' && msg.data?.tokenId) {
          const isCurrentToken = msg.data.tokenId === market.tokenId
          addLog(`WS Token ${msg.data.tokenId}${isCurrentToken ? ' ★' : ''}: ${msg.data.price}`, isCurrentToken ? 'success' : 'info')
        } else if (msg.event === `${market.tokenId}@TOKEN_EVENT@0`) {
          addLog(`WS TokenEvent: ${JSON.stringify(msg.data).slice(0, 40)}`, 'info')
        } else if (msg.event) {
          addLog(`WS: ${msg.event}`, 'info')
        }

        // Handle ticker events (BNB/USD rate updates)
        if (msg.event === '@TICKER_EVENT' && msg.data?.symbol === 'BNBUSDT') {
          const newBnbPrice = parseFloat(msg.data.price)
          bnbPrice.value = newBnbPrice.toFixed(2)

          // Recalculate USD price if we have BNB price
          if (latestPriceBnb.value) {
            latestPriceUsd.value = (parseFloat(latestPriceBnb.value) * newBnbPrice).toFixed(10)
          }
        }

        // Handle price events for our token
        if (msg.event === '@TOKEN_PRICE_EVENT@0' && msg.data?.tokenId === market.tokenId) {
          const wsPrice = parseFloat(msg.data.price)
          const bnbUsd = parseFloat(bnbPrice.value || '0')

          // WS returns same unit as REST API: Phase 1 = BNB, Phase 2 = USD
          if (tokenPhase.value === 1) {
            // Phase 1: WS returns BNB
            latestPriceBnb.value = wsPrice.toFixed(18)
            if (bnbUsd > 0) {
              latestPriceUsd.value = (wsPrice * bnbUsd).toFixed(10)
            }
          } else {
            // Phase 2: WS returns USD
            latestPriceUsd.value = wsPrice.toFixed(10)
            if (bnbUsd > 0) {
              latestPriceBnb.value = (wsPrice / bnbUsd).toFixed(18)
            }
          }

          updateCount.value++
        }
      } catch (error) {
        addLog(`WS message error: ${error}`, 'error')
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
    // update TradingView chart symbol
    if (tvWidget && market) {
      tvWidget.setSymbol(market.symbol, '5' as any, () => {
        addLog(`TradingView chart updated to ${market.symbol}`, 'success')
      })
    }
  }
})

onMounted(() => {
  addLog('Component mounted', 'success')
  loadMarketsConfig()
})

onUnmounted(() => {
  disconnectWebSocket()
  if (tvWidget) {
    tvWidget.remove()
    tvWidget = null
  }
  addLog('Component unmounted', 'info')
})
</script>

<style scoped>
.test-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
