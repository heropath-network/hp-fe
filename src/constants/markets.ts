export const CRYPTO_MARKETS = [
  'BTC/USD',
  'ETH/USD',
  'WLFI/USD',
  'LINK/USD',
  'BNB/USD',
  'ADA/USD',
  'MATIC/USD',
  'DOT/USD',
  'UNI/USD',
  'SOL/USD',
  'AVAX/USD',
  'ARB/USD',
  'OP/USD',
  'DOGE/USD',
  'AAVE/USD',
] as const

export const PERP_MARKETS = [
  'ARB/USD',
  'AVAX/USD',
  'MATIC/USD',
  'OP/USD',
] as const

export const FOUR_MEME_MARKETS = ['ALIF', 'BIBI', 'BOL', 'RCHV', 'GG', 'AJC', 'AIF'] as const

export const FOREX_MARKETS = [
  'EUR/USD',
  'GBP/USD',
  'AUD/USD',
  'USD/JPY',
  'USD/CAD',
  'USD/CHF',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'AUD/JPY',
  'EUR/AUD',
  'GBP/AUD',
  'NZD/JPY',
  'EUR/CAD',
  'GBP/CAD',
  'AUD/CAD',
  'EUR/CHF',
  'GBP/CHF',
  'AUD/CHF',
  'CAD/JPY',
  'CHF/JPY',
  'NZD/CAD',
  'NZD/CHF',
  'NOK/USD',
  'SEK/USD',
] as const

export const STOCKS_MARKETS = [
  'AAPL/USD',
  'ABNB/USD',
  'AMD/USD',
  'AMZN/USD',
  'BA/USD',
  'DIS/USD',
  'GME/USD',
  'GOOGL/USD',
  'INTC/USD',
  'KO/USD',
  'MA/USD',
  'MCD/USD',
  'META/USD',
  'MSFT/USD',
  'NKE/USD',
  'NVDA/USD',
  'PFE/USD',
  'PYPL/USD',
  'SBUX/USD',
  'SNAP/USD',
  'TSLA/USD',
  'V/USD',
  'WMT/USD',
  'COIN/USD',
  'CRCL/USD',
  'HOOD/USD',
  'LMT/USD',
  'RIOT/USD',
  'SBET/USD',
  'PLTR/USD',
  'MARA/USD',
] as const

export const AVAILABLE_MARKETS = [...CRYPTO_MARKETS, ...FOREX_MARKETS, ...STOCKS_MARKETS, ...FOUR_MEME_MARKETS] as const

export type MarketSymbol = typeof AVAILABLE_MARKETS[number]

