import { EMPTY_ADDRESS } from '@/constants'

export const PrizeTokens: {
  symbol: string
  address: string
  formatDecimals: number
}[] = [
  {
    symbol: 'HERO',
    address: EMPTY_ADDRESS,
    formatDecimals: 2,
  },
  {
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955',
    formatDecimals: 2,
  },
  {
    symbol: 'USDC',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    formatDecimals: 2,
  },

  {
    symbol: 'BNB',
    address: EMPTY_ADDRESS,
    formatDecimals: 4,
  },
  {
    symbol: 'ETH',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    formatDecimals: 4,
  },
  {
    symbol: 'BTC',
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    formatDecimals: 5,
  },
]
