import { Ref, computed, ref, watch, onUnmounted } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useTradeStore } from '@/stores/tradeStore'
import { CHART_SHOW_ORDER_STORAGE } from '@/storages/chart'

interface OrderInfo {
  id: string
  size: bigint
  triggerPrice: bigint
  orderType: 'limit' | 'stop'
  isLong: boolean
  isOpen: boolean // true for open position orders, false for close position orders
}

interface LineStore {
  order: OrderInfo
  line: any // TradingView.IOrderLineAdapter
}

const lineStyle = {
  longColor: '#10C8A8',
  shortColor: '#FF4E59',
}

const labelStyle = {
  longColor: '#10C8A8',
  shortColor: '#FF4E59',
}

/**
 * Composition function to manage order lines on TradingView chart
 * Similar to mux-fe/src/template/Trade/PriceChart/chartLabels.ts
 */
export function useChartOrders(symbol: Ref<string | null | undefined>, widget: Ref<any>) {
  const tradeStore = useTradeStore()
  const chartViewOrders: Ref<Map<string, LineStore>> = ref(new Map())

  // Get orders for the current market
  const orders = computed<{ [id: string]: OrderInfo }>(() => {
    // Don't show orders if toggle is off
    if (!CHART_SHOW_ORDER_STORAGE.value || !symbol.value) {
      return {}
    }

    const marketOrders = tradeStore.orders.filter((order) => order.market === symbol.value)

    const result: { [id: string]: OrderInfo } = {}
    marketOrders.forEach((order) => {
      result[order.id] = {
        id: order.id,
        size: order.size,
        triggerPrice: order.triggerPrice,
        orderType: order.orderType,
        isLong: order.side === 'long',
        isOpen: true, // For now, all orders are treated as open position orders
      }
    })

    return result
  })

  function getLabelText(isOpen: boolean, orderType: 'limit' | 'stop', isLong: boolean): string {
    const openLabel = isOpen ? 'Open' : 'Close'
    const sideLabel = isLong ? 'Long' : 'Short'
    const typeLabel = orderType === 'stop' ? 'Stop' : 'Limit'
    return `${openLabel} ${sideLabel} ${typeLabel}`
  }

  function createOrderLine(id: string, order: OrderInfo) {
    if (!widget.value || !widget.value.isTvWidgetChartReady) {
      return
    }

    const isLong = order.isLong
    const isOpen = order.isOpen
    const labelText = getLabelText(order.isOpen, order.orderType, isLong)

    // Convert BigInt trigger price to number (18 decimals)
    const price = Number(order.triggerPrice) / 1e18

    // Convert BigInt size to number and format for display (18 decimals)
    const sizeNum = Number(order.size) / 1e18
    const size = sizeNum.toFixed(4)

    try {
      // For close orders, reverse the color
      let color = isLong ? labelStyle.longColor : labelStyle.shortColor
      let lineColor = isLong ? lineStyle.longColor : lineStyle.shortColor
      if (!isOpen) {
        color = isLong ? labelStyle.shortColor : labelStyle.longColor
        lineColor = isLong ? lineStyle.shortColor : lineStyle.longColor
      }

      const line = widget.value?.tvWidget
        ?.activeChart()
        ?.createOrderLine({})
        .setText(labelText)
        .setQuantity(size)
        .setPrice(price)
        .setExtendLeft(true)
        .setLineStyle(1) // Dashed line for orders (different from positions)
        .setLineWidth(0)
        .setLineLength(20)
        .setLineColor(lineColor)
        .setBodyBackgroundColor('#040818')
        .setBodyBorderColor(lineColor)
        .setQuantityTextColor(color)
        .setQuantityBackgroundColor('#040818')
        .setQuantityBorderColor(lineColor)
        .setQuantityTextColor('#FFFFFF')
        .setBodyTextColor(color)
        .setBodyFont('bold 14pt roboto')
        .setQuantityFont('normal 14pt roboto')

      if (line) {
        chartViewOrders.value.set(id, {
          line,
          order,
        })
      }
    } catch (e) {
      // Ignore error - order line creation may fail if chart is not ready
      console.warn('Failed to create order line:', e)
    }
  }

  function updateOrdersLine() {
    const needDeleteIds: string[] = []
    const needAddOrders: { [id: string]: OrderInfo } = {}
    const needUpdateOrders: { [id: string]: OrderInfo } = {}

    // Filter delete - orders that no longer exist
    chartViewOrders.value.forEach((_lineStore, id) => {
      const v = orders.value[id]
      if (!v) {
        needDeleteIds.push(id)
      }
    })

    // Filter add - new orders
    Object.keys(orders.value).forEach((id) => {
      const item = orders.value[id]
      const t = chartViewOrders.value.has(id)
      if (!t) {
        needAddOrders[id] = item
      }
    })

    // Filter update - orders that changed
    chartViewOrders.value.forEach((lineStore, id) => {
      const newData = orders.value[id]
      const oldData = lineStore.order
      if (newData && (newData.size !== oldData.size || newData.triggerPrice !== oldData.triggerPrice)) {
        needUpdateOrders[id] = newData
      }
    })

    // Process deletions
    needDeleteIds.forEach((item) => {
      try {
        chartViewOrders.value.get(item)?.line.remove()
        chartViewOrders.value.delete(item)
      } catch (e) {
        // Ignore error
        console.warn('Failed to remove order line:', e)
      }
    })

    // Process additions
    Object.keys(needAddOrders).forEach((id) => {
      const item = needAddOrders[id]
      setTimeout(() => {
        createOrderLine(id, item)
      }, 0)
    })

    // Process updates
    Object.keys(needUpdateOrders).forEach((id) => {
      try {
        chartViewOrders.value.get(id)?.line.remove()
        chartViewOrders.value.delete(id)
      } catch (e) {
        // Ignore error
      }

      const item = needUpdateOrders[id]
      setTimeout(() => {
        createOrderLine(id, item)
      }, 0)
    })
  }

  // Watch for order and widget changes with debounce
  const stopWatcher = watchDebounced(
    [orders, widget, CHART_SHOW_ORDER_STORAGE],
    () => {
      if (widget.value?.isTvWidgetChartReady) {
        // If toggle is off, clear all order lines
        if (!CHART_SHOW_ORDER_STORAGE.value) {
          clearOrdersLine()
        } else {
          updateOrdersLine()
        }
      }
    },
    { debounce: 500 },
  )

  function clearOrdersLine() {
    chartViewOrders.value.forEach((store) => {
      try {
        store.line.remove()
      } catch (e) {
        // Ignore error
      }
    })
    chartViewOrders.value.clear()
  }

  // Watch for symbol changes and clear orders
  watch(symbol, () => {
    clearOrdersLine()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    clearOrdersLine()
    stopWatcher()
  })

  return {
    orders,
    clearOrdersLine,
  }
}

