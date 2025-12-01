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
let pendingSubscriptions = new Set<number>()
let activeUsers = 0
let isClosing = false
let onOpenCallbacks: Array<() => void> = []
const RECONNECT_DELAY = 3000
const HEARTBEAT_INTERVAL = 30000

function safeSend(ws: WebSocket | null, message: string): boolean {
  if (!ws || isClosing || ws.readyState !== WebSocket.OPEN) {
    return false
  }
  try {
    ws.send(message)
    return true
  } catch (error) {
    console.error('Four.meme WebSocket: Failed to send message:', error)
    return false
  }
}

function subscribeToTokenId(tokenId: number): boolean {
  if (!wsInstance || isClosing || wsInstance.readyState !== WebSocket.OPEN) {
    pendingSubscriptions.add(tokenId)
    return false
  }

  if (activeSubscriptions.has(tokenId)) {
    return true
  }

  const subscribed1 = safeSend(wsInstance, JSON.stringify({ method: 'SUBSCRIBE', params: `${tokenId}@TOKEN_EVENT@0` }))
  const subscribed2 = safeSend(
    wsInstance,
    JSON.stringify({ method: 'SUBSCRIBE', params: `${tokenId}@BAR_EVENT-MIN5@0` }),
  )

  if (subscribed1 && subscribed2) {
    activeSubscriptions.add(tokenId)
    pendingSubscriptions.delete(tokenId)
    return true
  }

  pendingSubscriptions.add(tokenId)
  return false
}

function initWebSocket(): WebSocket | null {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    return wsInstance
  }

  // Don't create new connection if we're in the process of closing
  if (isClosing) {
    return null
  }

  try {
    isClosing = false
    wsInstance = new WebSocket(FOUR_MEME_WS_URL)

    wsInstance.onopen = () => {
      safeSend(wsInstance, JSON.stringify({ method: 'BINARY', params: 'false' }))
      safeSend(wsInstance, JSON.stringify({ method: 'SUBSCRIBE', params: '@TOKEN_PRICE_EVENT@0' }))
      safeSend(wsInstance, JSON.stringify({ method: 'SUBSCRIBE', params: '@TICKER_EVENT' }))

      activeSubscriptions.forEach((tokenId) => {
        subscribeToTokenId(tokenId)
      })

      pendingSubscriptions.forEach((tokenId) => {
        subscribeToTokenId(tokenId)
      })

      onOpenCallbacks.forEach((callback) => {
        try {
          callback()
        } catch (error) {
          console.error('Four.meme WebSocket: Error in onOpen callback:', error)
        }
      })

      startHeartbeat()
    }

    wsInstance.onmessage = (event: MessageEvent) => {
      if (!wsInstance || isClosing || wsInstance.readyState !== WebSocket.OPEN) {
        return
      }

      try {
        const message = JSON.parse(event.data as string)

        if (message.event === '@TOKEN_PRICE_EVENT@0' && message.data) {
          const update: FourMemePriceUpdate = message.data
          priceCache.set(update.tokenId, update)
          console.log('Four.meme: price update', update.tokenId, update.price)
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
      const wasClosing = isClosing
      wsInstance = null
      isClosing = false

      if (!wasClosing && activeUsers > 0) {
        reconnectTimer = setTimeout(() => {
          initWebSocket()
        }, RECONNECT_DELAY)
      }
    }

    return wsInstance
  } catch (error) {
    console.error('Four.meme WebSocket: Failed to connect:', error)
    isClosing = false
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
  isClosing = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  stopHeartbeat()
  if (wsInstance) {
    wsInstance.onmessage = null
    wsInstance.onerror = null
    wsInstance.onclose = null
    if (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING) {
      wsInstance.close()
    }
    wsInstance = null
  }
  activeSubscriptions.clear()
  pendingSubscriptions.clear()
  onOpenCallbacks = []
  priceCache.clear()
  barCache.clear()
  isClosing = false
}

export function useFourMemeWebSocketPrice(market: Ref<FourMemeMarket | null | undefined>, refreshInterval = 200) {
  const currentPrice = ref<number | null>(null)
  const priceUpdate = ref<FourMemePriceUpdate | null>(null)
  const isConnected = ref(false)
  let localTimer: ReturnType<typeof setInterval> | null = null
  const { price: bnbUsdPrice } = useBnbUsdPrice(refreshInterval)

  activeUsers++
  const ws = initWebSocket()

  if (ws) {
    isConnected.value = ws.readyState === WebSocket.OPEN

    if (ws.readyState === WebSocket.CONNECTING) {
      const checkConnection = () => {
        if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
          isConnected.value = true
        }
      }
      onOpenCallbacks.push(checkConnection)
    }
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
    if (!m) return

    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      subscribeToTokenId(m.tokenId)
    } else {
      pendingSubscriptions.add(m.tokenId)

      if (wsInstance && wsInstance.readyState === WebSocket.CONNECTING) {
        return
      }

      if (!wsInstance) {
        initWebSocket()
      }
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
      if (wsInstance) {
        isConnected.value = wsInstance.readyState === WebSocket.OPEN
      }
      return isConnected.value
    }),
    subscribeToToken,
  }
}

export function useFourMemeWebSocketBar(market: Ref<FourMemeMarket | null | undefined>) {
  const barUpdate = ref<FourMemeBarUpdate | null>(null)
  let localInterval: ReturnType<typeof setInterval> | null = null

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

    subscribeToTokenId(m.tokenId)
  }

  activeUsers++
  initWebSocket()

  if (market.value) {
    subscribeToBars()
    updateBar()
  }

  localInterval = setInterval(() => {
    updateBar()
  }, 1000)

  const unwatch = watch(market, (newMarket) => {
    if (newMarket) {
      subscribeToBars()
      updateBar()
    }
  })

  tryOnScopeDispose(() => {
    if (localInterval) {
      clearInterval(localInterval)
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
    barUpdate: computed(() => barUpdate.value),
    subscribeToBars,
  }
}
