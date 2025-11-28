import { ref, computed, Ref } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { tryOnScopeDispose } from '@vueuse/core'
import { GAINS_PRICE_WS_SERVICE } from '../constants'

export const pairPricesInfo = new Map<number, number | null>()

let wsInstance: ReturnType<typeof useWebSocket> | null = null
let activeUsers = 0

function initWebSocket() {
  if (wsInstance) return wsInstance
  
  wsInstance = useWebSocket(GAINS_PRICE_WS_SERVICE, {
    autoReconnect: {
      delay: 3000,
      retries: () => true, // Infinite retries
    },
    heartbeat: {
      interval: 15000,
      pongTimeout: 5000,
    },
    onError: (ws, event) => {
      console.error('GTrade WebSocket error:', event)
    },
    onMessage: (ws, event: MessageEvent) => {
      try {
        const data = event.data
        if (!data) return
        
        const info = JSON.parse(data as string)

        if (!Array.isArray(info) || info.length % 2 !== 0) {
          return
        }

        for (let i = 0; i < info.length; i += 2) {
          const pairIndex = info[i]
          const price = info[i + 1]
          
          if (typeof pairIndex === 'number' && (typeof price === 'number' || price === null)) {
            pairPricesInfo.set(pairIndex, price)
          }
        }
      } catch (error) {
        console.error('GTrade WebSocket: Failed to parse message:', error)
      }
    },
  })
  
  return wsInstance
}

function closeWebSocket() {
  if (wsInstance) {
    wsInstance.close()
    wsInstance = null
    pairPricesInfo.clear()
  }
}

/**
 * Composable to get real-time price for a specific GTrade pair
 * 
 * @param pairIndex - GTrade pair index (0 for BTC/USD, 1 for ETH/USD, etc.)
 * @param refreshInterval - How often to read from WebSocket cache (default 200ms)
 * @returns Current price for the pair
 */
export function useGainsWebSocketPrice(
  pairIndex: Ref<number | null | undefined>,
  refreshInterval = 200
) {
  const currentPrice = ref<number | null>(null)
  let localTimer: ReturnType<typeof setInterval> | null = null
  
  // Increment active users and ensure WebSocket is connected
  activeUsers++
  const ws = initWebSocket()

  function updateLocalPrice() {
    const index = pairIndex.value
    if (index === null || index === undefined) {
      currentPrice.value = null
      return
    }
    
    const price = pairPricesInfo.get(index)
    if (price !== undefined && price !== null && price > 0) {
      currentPrice.value = price
    }
  }
  
  // Start local timer to read from WebSocket cache
  localTimer = setInterval(() => {
    updateLocalPrice()
  }, refreshInterval)

  updateLocalPrice()

  tryOnScopeDispose(() => {
    if (localTimer) {
      clearInterval(localTimer)
    }
    
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
    status: computed(() => ws.status.value),
    isConnected: computed(() => ws.status.value === 'OPEN')
  }
}

