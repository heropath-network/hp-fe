import { FOREX_MARKETS, STOCKS_MARKETS } from '@/constants/markets'

export type MarketType = 'crypto' | 'forex' | 'stocks'

export function getMarketType(market: string): MarketType {
  if (FOREX_MARKETS.includes(market as any)) {
    return 'forex'
  }
  if (STOCKS_MARKETS.includes(market as any)) {
    return 'stocks'
  }
  return 'crypto'
}

export function isForexOpen(dateToCheck: Date = new Date()): boolean {
  // Convert to US Eastern Time
  const now = new Date(dateToCheck.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const weekday = now.getDay() // 0 = Sunday, 6 = Saturday
  const hour = now.getHours()
  const dayOfMonth = now.getDate()
  const month = now.getMonth() + 1 // 1-12

  // Check if DST (rough approximation: March-November)
  const isInDST = month >= 3 && month <= 11

  const isClosed =
    // Christmas 2023-2025
    (month === 12 && dayOfMonth >= 25 && dayOfMonth <= 27) ||
    // New Year's Eve 2023-2025
    (month === 1 && dayOfMonth >= 1 && dayOfMonth <= 2) ||
    // Friday after 4PM (DST) and 5PM (non-DST)
    (weekday === 5 && ((isInDST && hour >= 16) || hour >= 17)) ||
    // Saturday
    weekday === 6 ||
    // Sunday before 4PM (DST) and 5PM (non-DST)
    (weekday === 0 && ((isInDST && hour < 16) || hour < 17))

  return !isClosed
}


export function isStocksOpen(dateToCheck: Date = new Date()): boolean {
  // Convert to US Eastern Time
  const now = new Date(dateToCheck.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const weekday = now.getDay() // 0 = Sunday, 6 = Saturday
  const hour = now.getHours()
  const minute = now.getMinutes()
  const dayOfMonth = now.getDate()
  const month = now.getMonth() + 1 // 1-12

  const isClosed =
    // New Year's Day
    (month === 1 && dayOfMonth === 1) ||
    // Martin Luther King, Jr. Day (3rd Monday of January)
    (month === 1 && dayOfMonth >= 15 && dayOfMonth <= 21 && weekday === 1) ||
    // Presidents' Day (3rd Monday of February)
    (month === 2 && dayOfMonth >= 15 && dayOfMonth <= 21 && weekday === 1) ||
    // Good Friday (varies, but typically in March/April)
    // Memorial Day (last Monday of May)
    (month === 5 && dayOfMonth >= 25 && dayOfMonth <= 31 && weekday === 1) ||
    // Juneteenth (June 19)
    (month === 6 && dayOfMonth === 19) ||
    // Independence Day
    (month === 7 && dayOfMonth === 4) ||
    // Labor Day (1st Monday of September)
    (month === 9 && dayOfMonth <= 7 && weekday === 1) ||
    // Thanksgiving Day (4th Thursday of November)
    (month === 11 && dayOfMonth >= 22 && dayOfMonth <= 28 && weekday === 4) ||
    // Black Friday (closes early at 1PM)
    (month === 11 && dayOfMonth >= 23 && dayOfMonth <= 29 && weekday === 5 && hour >= 13) ||
    // Christmas Eve (closes early at 1PM)
    (month === 12 && dayOfMonth === 24 && hour >= 13) ||
    // Christmas Day
    (month === 12 && dayOfMonth === 25) ||
    // Day before Independence Day (closes early at 1PM)
    (month === 7 && dayOfMonth === 3 && hour >= 13) ||
    // Saturday
    weekday === 6 ||
    // Sunday
    weekday === 0 ||
    // Mo-Fr Daily Opening (before 9:30 AM)
    hour < 9 ||
    (hour === 9 && minute < 30) ||
    // Mo-Fr Daily Closing (after 4:00 PM)
    hour >= 16

  return !isClosed
}


export function isMarketClosed(market: string, dateToCheck: Date = new Date()): boolean {
  const marketType = getMarketType(market)
  
  if (marketType === 'crypto') {
    return false // Crypto markets are always open
  }
  
  if (marketType === 'forex') {
    return !isForexOpen(dateToCheck)
  }
  
  if (marketType === 'stocks') {
    return !isStocksOpen(dateToCheck)
  }
  
  return false
}

