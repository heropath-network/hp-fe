/**
 * TradingView chart theme overrides
 */

const LINESTYLE_SOLID = 0
const LINESTYLE_DASHED = 2

// after updates need to cache/storage reload
export default function override(isMobile: boolean) {
  return {
    'paneProperties.backgroundType': 'solid',
    'paneProperties.background': '#0A0A0A',

    volumePaneSize: 'tiny',
    'paneProperties.vertGridProperties.color': '#1D1D1D',
    'paneProperties.vertGridProperties.style': LINESTYLE_SOLID,
    'paneProperties.horzGridProperties.color': '#1D1D1D',
    'paneProperties.horzGridProperties.style': LINESTYLE_SOLID,
    'paneProperties.crossHairProperties.color': '#9B9B9B',
    'paneProperties.crossHairProperties.width': 1,
    'paneProperties.crossHairProperties.style': LINESTYLE_DASHED,

    'paneProperties.topMargin': 10,
    'paneProperties.bottomMargin': 5,

    'paneProperties.legendProperties.showStudyArguments': true,
    'paneProperties.legendProperties.showStudyTitles': true,
    'paneProperties.legendProperties.showStudyValues': true,
    'paneProperties.legendProperties.showSeriesTitle': true,
    'paneProperties.legendProperties.showSeriesOHLC': true,
    'paneProperties.legendProperties.showLegend': true,
    'paneProperties.legendProperties.showBarChange': true,

    'scalesProperties.backgroundColor': '#0A0A0A',
    'scalesProperties.fontSize': 12,
    'scalesProperties.lineColor': '#1D1D1D',
    'scalesProperties.textColor': '#9B9B9B',

    'mainSeriesProperties.style': 1,
    'mainSeriesProperties.showCountdown': false,
    'mainSeriesProperties.visible': true,
    'mainSeriesProperties.showPriceLine': true,
    'mainSeriesProperties.priceLineWidth': 1,

    'symbolWatermarkProperties.color': 'rgba(255, 255, 255, 0)',

    // Candles
    'mainSeriesProperties.candleStyle.upColor': '#10C8A8',
    'mainSeriesProperties.candleStyle.downColor': '#FF4E59',
    'mainSeriesProperties.candleStyle.drawWick': true,
    'mainSeriesProperties.candleStyle.drawBorder': false,
    'mainSeriesProperties.candleStyle.borderUpColor': '#10C8A8',
    'mainSeriesProperties.candleStyle.borderDownColor': '#FF4E59',
    'mainSeriesProperties.candleStyle.wickUpColor': '#10C8A8',
    'mainSeriesProperties.candleStyle.wickDownColor': '#FF4E59',

    // Hollow Candles
    'mainSeriesProperties.hollowCandleStyle.upColor': '#10C8A8',
    'mainSeriesProperties.hollowCandleStyle.downColor': '#FF4E59',
    'mainSeriesProperties.hollowCandleStyle.drawWick': true,
    'mainSeriesProperties.hollowCandleStyle.drawBorder': true,
    'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#10C8A8',
    'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#FF4E59',

    // Heikin Ashi
    'mainSeriesProperties.haStyle.upColor': '#10C8A8',
    'mainSeriesProperties.haStyle.downColor': '#FF4E59',
    'mainSeriesProperties.haStyle.drawWick': true,
    'mainSeriesProperties.haStyle.drawBorder': false,
    'mainSeriesProperties.haStyle.wickUpColor': '#10C8A8',
    'mainSeriesProperties.haStyle.wickDownColor': '#FF4E59',

    // Bar
    'mainSeriesProperties.barStyle.upColor': '#10C8A8',
    'mainSeriesProperties.barStyle.downColor': '#FF4E59',

    // Line
    'mainSeriesProperties.lineStyle.color': '#27A2F8',
    'mainSeriesProperties.lineStyle.linestyle': LINESTYLE_SOLID,
    'mainSeriesProperties.lineStyle.linewidth': 2,

    // Area
    'mainSeriesProperties.areaStyle.color1': '#27A2F8',
    'mainSeriesProperties.areaStyle.color2': '#27A2F8',
    'mainSeriesProperties.areaStyle.linecolor': '#27A2F8',
    'mainSeriesProperties.areaStyle.linestyle': LINESTYLE_SOLID,
    'mainSeriesProperties.areaStyle.linewidth': 2,
  } as TradingView.Overrides
}

