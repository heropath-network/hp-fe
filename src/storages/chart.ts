import { useLocalStorage } from '@vueuse/core'

export const CHART_SHOW_POSITION_STORAGE = useLocalStorage('chart.show.positions', true)

export const CHART_SHOW_ORDER_STORAGE = useLocalStorage('chart.show.orders', true)

