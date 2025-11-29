import { APIClient } from '@/api/client'
import { GAINS_PRICE_HTTP_SERVICE, GAINS_PAIR_INDEX_MAP } from '../constants'
import Ajv from 'ajv'
import oracleScheme from '../schemas/oracle.json'
import { OracleCandle } from '@/api/oracle'

const ajv = new Ajv()
ajv.addSchema(oracleScheme, 'oracleSchema')


export function getGainsPairIndex(symbol: string): number | null {
  const upperSymbol = symbol.toUpperCase();
  if (GAINS_PAIR_INDEX_MAP[upperSymbol] !== undefined) {
    return GAINS_PAIR_INDEX_MAP[upperSymbol];
  }

  return null;
}

export function convertGainsResolution(resolution: number): number {
  switch (resolution) {
    case 1:
    case 3:
      return 1;
    case 5:
      return 5;
    case 15:
    case 30:
    case 45:
      return 15;
    case 60:
    case 120:
    case 180:
      return 60;
    case 240:
      return 240;
    case 60 * 24:
      return 1440;
    case 60 * 24 * 7:
    case 60 * 24 * 30:
      return 60;
    default:
      return 15;
  }
}

export async function queryGainsPairOracleCandle(
  resolution: number,
  from: number,
  to: number,
  pairIndex: number,
): Promise<OracleCandle[]> {
  try {
    const client = new APIClient(GAINS_PRICE_HTTP_SERVICE)
    const gainsResolution = convertGainsResolution(resolution)

    const responseData = await client.request({
      url: `/charts/${pairIndex}/${from}/${to}/${gainsResolution}`,
      method: 'get',
    })

    const candles = (responseData.data?.table as any[]) || []

    const validate = ajv.getSchema('oracleSchema#/definitions/GainsOracleCandle')

    if (!validate) {
      throw new Error('No validate schema for GainsOracleCandle')
    }

    return candles
      .filter((item: any) => {
        if (typeof item === 'object' && item !== null) {
          return validate(item)
        }

        return false
      })
      .map((item: any) => ({
        timestamp: Number(item.time) / 1000,
        open: String(item.open),
        high: String(item.high),
        low: String(item.low),
        close: String(item.close),
      }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getGains24hAgoPrices(): Promise<(number | null)[]> {
  try {
    const client = new APIClient(GAINS_PRICE_HTTP_SERVICE)
    const response = await client.request({
      method: 'GET',
      url: '/prices-24h-ago',
    })
    return response.data.pricesBefore as Array<number | null>
  } catch (error) {
    return []
  }
}

export async function getGainsLatestChartPrices(): Promise<(number | null)[]> {
  try {
    const client = new APIClient(GAINS_PRICE_HTTP_SERVICE)
    const response = await client.request({
      method: 'GET',
      url: '/charts',
    })
    return response.data.closes as Array<number | null>
  } catch (error) {
    return []
  }
}

export interface GainsMarketPrice {
  symbol: string
  price: number | null
  price24hAgo: number | null
  change24h: number
}


export async function getAllGainsMarketPrices(): Promise<Map<string, GainsMarketPrice>> {
  try {
    const [currentPrices, prices24hAgo] = await Promise.all([getGainsLatestChartPrices(), getGains24hAgoPrices()])


    if (!Array.isArray(currentPrices) || !Array.isArray(prices24hAgo)) {
      console.error('Invalid response format from Gains API:', {
        currentPrices: Array.isArray(currentPrices),
        prices24hAgo: Array.isArray(prices24hAgo),
        currentPricesLength: currentPrices?.length,
        prices24hAgoLength: prices24hAgo?.length,
      })
      return new Map()
    }

    const pricesMap = new Map<string, GainsMarketPrice>()
    const maxIndex = Math.max(
      currentPrices.length > 0 ? currentPrices.length - 1 : 0,
      prices24hAgo.length > 0 ? prices24hAgo.length - 1 : 0,
    )

    for (const [symbol, pairIndex] of Object.entries(GAINS_PAIR_INDEX_MAP)) {
      if (pairIndex < 0 || pairIndex > maxIndex) {
        console.warn(`Pair index ${pairIndex} for ${symbol} is out of bounds (max: ${maxIndex})`)
        continue
      }

      const currentPrice = currentPrices[pairIndex] ?? null
      const price24hAgo = prices24hAgo[pairIndex] ?? null

      let change24h = 0
      if (currentPrice !== null && price24hAgo !== null && price24hAgo > 0) {
        change24h = ((currentPrice - price24hAgo) / price24hAgo) * 100
      }

      pricesMap.set(symbol, {
        symbol,
        price: currentPrice,
        price24hAgo,
        change24h,
      })
    }

    return pricesMap
  } catch (error) {
    console.error('Failed to fetch all Gains market prices:', error)
    return new Map()
  }
}

