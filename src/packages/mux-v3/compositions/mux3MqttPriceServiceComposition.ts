import { Client } from 'paho-mqtt'
import {
  computed,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  Ref,
  watch,
} from 'vue'
import {
  MUX3_MQTT_SERVICE,
  MUX3_MQTT_SERVICE_PASSWORD,
  MUX3_MQTT_SERVICE_PATH,
  MUX3_MQTT_SERVICE_PORT,
  MUX3_MQTT_SERVICE_USE_SSL,
  MUX3_MQTT_SERVICE_USERNAME,
} from '../constants'

function generateClientId(): string {
  return `mux3_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
}

const clientId = generateClientId()
export const mqttClient = new Client(
  MUX3_MQTT_SERVICE,
  MUX3_MQTT_SERVICE_PORT,
  MUX3_MQTT_SERVICE_PATH,
  clientId
)

const assetPriceMap: Map<string, [string /* price */, number /* timestamp */]> = new Map()

const priceSymbolMap: Map<string, string> = new Map<string, string>([
  ['BUSD.e', 'BUSD'],
  ['USDC.e', 'USDC'],
  ['USDT.e', 'USDT'],
  ['WBTC', 'BTC'],
  ['WETH', 'ETH'],
])

function getMqttPriceSymbol(symbol: string): string {
  return priceSymbolMap.get(symbol) || symbol
}

// Track subscriptions: symbol -> Set of observer IDs
const subscribeIdsMap = new Map<string, Set<string>>()
let connecting = false

function checkHasSubscribe(): boolean {
  let count = 0
  subscribeIdsMap.forEach((value) => {
    count += value.size
  })
  return count > 0
}

function connect() {
  if (mqttClient.isConnected() || connecting) {
    return
  }
  connecting = true
  try {
    mqttClient.connect({
      timeout: 30,
      keepAliveInterval: 15,
      userName: MUX3_MQTT_SERVICE_USERNAME,
      password: MUX3_MQTT_SERVICE_PASSWORD,
      useSSL: MUX3_MQTT_SERVICE_USE_SSL,
      cleanSession: true,
      reconnect: true,
      onSuccess: function () {
        console.info('mux3 mqtt connected')
        Array.from(subscribeIdsMap.keys()).forEach((symbol) => {
          mqttClient.subscribe(`ticker.${symbol}`, { qos: 0 })
        })
        connecting = false
      },
      onFailure: function (message) {
        console.info('mux3 mqtt connect error', message.errorMessage)
        connecting = false
        setTimeout(() => {
          if (checkHasSubscribe()) {
            connect()
          }
        }, 5000)
      },
    })
  } catch (e) {
    console.error('mux3 mqtt connect error', e)
    connecting = false
    setTimeout(() => {
      if (checkHasSubscribe()) {
        connect()
      }
    }, 5000)
  }
}

function disconnect() {
  if (mqttClient.isConnected()) {
    mqttClient.disconnect()
  }
}

function reconnect() {
  if (mqttClient.isConnected()) {
    mqttClient.disconnect()
  }
  setTimeout(() => {
    connect()
  }, 1000)
}

function subscribe(symbols: string[], observerId: string) {
  const newSymbols: string[] = []
  symbols.forEach((symbol) => {
    const mqttSymbol = getMqttPriceSymbol(symbol)
    if (subscribeIdsMap.has(mqttSymbol)) {
      subscribeIdsMap.get(mqttSymbol)?.add(observerId)
    } else {
      subscribeIdsMap.set(mqttSymbol, new Set<string>([observerId]))
      newSymbols.push(mqttSymbol)
    }
  })
  if (mqttClient.isConnected()) {
    newSymbols.forEach((symbol) => {
      mqttClient.subscribe(`ticker.${symbol}`, { qos: 0 })
    })
  } else {
    connect()
  }
}

function unsubscribe(symbols: string[], observerId: string) {
  const removeSymbols: string[] = []
  symbols.forEach((symbol) => {
    const mqttSymbol = getMqttPriceSymbol(symbol)
    if (subscribeIdsMap.has(mqttSymbol)) {
      subscribeIdsMap.get(mqttSymbol)?.delete(observerId)
      if (subscribeIdsMap.get(mqttSymbol)?.size === 0) {
        removeSymbols.push(mqttSymbol)
        subscribeIdsMap.delete(mqttSymbol)
      }
    }
  })
  if (mqttClient.isConnected()) {
    removeSymbols.forEach((symbol) => {
      mqttClient.unsubscribe(`ticker.${symbol}`)
      assetPriceMap.delete(symbol)
    })
  }
}

/**
 * Composable to get real-time price for a single MUX V3 asset via MQTT
 * @param _symbol - Symbol ref (e.g., 'BTC', 'ETH')
 * @param useMqttPrice - Whether to use MQTT (default: true)
 * @param refreshInterval - How often to read from MQTT cache (default: 200ms)
 */
export function useMux3AssetPriceComposition(
  _symbol: Ref<string | null | undefined>,
  useMqttPrice = true,
  refreshInterval = 200
) {
  const priceInfo: Ref<[string | null, number | null] | null> = ref(null)
  let timer: number | undefined
  let observerId: string | null = null

  const symbol = computed(() => {
    if (!_symbol.value) return null
    return _symbol.value.toUpperCase()
  })

  const price = computed(() => {
    if (!symbol.value || !priceInfo.value || !priceInfo.value[0]) {
      return null
    }
    return parseFloat(priceInfo.value[0])
  })

  function updatePrice() {
    if (!symbol.value) {
      priceInfo.value = null
      return
    }

    const mqttSymbol = getMqttPriceSymbol(symbol.value)
    const mqttPrice = assetPriceMap.get(mqttSymbol)
    
    if (mqttPrice) {
      priceInfo.value = [mqttPrice[0], mqttPrice[1]]
    } else {
    
      if (!priceInfo.value) {
        priceInfo.value = null
      }
    }
  }

  watch(
    symbol,
    (newSymbol, oldSymbol) => {
      if (timer) {
        window.clearInterval(timer)
        timer = undefined
      }

      if (useMqttPrice) {
        if (oldSymbol && observerId) {
          unsubscribe([oldSymbol], observerId)
          observerId = null
        }

        if (newSymbol) {
          observerId = `observer_${Date.now()}_${Math.random()}`
          
          updatePrice()

          timer = window.setInterval(() => {
            updatePrice()
          }, refreshInterval)

          subscribe([newSymbol], observerId)
        } else {
          priceInfo.value = null
        }
      }
    },
    { immediate: true }
  )

  const cleanup = () => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
    if (useMqttPrice && symbol.value && observerId) {
      unsubscribe([symbol.value], observerId)
      observerId = null
    }
  }

  onBeforeUnmount(cleanup)
  onDeactivated(cleanup)

  return {
    price,
    priceInfo,
  }
}

let initMqtt = false

export function useMux3MqttSingletonComposition() {
  if (initMqtt) {
    return
  }

  mqttClient.onMessageArrived = (message) => {
    try {
      const payload = JSON.parse(message.payloadString)
      const symbol = payload.s?.toUpperCase()
      if (payload.e === 'ticker' && symbol && payload.p && payload.t) {
        assetPriceMap.set(symbol, [String(payload.p), Number(payload.t)])
      }
    } catch (e) {
      console.warn('mux3 mqtt message error', e)
    }
  }

  mqttClient.onConnectionLost = (error) => {
    console.error('mux3 mqtt disconnected', error.errorMessage)
    if (checkHasSubscribe()) {
      setTimeout(() => {
        reconnect()
      }, 3000)
    }
  }

  function visibilitychangeCallback() {
    const isVisible = window?.document?.visibilityState === 'visible'
    if (isVisible) {
      if (!mqttClient.isConnected() && !connecting && checkHasSubscribe()) {
        connect()
      }
    } else {
      // disconnect()
    }
  }

  onMounted(() => {
    window.addEventListener('visibilitychange', visibilitychangeCallback, false)
    window.addEventListener('online', reconnect, false)
    window.addEventListener('offline', disconnect, false)
    

    if (checkHasSubscribe()) {
      connect()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('visibilitychange', visibilitychangeCallback, false)
    window.removeEventListener('online', reconnect, false)
    window.removeEventListener('offline', disconnect, false)
  })

  initMqtt = true
}

