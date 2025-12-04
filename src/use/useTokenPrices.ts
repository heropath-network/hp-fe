import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

const BINANCE_PRICE_URL = 'https://api.binance.com/api/v3/ticker/price'

type BinanceTickerResponse = {
  symbol: string
  price: string
}

async function fetchPrices() {
  const response = await fetch(BINANCE_PRICE_URL)

  if (!response.ok) {
    throw new Error(`Failed to fetch all token prices (${response.status})`)
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

export function useAllTokenPrices() {
  const query = useQuery({
    queryKey: ['all-token-prices'],
    queryFn: () => fetchPrices(),
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
