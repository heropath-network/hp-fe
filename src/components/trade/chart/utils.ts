import { Bar } from '@/types/tradingview'
import moment from 'moment'
import { queryAssetOracleCandle } from '@/api/oracle'
import { ProjectId } from '@/constants'


export function convertResolutionStrToNum(resolution: string): number {
  switch (resolution) {
    case '1':
      return 1
    case '3':
      return 3
    case '5':
      return 5
    case '15':
      return 15
    case '30':
      return 30
    case '60':
      return 60
    case '240':
      return 240
    case '1D':
      return 60 * 24
    case '1W':
      return 60 * 24 * 7
    default:
      return 5
  }
}

export function alignTimeToResolution(dataResolution: number, timestamp?: number): number {
  const r = dataResolution
  let t: 'minutes' | 'hours' | 'days' | 'weeks' = 'minutes'
  
  if (r === 1 || r === 3 || r === 5 || r === 15 || r === 30) {
    t = 'minutes'
  } else if (r === 60 || r === 240) {
    t = 'hours'
  } else if (r === 60 * 24) {
    t = 'days'
  } else if (r === 60 * 24 * 7) {
    t = 'weeks'
  }

  let v = moment().utc().startOf(t)
  if (!!timestamp) {
    v = moment(timestamp * 1000).utc().startOf(t)
  }

  if (t === 'minutes') {
    const minute = v.minute()
    const aligned = Math.floor(minute / r) * r
    v.minute(aligned)
  } else if (t === 'hours') {
    const hour = v.hour()
    const hourResolution = r / 60
    const aligned = Math.floor(hour / hourResolution) * hourResolution
    v.hour(aligned)
  }

  return v.valueOf()
}


export async function fetchOracleCandles(
  resolution: number,
  from: number,
  to: number,
  symbol: string,
  projectId: ProjectId = ProjectId.MUX_V3
): Promise<Bar[]> {
  try {
    let symbolToQuery = symbol
    if (projectId !== ProjectId.GAINS) {
      // MUX V3: Extract just base symbol (e.g., "BTC/USD" -> "BTC")
      symbolToQuery = symbol.split('/')[0] || symbol
    }
    // GTrade: Keep full symbol (e.g., "BTC/USD")

    let adjustedFrom = from
    if (projectId === ProjectId.GAINS) {
      adjustedFrom = from - 60 * 60 * 24 // Subtract 1 day
    }

    const candles = await queryAssetOracleCandle(resolution, adjustedFrom, to, symbolToQuery, projectId)
    
    const bars: Bar[] = candles
      .map((candle) => {
        const time = Number(candle.timestamp) * 1000 // Convert to milliseconds for TradingView
        const open = parseFloat(candle.open)
        const close = parseFloat(candle.close)
        const low = parseFloat(candle.low)
        const high = parseFloat(candle.high)
        
        // Validate all values are valid numbers
        if (isNaN(time) || isNaN(open) || isNaN(close) || isNaN(low) || isNaN(high)) {
          return null
        }
        
        return {
          time,
          open,
          close,
          low,
          high,
        }
      })
      .filter((bar): bar is Bar => bar !== null) // Filter out invalid candles
    

    return bars.sort((a, b) => a.time - b.time)
  } catch (error) {
    console.error('Failed to fetch oracle candles:', error)
    return []
  }
}