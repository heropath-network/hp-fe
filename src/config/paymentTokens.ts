import { EMPTY_ADDRESS } from '@/constants'

export const PaymentTokens: {
  symbol: string
  address: string
  balance: number
  formatDecimals: number
}[] = [
  {
    symbol: 'ETH',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    balance: Math.random() * 1.5,
    formatDecimals: 4,
  },
  {
    symbol: 'BTC',
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    balance: Math.random() * 0.3,
    formatDecimals: 5,
  },
  {
    symbol: 'USDC',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    balance: Math.random() * 5000,
    formatDecimals: 2,
  },
  {
    symbol: 'BNB',
    address: EMPTY_ADDRESS,
    balance: Math.random() * 5,
    formatDecimals: 4,
  },
  {
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955',
    balance: Math.random() * 5000,
    formatDecimals: 2,
  },
]

export const TOKEN_PRICES: { [key: string]: number } = {
  USDC: 1,
  USDT: 1,
}
