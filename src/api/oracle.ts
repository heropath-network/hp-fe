import { ProjectId } from '@/constants'
import { 
  queryGainsPairOracleCandle,
  getGainsPairIndex,
} from '@/packages/gains'
import { 
  queryMuxOracleCandle,
} from '@/packages/mux-v3'

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
  if (dataType === ProjectId.GAINS) {
    const pairIndex = getGainsPairIndex(symbol)
    if (pairIndex === null) {
      return []
    }
    return await queryGainsPairOracleCandle(resolution, from, to, pairIndex)
  }

  return await queryMuxOracleCandle(resolution, from, to, symbol)
}

