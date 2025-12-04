import { FOUR_MEME_API_BASE_URL } from '../constants'

export interface TokenPriceData {
  price: string
  maxPrice: string
  increase: string
  marketCap: string
  progress?: string
}

export interface TokenData {
  id: string
  address: string
  symbol: string
  name: string
  tokenPrice: TokenPriceData
  trading: string
  dayIncrease: string
  tradingUsd: string
  status?: string
  dexType?: string
}

export interface BarData {
  open: string
  high: string
  low: string
  close: string
  volume: string
  tokenId: number
  type: string
  createDate: string
}

export interface TickerData {
  symbol: string
  price: string
}

export interface ApiResponse<T> {
  code: number
  msg?: string
  data?: T
}

/**
 * Fetch token details by address
 */
export async function getFourMemeTokenData(address: string): Promise<TokenData | null> {
  try {
    const url = `${FOUR_MEME_API_BASE_URL}/private/token/get?address=${address}`
    const response = await fetch(url)
    const data: ApiResponse<TokenData> = await response.json()

    if (data.code === 0 && data.data) {
      return data.data
    }
    return null
  } catch (error) {
    console.error('Four.meme: Failed to fetch token data:', error)
    return null
  }
}

export async function getFourMemeBars(
  tokenId: number,
  barType: string,
  pageSize: number,
  endDate: number,
): Promise<BarData[]> {
  try {
    const url = `${FOUR_MEME_API_BASE_URL}/public/bar/new`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: tokenId.toString(),
        typeEnum: barType,
        pageSize,
        endDate,
        symbol: 'ORIGINAL',
        isAve: false,
      }),
    })

    const data: ApiResponse<BarData[]> = await response.json()

    if (data.code === 0 && data.data) {
      return data.data
    }
    return []
  } catch (error) {
    console.error('Four.meme: Failed to fetch bars:', error)
    return []
  }
}

export async function getBnbUsdPrice(): Promise<number | null> {
  try {
    const url = `${FOUR_MEME_API_BASE_URL}/public/ticker`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })

    const data: ApiResponse<TickerData[]> = await response.json()

    if (data.code === 0 && data.data) {
      const bnbUsdPair = data.data.find((item) => item.symbol === 'BNBUSDT')
      if (bnbUsdPair) {
        return parseFloat(bnbUsdPair.price)
      }
    }
    return null
  } catch (error) {
    console.error('Four.meme: Failed to fetch BNB price:', error)
    return null
  }
}

export async function getAllFourMemeMarketPrices(
  markets: Array<{ address: string; id: string; tokenId: number }>,
): Promise<Map<string, { price: number; change24h: number }>> {
  const result = new Map<string, { price: number; change24h: number }>()

  try {
    const promises = markets.map(async (market) => {
      const tokenData = await getFourMemeTokenData(market.address)
      if (tokenData && tokenData.tokenPrice && tokenData.tokenPrice.price) {
        const price = parseFloat(tokenData.tokenPrice.price)
        const dayIncrease = parseFloat(tokenData.dayIncrease || '0')
        result.set(market.id, {
          price,
          change24h: dayIncrease * 100, // Convert to percentage
        })
      }
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('Four.meme: Failed to fetch all market prices:', error)
  }

  return result
}
