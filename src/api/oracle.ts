import { ProjectId } from '@/constants'
import { 
  queryGainsPairOracleCandle,
  getGainsPairIndex,
} from '@/packages/gains'
import { 
  queryMuxOracleCandle,
} from '@/packages/mux-v3'
import { getFourMemeBars, resolutionToBarType, getFourMemeMarket, getBnbUsdPrice } from '@/packages/four-meme'

export interface OracleCandle {
  timestamp: number
  open: string
  close: string
  low: string
  high: string
}

/**
 * Query oracle candle data for a specific symbol and time range
 * Orchestrates calls to specific oracle packages
 * 
 * @param resolution - Resolution in minutes (1, 5, 15, 60, etc.)
 * @param from - Start timestamp in seconds
 * @param to - End timestamp in seconds
 * @param symbol - Trading symbol (e.g., 'BTC/USD', 'ETH/USD')
 * @param dataType - Oracle source (ProjectId)
 * @returns Array of candle data
 */
export async function queryAssetOracleCandle(
  resolution: number,
  from: number,
  to: number,
  symbol: string,
  dataType: ProjectId = ProjectId.MUX_V3
): Promise<OracleCandle[]> {
  if (dataType === ProjectId.FOUR_MEME) {
    const market = getFourMemeMarket(symbol)
    if (!market) {
      return []
    }

    const barType = resolutionToBarType(resolution.toString())
    const endDate = to * 1000 // Convert to milliseconds
    const pageSize = 300
    const bnbUsdPrice = await getBnbUsdPrice()
    if (!bnbUsdPrice || bnbUsdPrice <= 0) {
      console.warn('Four.meme: Missing BNB/USD price, returning raw bars')
    }

    const bars = await getFourMemeBars(market.tokenId, barType, pageSize, endDate)

    // Convert four.meme bar format to OracleCandle format
    return bars.map((bar) => ({
      timestamp: parseInt(bar.createDate) / 1000, 
      open: bnbUsdPrice && bnbUsdPrice > 0 ? (parseFloat(bar.open) * bnbUsdPrice).toString() : bar.open,
      close: bnbUsdPrice && bnbUsdPrice > 0 ? (parseFloat(bar.close) * bnbUsdPrice).toString() : bar.close,
      low: bnbUsdPrice && bnbUsdPrice > 0 ? (parseFloat(bar.low) * bnbUsdPrice).toString() : bar.low,
      high: bnbUsdPrice && bnbUsdPrice > 0 ? (parseFloat(bar.high) * bnbUsdPrice).toString() : bar.high,
    }))
  }

  if (dataType === ProjectId.GAINS) {
    const pairIndex = getGainsPairIndex(symbol)
    if (pairIndex === null) {
      return []
    }
    return await queryGainsPairOracleCandle(resolution, from, to, pairIndex)
  }

  return await queryMuxOracleCandle(resolution, from, to, symbol)
}
