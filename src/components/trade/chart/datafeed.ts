import { getProjectSupportedResolutions } from './config'

export default class Datafeed implements TradingView.IDatafeedChartApi {
  private realtimeCallbackMap: Map<string, TradingView.SubscribeBarsCallback> = new Map()
  configuration: Object
  onBeginFetch: Function | null
  decimals: number

  getOnRealtimeCallback(chartSymbol: string) {
    return this.realtimeCallbackMap.get(chartSymbol) ?? null
  }

  constructor(decimals: number) {
    this.decimals = decimals
    this.configuration = {
      supports_search: false,
      supports_group_request: false,
      exchanges: [{ value: 'Default', name: 'Default', desc: 'Default' }],
      symbols_types: [{ name: 'All types', value: '' }],
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: false,
      supported_resolutions: ['1', '3', '5', '15', '30', '60', '240', '1D', '1W'],
    }

    this.onBeginFetch = null
  }

  onReady(callback: Function) {
    setTimeout(() => callback(this.configuration), 0)
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: TradingView.SearchSymbolsCallback
  ) {
    onResultReadyCallback([])
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: TradingView.ResolveCallback,
    onResolveErrorCallback: TradingView.ErrorCallback
  ) {
    const symbolStub: TradingView.LibrarySymbolInfo = {
      description: '',
      exchange: '',
      full_name: '',
      listed_exchange: '',
      name: symbolName,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      ticker: symbolName,
      minmov: 1,
      // Set pricescale to 1 for whole numbers (no decimals, rounded)
      // This will display prices like 60,001 instead of 60,000.56
      pricescale: 1,
      has_seconds: false,
      has_intraday: true,
      intraday_multipliers: ['1', '3', '5', '15', '30', '60', '240'],
      has_daily: true,
      has_weekly_and_monthly: true,
      has_empty_bars: false,
      visible_plots_set: 'ohlc',
      supported_resolutions: getProjectSupportedResolutions(),
      volume_precision: 8,
      data_status: 'streaming',
      format: 'price',
    }

    window.setTimeout(() => onSymbolResolvedCallback(symbolStub))
  }

  getBars(
    symbolInfo: TradingView.LibrarySymbolInfo,
    resolution: TradingView.ResolutionString,
    periodParams: TradingView.PeriodParams,
    onResult: TradingView.HistoryCallback,
    onError: TradingView.ErrorCallback
  ) {
    if (symbolInfo.ticker && symbolInfo.ticker.startsWith('Default')) {
      onResult([], { noData: true })
      return
    }
    
    if (this.onBeginFetch) {
      const resolutionMinutes = this.convertResolutionToMinutes(resolution)
      
      // TradingView provides timestamps in seconds
      // Pass them directly to onBeginFetch
      this.onBeginFetch(
        symbolInfo,
        resolutionMinutes,
        Math.floor(periodParams.from),
        Math.ceil(periodParams.to),
        periodParams.firstDataRequest,
        onResult,
        onError
      )
    }
  }

  convertResolutionToMinutes(resolution: string) {
    let minutes = 1
    try {
      const arr = resolution.match(/(\d*)(.*)/) || []
      if (arr[1]) {
        minutes = parseInt(arr[1])
      }
      if (arr[2] === 'H') {
        minutes *= 60
      } else if (arr[2] === 'D') {
        minutes *= 60 * 24
      } else if (arr[2] === 'W') {
        minutes *= 60 * 24 * 7
      } else if (arr[2] === 'M') {
        minutes *= 60 * 24 * 30
      }
    } catch (e) {
      minutes = 5
    }
    return minutes
  }

  subscribeBars(
    symbolInfo: TradingView.LibrarySymbolInfo,
    resolution: TradingView.ResolutionString,
    onRealtimeCallback: TradingView.SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: Function
  ) {
    const chartSymbol = symbolInfo.ticker?.trim()
    if (!!chartSymbol) {
      this.realtimeCallbackMap.set(chartSymbol, onRealtimeCallback)
    }
  }

  unsubscribeBars(subscriberUID: string) {
    // Cleanup if needed
  }

  getMarks(
    symbolInfo: TradingView.LibrarySymbolInfo,
    startDate: number,
    endDate: number,
    onDataCallback: TradingView.GetMarksCallback<TradingView.Mark>,
    resolution: TradingView.ResolutionString
  ) {
    // Not implemented
  }

  getTimescaleMarks(
    symbolInfo: TradingView.LibrarySymbolInfo,
    startDate: number,
    endDate: number,
    onDataCallback: TradingView.GetMarksCallback<TradingView.TimescaleMark>,
    resolution: TradingView.ResolutionString
  ) {
    // Not implemented
  }

  getServerTime(callback: TradingView.ServerTimeCallback) {
    // Not implemented
  }
}

