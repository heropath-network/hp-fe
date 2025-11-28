/**
 * GTrade (Gains Network) Oracle Configuration
 */

export const GAINS_PRICE_HTTP_SERVICE = 'https://backend-pricing.eu.gains.trade/'
export const GAINS_PRICE_WS_SERVICE = 'wss://backend-pricing.eu.gains.trade/v3'

/**
 * GTrade Pair Index Mapping
 * Maps symbol pairs to their GTrade pair indices
 * Based on common trading pairs
 */
export const GAINS_PAIR_INDEX_MAP: Record<string, number> = {
  'BTC/USD': 0,
  'ETH/USD': 1,
  'LINK/USD': 2,
  'BNB/USD': 3,
  'ADA/USD': 4,
  'MATIC/USD': 5,
  'DOT/USD': 6,
  'UNI/USD': 7,
  'SOL/USD': 8,
  'AVAX/USD': 9,
}

