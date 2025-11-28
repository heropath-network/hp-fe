import { defaultOracleServerApiClient } from '@/api/client'
import { OracleCandle } from '@/api/oracle'

export function convertResolution(resolution: number): string {
  let defaultResolution = 'minute'
  switch (resolution) {
    case 1:
      defaultResolution = 'minute'
      break
    case 3:
      defaultResolution = 'minute3'
      break
    case 5:
      defaultResolution = 'minute5'
      break
    case 15:
      defaultResolution = 'minute15'
      break
    case 30:
      defaultResolution = 'minute30'
      break
    case 45:
      defaultResolution = 'minute45'
      break
    case 60:
      defaultResolution = 'hour'
      break
    case 120:
      defaultResolution = 'hour2'
      break
    case 180:
      defaultResolution = 'hour3'
      break
    case 240:
      defaultResolution = 'hour4'
      break
    case 60 * 24:
      defaultResolution = 'day'
      break
    case 60 * 24 * 7:
      defaultResolution = 'week'
      break
    case 60 * 24 * 30:
      defaultResolution = 'month'
      break
  }
  return defaultResolution
}


export async function queryMuxOracleCandle(
  resolution: number,
  from: number,
  to: number,
  symbol: string
): Promise<OracleCandle[]> {
  const dataTypeValue = 'mux3'
  const url = '/mux3/priceChart/indexPrices'
  
  const params = {
    symbol: symbol.toUpperCase(),
    timeMode: convertResolution(resolution),
    beginTime: from,
    endTime: to,
    dataType: dataTypeValue,
  }
  
  try {
    const responseData = await defaultOracleServerApiClient().request({
      url: url,
      method: 'get',
      params,
    })

    const candles = (responseData as any).candles || []

    return candles.map((candle: any) => ({
      timestamp: Number(candle.timestamp),
      open: String(candle.open),
      close: String(candle.close),
      low: String(candle.low),
      high: String(candle.high),
    }))

  } catch (error: any) {
    console.error('MUX V3: Failed to fetch oracle candles:', error)
    return []
  }
}

export type PriceAgoType = {
  price: number;
  symbol: string;
};

export type PriceAgoResponseType = {
  prices: PriceAgoType[];
};

export async function getMux24hAgoPrices(
  symbols: string[]
): Promise<PriceAgoType[]> {
  const dataTypeValue = "mux3";
  const url = "/mux3/priceChart/price24hAgo";

  const params = {
    symbols: symbols.join(","),
    dataType: dataTypeValue,
  };

  try {
    const responseData = await defaultOracleServerApiClient().request({
      url: url,
      method: "GET",
      params,
    });

    return (responseData as unknown as PriceAgoResponseType).prices || [];
  } catch (error: any) {
    console.error("MUX V3: Failed to fetch 24h ago price:", error);
    return [];
  }
}

