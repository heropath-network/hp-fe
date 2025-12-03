import { useLocalStorage } from '@vueuse/core'

const FAVORITES_STORAGE_KEY = 'market-favorites'
const DEFAULT_FAVORITES: string[] = ['BTC/USD','BNB/USD',  'GG']

export const favoritesStorage = useLocalStorage<string[]>(FAVORITES_STORAGE_KEY, DEFAULT_FAVORITES)

export function isFavorite(market: string): boolean {
  return favoritesStorage.value.includes(market)
}

export function toggleFavorite(market: string): void {
  const index = favoritesStorage.value.indexOf(market)
  if (index > -1) {
    favoritesStorage.value = favoritesStorage.value.filter(m => m !== market)
  } else {
    favoritesStorage.value = [...favoritesStorage.value, market]
  }
}

export function getFavorites(): string[] {
  return favoritesStorage.value
}



