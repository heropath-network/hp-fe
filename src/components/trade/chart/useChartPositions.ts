import { Ref, computed, ref, watch, onUnmounted } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useTradeStore } from '@/stores/tradeStore'
import { CHART_SHOW_POSITION_STORAGE } from '@/storages/chart'

interface PositionInfo {
  id: string
  size: bigint
  entryPrice: bigint
  isLong: boolean
}

interface LineStore {
  info: PositionInfo
  line: any // TradingView.IPositionLineAdapter
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
 * Composition function to manage position lines on TradingView chart
 * Similar to mux-fe/src/template/Trade/PriceChart/chartLabels.ts
 */
export function useChartPositions(symbol: Ref<string | null | undefined>, widget: Ref<any>) {
  const tradeStore = useTradeStore()
  const chartViewPositions: Ref<Map<string, LineStore>> = ref(new Map())

  // Get positions for the current market
  const positions = computed<{ [id: string]: PositionInfo }>(() => {
    // Don't show positions if toggle is off
    if (!CHART_SHOW_POSITION_STORAGE.value || !symbol.value) {
      return {}
    }

    const marketPositions = tradeStore.positions.filter((pos) => pos.market === symbol.value && pos.size > BigInt(0))

    const result: { [id: string]: PositionInfo } = {}
    marketPositions.forEach((pos) => {
      result[pos.id] = {
        id: pos.id,
        size: pos.size,
        entryPrice: pos.entryPrice,
        isLong: pos.side === 'long',
      }
    })

    return result
  })

  function createPositionLine(id: string, info: PositionInfo) {
    if (!widget.value || !widget.value.isTvWidgetChartReady) {
      return
    }

    const isLong = info.isLong
    // Convert BigInt entry price to number (18 decimals)
    const price = Number(info.entryPrice) / 1e18
    const color = isLong ? labelStyle.longColor : labelStyle.shortColor
    const lineColor = isLong ? lineStyle.longColor : lineStyle.shortColor

    // Convert BigInt size to number and format for display (18 decimals)
    const sizeNum = Number(info.size) / 1e18
    const size = sizeNum.toFixed(4)

    try {
      const line = widget.value?.tvWidget
        ?.chart()
        ?.createPositionLine({})
        .setText(isLong ? 'Long' : 'Short')
        .setQuantity(size)
        .setPrice(price)
        .setExtendLeft(true)
        .setLineStyle(0)
        .setLineWidth(0)
        .setLineLength(18)
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
        chartViewPositions.value.set(id, {
          line,
          info,
        })
      }
    } catch (e) {
      // Ignore error - position line creation may fail if chart is not ready
      console.warn('Failed to create position line:', e)
    }
  }

  function updatePositionsLine() {
    const needDeleteIds: string[] = []
    const needAddPositions: { [id: string]: PositionInfo } = {}
    const needUpdatePositions: { [id: string]: PositionInfo } = {}

    // Filter delete - positions that no longer exist
    chartViewPositions.value.forEach((_lineStore, id) => {
      const v = positions.value[id]
      if (!v) {
        needDeleteIds.push(id)
      }
    })

    // Filter add - new positions
    Object.keys(positions.value).forEach((id) => {
      const item = positions.value[id]
      const t = chartViewPositions.value.has(id)
      if (!t) {
        needAddPositions[id] = item
      }
    })

    // Filter update - positions that changed
    chartViewPositions.value.forEach((lineStore, id) => {
      const newData = positions.value[id]
      const oldData = lineStore.info
      if (newData && (newData.size !== oldData.size || newData.entryPrice !== oldData.entryPrice)) {
        needUpdatePositions[id] = newData
      }
    })

    // Process deletions
    needDeleteIds.forEach((item) => {
      try {
        chartViewPositions.value.get(item)?.line.remove()
        chartViewPositions.value.delete(item)
      } catch (e) {
        // Ignore error
        console.warn('Failed to remove position line:', e)
      }
    })

    // Process additions
    Object.keys(needAddPositions).forEach((id) => {
      const item = needAddPositions[id]
      setTimeout(() => {
        createPositionLine(id, item)
      }, 0)
    })

    // Process updates
    Object.keys(needUpdatePositions).forEach((id) => {
      try {
        chartViewPositions.value.get(id)?.line.remove()
        chartViewPositions.value.delete(id)
      } catch (e) {
        // Ignore error
      }

      const item = needUpdatePositions[id]
      setTimeout(() => {
        createPositionLine(id, item)
      }, 0)
    })
  }

  // Watch for position and widget changes with debounce
  const stopWatcher = watchDebounced(
    [positions, widget, CHART_SHOW_POSITION_STORAGE],
    () => {
      if (widget.value?.isTvWidgetChartReady) {
        // If toggle is off, clear all position lines
        if (!CHART_SHOW_POSITION_STORAGE.value) {
          clearPositionsLine()
        } else {
          updatePositionsLine()
        }
      }
    },
    { debounce: 500 },
  )

  function clearPositionsLine() {
    chartViewPositions.value.forEach((store) => {
      try {
        store.line.remove()
      } catch (e) {
        // Ignore error
      }
    })
    chartViewPositions.value.clear()
  }

  // Watch for symbol changes and clear positions
  watch(symbol, () => {
    clearPositionsLine()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    clearPositionsLine()
    stopWatcher()
  })

  return {
    positions,
    clearPositionsLine,
  }
}

