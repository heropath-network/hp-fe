/**
 * BigInt utilities for handling large numbers in trading
 */

const DECIMALS = 18
const DECIMAL_MULTIPLIER = BigInt(10 ** DECIMALS)

/**
 * Convert a number to BigInt with 18 decimals
 */
export function toBigInt(value: number | string): bigint {
  if (typeof value === 'string') {
    // Handle decimal strings
    const parts = value.split('.')
    const whole = parts[0] || '0'
    const fraction = (parts[1] || '').padEnd(DECIMALS, '0').substring(0, DECIMALS)
    return BigInt(whole + fraction)
  }
  return BigInt(Math.floor(value * (10 ** DECIMALS)))
}

/**
 * Convert BigInt to human-readable number
 */
export function fromBigInt(value: bigint, decimals: number = 2): string {
  const str = value.toString().padStart(DECIMALS + 1, '0')
  const whole = str.slice(0, -DECIMALS) || '0'
  const fraction = str.slice(-DECIMALS)
  const result = `${whole}.${fraction}`
  return parseFloat(result).toFixed(decimals)
}

/**
 * Format BigInt as currency
 */
export function formatCurrency(value: bigint, decimals: number = 2): string {
  const num = parseFloat(fromBigInt(value, decimals))
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

/**
 * Format BigInt as number with commas
 */
export function formatNumber(value: bigint, decimals: number = 2): string {
  const num = parseFloat(fromBigInt(value, decimals))
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

/**
 * Calculate percentage change
 */
export function calculatePercentage(value: bigint, total: bigint): number {
  if (total === BigInt(0)) return 0
  return Number((value * BigInt(10000)) / total) / 100
}

/**
 * Multiply BigInt with decimal precision
 */
export function multiplyBigInt(a: bigint, b: bigint): bigint {
  return (a * b) / DECIMAL_MULTIPLIER
}

/**
 * Divide BigInt with decimal precision
 */
export function divideBigInt(a: bigint, b: bigint): bigint {
  if (b === BigInt(0)) return BigInt(0)
  return (a * DECIMAL_MULTIPLIER) / b
}

/**
 * Calculate PnL percentage
 */
export function calculatePnLPercentage(entryPrice: bigint, currentPrice: bigint, side: 'long' | 'short'): number {
  if (entryPrice === BigInt(0)) return 0
  
  const priceDiff = currentPrice - entryPrice
  const multiplier = side === 'long' ? 1 : -1
  const pnlPercent = (Number(priceDiff) / Number(entryPrice)) * 100 * multiplier
  
  return pnlPercent
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Format price with thousand separators and rounding
 * Example: 60000.56 => "60,001"
 * @param value - Number or BigInt to format
 * @param decimals - Number of decimal places (default: 0 for rounded)
 */
export function formatPrice(value: number | bigint | string, decimals: number = 0): string {
  let num: number
  
  if (typeof value === 'bigint') {
    num = parseFloat(fromBigInt(value, 8))
  } else if (typeof value === 'string') {
    num = parseFloat(value)
  } else {
    num = value
  }
  
  // Round if decimals is 0
  if (decimals === 0) {
    num = Math.round(num)
  }
  
  // Format with thousand separators
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

// TODO
export function formatSmallPrice(value: number | bigint | string): string {
  return value.toString()
}
