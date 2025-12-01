import { ref, computed, watch, type Ref } from 'vue'
import { tryOnScopeDispose } from '@vueuse/core'
import { FOUR_MEME_WS_URL } from '../constants'
import type { FourMemeMarket } from '../constants'
import { useBnbUsdPrice } from '@/packages/gains'

export interface FourMemePriceUpdate {
  tokenId: number
  price: string
  symbol: string
  increase: string
  marketCap: string
  trading: string
  dayIncrease: string
  dayTrading: string
}

export interface FourMemeBarUpdate {
  tokenId: number
  bar: {
    open: string
    high: string
    low: string
    close: string
    volume: string
    createDate: string
  }
}

const priceCache = new Map<number, FourMemePriceUpdate>()
const barCache = new Map<number, FourMemeBarUpdate>()

let wsInstance: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let activeSubscriptions = new Set<number>()
let activeUsers = 0
const RECONNECT_DELAY = 3000
const HEARTBEAT_INTERVAL = 30000

function initWebSocket(): WebSocket | null {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    return wsInstance
  }

  try {
    wsInstance = new WebSocket(FOUR_MEME_WS_URL)

    wsInstance.onopen = () => {
      wsInstance?.send(JSON.stringify({ method: 'BINARY', params: 'false' }))
      wsInstance?.send(JSON.stringify({ method: 'SUBSCRIBE', params: '@TOKEN_PRICE_EVENT@0' }))
      wsInstance?.send(JSON.stringify({ method: 'SUBSCRIBE', params: '@TICKER_EVENT' }))
      
      activeSubscriptions.forEach((tokenId) => {
        wsInstance?.send(JSON.stringify({ method: 'SUBSCRIBE', params: `${tokenId}@TOKEN_EVENT@0` }))
        wsInstance?.send(JSON.stringify({ method: 'SUBSCRIBE', params: `${tokenId}@BAR_EVENT-MIN5@0` }))
      })

      startHeartbeat()
    }

    wsInstance.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string)

        if (message.event === '@TOKEN_PRICE_EVENT@0' && message.data) {
          const update: FourMemePriceUpdate = message.data
          priceCache.set(update.tokenId, update)
        } else if (message.event?.includes('@BAR_EVENT') && message.data) {
          const update: FourMemeBarUpdate = {
            tokenId: message.data.tokenId,
            bar: message.data,
          }
          barCache.set(update.tokenId, update)
        }
      } catch (error) {
        console.error('Four.meme WebSocket: Failed to parse message:', error)
      }
    }

    wsInstance.onerror = (error) => {
      console.error('Four.meme WebSocket error:', error)
    }

    wsInstance.onclose = () => {
      stopHeartbeat()
      wsInstance = null

      if (activeUsers > 0) {
        reconnectTimer = setTimeout(() => {
          initWebSocket()
        }, RECONNECT_DELAY)
      }
    }

    return wsInstance
  } catch (error) {
    console.error('Four.meme WebSocket: Failed to connect:', error)
    return null
  }
}

function startHeartbeat() {
  stopHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      // Send a ping or keep-alive if needed
      // Four.meme doesn't require explicit heartbeat, but we can check connection
    }
  }, HEARTBEAT_INTERVAL)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function closeWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  stopHeartbeat()
  if (wsInstance) {
    wsInstance.close()
    wsInstance = null
  }
  activeSubscriptions.clear()
  priceCache.clear()
  barCache.clear()
}

export function useFourMemeWebSocketPrice(
  market: Ref<FourMemeMarket | null | undefined>,
  refreshInterval = 200
) {
  const currentPrice = ref<number | null>(null)
  const priceUpdate = ref<FourMemePriceUpdate | null>(null)
  const isConnected = ref(false)
  let localTimer: ReturnType<typeof setInterval> | null = null
  const { price: bnbUsdPrice } = useBnbUsdPrice(refreshInterval)

  activeUsers++
  const ws = initWebSocket()

  if (ws) {
    isConnected.value = ws.readyState === WebSocket.OPEN
  }

  function updateLocalPrice() {
    const m = market.value
    if (!m) {
      currentPrice.value = null
      priceUpdate.value = null
      return
    }

    const update = priceCache.get(m.tokenId)
    const bnbPrice = bnbUsdPrice.value

    if (!bnbPrice || bnbPrice <= 0) {
      currentPrice.value = null
      priceUpdate.value = null
      return
    }

    if (update && bnbPrice && bnbPrice > 0) {
      const priceInBnb = parseFloat(update.price)
      if (!isNaN(priceInBnb) && priceInBnb > 0) {
        const priceInUsd = priceInBnb * bnbPrice
        currentPrice.value = priceInUsd
        priceUpdate.value = {
          ...update,
          price: priceInUsd.toString(),
        }
      }
    }
  }

  function subscribeToToken() {
    const m = market.value
    if (!m || !ws || ws.readyState !== WebSocket.OPEN) return

    if (!activeSubscriptions.has(m.tokenId)) {
      ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: `${m.tokenId}@TOKEN_EVENT@0` }))
      ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: `${m.tokenId}@BAR_EVENT-MIN5@0` }))
      activeSubscriptions.add(m.tokenId)
    }
  }

  localTimer = setInterval(() => {
    updateLocalPrice()
  }, refreshInterval)

  if (market.value) {
    subscribeToToken()
  }

  updateLocalPrice()

  const unwatch = watch(market, (newMarket) => {
    if (newMarket) {
      subscribeToToken()
      updateLocalPrice()
    }
  })

  tryOnScopeDispose(() => {
    if (localTimer) {
      clearInterval(localTimer)
    }
    unwatch()

    activeUsers--

    if (activeUsers <= 0) {
      setTimeout(() => {
        if (activeUsers <= 0) {
          closeWebSocket()
        }
      }, 1000)
    }
  })

  return {
    price: computed(() => currentPrice.value),
    priceUpdate: computed(() => priceUpdate.value),
    isConnected: computed(() => {
      if (ws) {
        isConnected.value = ws.readyState === WebSocket.OPEN
      }
      return isConnected.value
    }),
    subscribeToToken,
  }
}

export function useFourMemeWebSocketBar(market: Ref<FourMemeMarket | null | undefined>) {
  const barUpdate = ref<FourMemeBarUpdate | null>(null)

  function updateBar() {
    const m = market.value
    if (!m) {
      barUpdate.value = null
      return
    }

    const update = barCache.get(m.tokenId)
    if (update) {
      barUpdate.value = update
    }
  }

  function subscribeToBars() {
    const m = market.value
    if (!m) return

    activeUsers++
    const ws = initWebSocket()

    if (ws && ws.readyState === WebSocket.OPEN && !activeSubscriptions.has(m.tokenId)) {
      ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: `${m.tokenId}@BAR_EVENT-MIN5@0` }))
      activeSubscriptions.add(m.tokenId)
    }

    // Update bar periodically
    const interval = setInterval(() => {
      updateBar()
    }, 1000)

    tryOnScopeDispose(() => {
      clearInterval(interval)
      activeUsers--
      if (activeUsers <= 0) {
        setTimeout(() => {
          if (activeUsers <= 0) {
            closeWebSocket()
          }
        }, 1000)
      }
    })
  }

  if (market.value) {
    subscribeToBars()
    updateBar()
  }

  return {
    barUpdate: computed(() => barUpdate.value),
    subscribeToBars,
  }
}
