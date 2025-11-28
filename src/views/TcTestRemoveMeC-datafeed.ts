// TradingView Charting Library datafeed implementation for four.meme
import type {
  IBasicDataFeed,
  LibrarySymbolInfo,
  ResolutionString,
  Bar,
  HistoryCallback,
  SubscribeBarsCallback,
  ErrorCallback,
  OnReadyCallback,
  SearchSymbolsCallback,
  ResolveCallback,
} from '../../vendor/charting_library/charting_library'

interface Market {
  id: string
  tokenId: number
  symbol: string
  name: string
  address: string
}

interface BarData {
  open: string
  high: string
  low: string
  close: string
  volume: string
  tokenId: number
  type: string
  createDate: string
}

interface Config {
  apiBaseUrl: string
  markets: Market[]
}

const configurationData = {
  supported_resolutions: ['1', '5', '15', '60', '240', 'D'] as ResolutionString[],
  exchanges: [],
  symbols_types: [],
}

// map TradingView resolutions to four.meme bar types
function resolutionToBarType(resolution: string): string {
  switch (resolution) {
    case '1':
      return 'MIN1'
    case '5':
      return 'MIN5'
    case '15':
      return 'MIN15'
    case '60':
      return 'HOUR1'
    case '240':
      return 'HOUR4'
    case 'D':
    case '1D':
      return 'DAY1'
    default:
      return 'MIN5'
  }
}

export function createDatafeed(config: Config): IBasicDataFeed {
  return {
    onReady: (callback: OnReadyCallback) => {
      console.log('[datafeed] onReady called')
      setTimeout(() => callback(configurationData), 0)
    },

    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResultReadyCallback: SearchSymbolsCallback
    ) => {
      console.log('[datafeed] searchSymbols:', userInput)
      const symbols = config.markets
        .filter((m) =>
          m.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
          m.name.toLowerCase().includes(userInput.toLowerCase())
        )
        .map((m) => ({
          symbol: m.symbol,
          full_name: m.symbol,
          description: m.name,
          exchange: 'FOUR.MEME',
          ticker: m.id,
          type: 'crypto',
        }))
      onResultReadyCallback(symbols)
    },

    resolveSymbol: (
      symbolName: string,
      onSymbolResolvedCallback: ResolveCallback,
      onResolveErrorCallback: ErrorCallback
    ) => {
      console.log('[datafeed] resolveSymbol:', symbolName)
      const market = config.markets.find(
        (m) => m.symbol === symbolName || m.id === symbolName
      )
      if (!market) {
        onResolveErrorCallback('Symbol not found')
        return
      }
      const symbolInfo: LibrarySymbolInfo = {
        ticker: market.id,
        name: market.symbol,
        description: market.name,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: 'FOUR.MEME',
        minmov: 1,
        pricescale: 1000000000000,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: false,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: 'streaming',
        format: 'price',
      }
      setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0)
    },

    getBars: async (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: {
        from: number
        to: number
        firstDataRequest: boolean
        countBack?: number
      },
      onHistoryCallback: HistoryCallback,
      onErrorCallback: ErrorCallback
    ) => {
      console.log('[datafeed] getBars:', symbolInfo.ticker, resolution, periodParams)
      const market = config.markets.find((m) => m.id === symbolInfo.ticker)
      if (!market) {
        onErrorCallback('Market not found')
        return
      }
      const barType = resolutionToBarType(resolution)
      const endDate = periodParams.to * 1000
      const pageSize = periodParams.countBack || 300
      try {
        const response = await fetch(`${config.apiBaseUrl}/public/bar/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenId: market.tokenId.toString(),
            typeEnum: barType,
            pageSize: pageSize,
            endDate: endDate,
            symbol: 'ORIGINAL',
            isAve: false,
          }),
        })
        const data = await response.json()
        if (data.code !== 0 || !data.data || data.data.length === 0) {
          onHistoryCallback([], { noData: true })
          return
        }
        const bars: Bar[] = data.data
          .map((bar: BarData) => ({
            time: parseInt(bar.createDate),
            open: parseFloat(bar.open),
            high: parseFloat(bar.high),
            low: parseFloat(bar.low),
            close: parseFloat(bar.close),
            volume: parseFloat(bar.volume),
          }))
          .sort((a: Bar, b: Bar) => a.time - b.time)
        console.log('[datafeed] getBars result:', bars.length, 'bars')
        onHistoryCallback(bars, { noData: false })
      } catch (error) {
        console.error('[datafeed] getBars error:', error)
        onErrorCallback('Failed to fetch bars')
      }
    },

    subscribeBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onRealtimeCallback: SubscribeBarsCallback,
      subscriberUID: string,
      onResetCacheNeededCallback: () => void
    ) => {
      console.log('[datafeed] subscribeBars:', symbolInfo.ticker, resolution, subscriberUID)
      // realtime updates will be handled by WebSocket in the component
    },

    unsubscribeBars: (subscriberUID: string) => {
      console.log('[datafeed] unsubscribeBars:', subscriberUID)
    },
  }
}
