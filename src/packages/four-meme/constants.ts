/**
 * Four.meme API Configuration
 */
import { FOUR_MEME_API_BASE_URL, FOUR_MEME_WS_URL, FOUR_MEME_MARKETS } from '@/constants/fourMemeMarkets'
import type { FourMemeMarket } from '@/constants/fourMemeMarkets'

export { FOUR_MEME_API_BASE_URL, FOUR_MEME_WS_URL, FOUR_MEME_MARKETS }
export type { FourMemeMarket }

/**
 * Map resolution strings to four.meme bar types
 */
export function resolutionToBarType(resolution: string): string {
  switch (resolution) {
    case '1':
      return 'MIN1'
    case '5':
      return 'MIN5'
    case '15':
      return 'MIN15'
    case '60':
    case '1H':
      return 'HOUR1'
    case '240':
    case '4H':
      return 'HOUR4'
    case 'D':
    case '1D':
      return 'DAY1'
    default:
      return 'MIN5'
  }
}

export function getFourMemeMarket(symbolOrId: string): FourMemeMarket | undefined {
  return FOUR_MEME_MARKETS.find(
    (m) => m.symbol === symbolOrId || m.id === symbolOrId || m.name === symbolOrId
  )
}
