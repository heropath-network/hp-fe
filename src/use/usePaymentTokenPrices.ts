import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

const BINANCE_PRICE_URL = 'https://api.binance.com/api/v3/ticker/price'
const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'BNB'] as const

type BinanceTickerResponse = {
  symbol: string
  price: string
}

async function fetchPrices(symbols: readonly string[]) {
  const url = `${BINANCE_PRICE_URL}?symbols=${encodeURIComponent(JSON.stringify(symbols))}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch payment token prices (${response.status})`)
  }

  const data: BinanceTickerResponse[] = await response.json()

  return data.reduce<Record<string, number>>((acc, item) => {
    const baseSymbol = item.symbol.replace(/USDT$/, '')
    const price = Number(item.price)

    if (!Number.isNaN(price)) {
      acc[baseSymbol] = price
    }

    return acc
  }, {})
}

export function usePaymentTokenPrices(symbols: readonly string[] = DEFAULT_SYMBOLS) {
  const querySymbols = symbols.map((s) => s.toUpperCase() + 'USDT')
  const query = useQuery({
    queryKey: ['payment-token-prices', symbols],
    queryFn: () => fetchPrices(querySymbols),
    staleTime: 60_000,
    refetchInterval: 10_000,
  })

  const prices = computed(() => query.data.value ?? {})

  const getPrice = (symbol: string) => prices.value[symbol.toUpperCase()] ?? null

  return {
    ...query,
    prices,
    getPrice,
  }
}
