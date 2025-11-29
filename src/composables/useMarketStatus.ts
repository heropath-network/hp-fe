import { computed, ref, onMounted, onUnmounted } from 'vue'
import { isForexOpen, isStocksOpen, isMarketClosed } from '@/utils/marketStatus'

export function useMarketStatus() {
  const currentTime = ref(new Date())
  let updateInterval: ReturnType<typeof setInterval> | null = null

  const isForexMarketOpen = computed(() => isForexOpen(currentTime.value))
  const isStocksMarketOpen = computed(() => isStocksOpen(currentTime.value))
  
  const forexClosed = computed(() => !isForexMarketOpen.value)
  const stocksClosed = computed(() => !isStocksMarketOpen.value)

  function checkMarketClosed(market: string): boolean {
    return isMarketClosed(market, currentTime.value)
  }

  function updateTime() {
    currentTime.value = new Date()
  }

  onMounted(() => {
    updateTime()
    updateInterval = setInterval(updateTime, 60 * 1000)
  })

  onUnmounted(() => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  })

  return {
    isForexMarketOpen,
    isStocksMarketOpen,
    forexClosed,
    stocksClosed,
    checkMarketClosed,
  }
}

