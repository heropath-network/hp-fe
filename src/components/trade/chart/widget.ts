import Datafeed from './datafeed'
import override from './override'
import { CHART_LIBRARY_PATH } from '@/constants'
import { ResolutionString } from '@/types/tradingview'

// TradingView library is loaded globally via script tag
declare const TradingView: any

export default class Widget {
  datafeed: Datafeed
  tvWidget: any | null
  onChartReady: Function | null
  isTvWidgetChartReady: boolean

  constructor(decimals: number) {
    this.datafeed = new Datafeed(decimals)
    this.tvWidget = null
    this.onChartReady = null
    this.isTvWidgetChartReady = false
  }

  init(
    containerID: string,
    symbol: string,
    locale: string,
    timezone: string,
    interval: string,
    savedData?: object
  ) {
    if (!containerID) {
      throw new Error('Pass in the id of the element you want to render')
    }

    const conf = this.getConfiguration(containerID, symbol, locale, timezone, interval, savedData)
    this.tvWidget = new TradingView.widget(conf)
    
    this.tvWidget!.onChartReady(() => {
      if (!this.tvWidget) {
        return
      }
      
      this.isTvWidgetChartReady = true
      if (this.onChartReady) {
        this.onChartReady()
      }
    })
  }

  onDestroyed() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove()
    }
    this.tvWidget = null
  }

  onMarketChanged(symbol: string, callback: Function) {
    if (!this.isTvWidgetChartReady) {
      return
    }
    if (this.tvWidget) {
      this.tvWidget.setSymbol(symbol, this.tvWidget.activeChart().resolution(), () => {
        callback()
      })
    }
  }

  setCandlesGetter(callback: Function, endCallback: Function) {
    this.datafeed.onBeginFetch = callback
    endCallback()
  }

  updateRealtimePrice(bar: any, chartSymbol: string) {
    const call = this.datafeed.getOnRealtimeCallback(chartSymbol)
    if (!!call) {
      call(bar)
    }
  }

  getConfiguration(
    containerID: string,
    symbol: string,
    _locale: string,
    _timezone: string,
    interval: string,
    saveData?: object
  ): any {
    return {
      container: containerID,
      datafeed: this.datafeed,
      symbol,
      locale: 'en',
      timezone: 'Etc/UTC',
      theme: 'Dark',
      timeframe: '1D',
      loading_screen: {
        backgroundColor: '#040818',
      },
      load_last_chart: false,
      auto_save_delay: 5,
      saved_data: saveData,
      library_path: CHART_LIBRARY_PATH,
      debug: false,
      autosize: true,
      charts_storage_api_version: '1.1',
      charts_storage_url: '',
      client_id: '',
      user_id: 'public_user_id',
      interval: interval as ResolutionString,
      time_frames: [
        { text: '1d', resolution: '1' as ResolutionString, description: '1 Day', title: '1D' },
        { text: '5d', resolution: '5' as ResolutionString, description: '5 Days', title: '5D' },
        { text: '1M', resolution: '30' as ResolutionString, description: '1 Month', title: '1M' },
        { text: '3M', resolution: '60' as ResolutionString, description: '3 Months', title: '3M' },
        { text: '6M', resolution: '120' as ResolutionString, description: '6 Months', title: '6M' },
        { text: '1Y', resolution: '1W' as ResolutionString, description: '1 Year', title: '1Y' },
      ],
      disabled_features: [
        'header_symbol_search',
        'show_interval_dialog_on_key_press',
        'symbol_search_hot_key',
        'header_compare',
        'edit_buttons_in_legend',
        'symbol_info',
        'datasource_copypaste',
        'right_bar_stays_on_scroll',
        'context_menus',
        'timezone_menu',
        'remove_library_container_border',
        'display_market_status',
      ],
      enabled_features: [
        'dont_show_boolean_study_arguments',
        'border_around_the_chart',
        'remove_library_container_border',
        'save_chart_properties_to_local_storage',
        'side_toolbar_in_fullscreen_mode',
        'hide_last_na_study_output',
        'constraint_dialogs_movement',
        'show_chart_property_page',
        'pane_context_menu',
        'go_to_date',
      ],
      studies_overrides: {
        'volume.volume.color.0': '#10C8A8',
        'volume.volume.color.1': '#FF4E59',
        'volume.volume.transparency': 75,
      },
      overrides: override(false),
      custom_css_url: 'chart.v4.css',
    }
  }
}

