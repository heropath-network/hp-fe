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

export function formatSmallPrice(value: number | bigint | string): string {
  const { numericValue, plainValue } = (() => {
    if (typeof value === 'bigint') {
      const decimalString = bigIntToDecimalString(value)
      return { numericValue: parseFloat(decimalString), plainValue: decimalString }
    }
    const str = toPlainString(value)
    return { numericValue: Number(str), plainValue: str }
  })()

  if (!Number.isFinite(numericValue)) return '0'

  const negative = plainValue.startsWith('-')
  const normalized = negative ? plainValue.slice(1) : plainValue
  const [wholePartRaw, fractionPartRaw = ''] = normalized.split('.')
  const wholePart = wholePartRaw || '0'

  if (Math.abs(numericValue) >= 1) {
    const trimmedFraction = fractionPartRaw.replace(/0+$/, '')
    const maxFractionDigits = Math.min(trimmedFraction.length, 8)
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFractionDigits,
    }).format(numericValue)
  }

  if (numericValue === 0) return '0'

  let leadingZeros = 0
  while (leadingZeros < fractionPartRaw.length && fractionPartRaw.charCodeAt(leadingZeros) === 48) {
    leadingZeros++
  }

  if (leadingZeros > 0) {
    const remainingFraction = fractionPartRaw.slice(leadingZeros) || '0'
    const truncated = remainingFraction.slice(0, 4) || '0'
    const zerosString = '0'.repeat(leadingZeros)
    return `${negative ? '-' : ''}${wholePart}.${zerosString}${truncated}`
  }

  const truncated = fractionPartRaw.slice(0, 4) || '0'
  return `${negative ? '-' : ''}${wholePart}.${truncated}`
}

function bigIntToDecimalString(value: bigint): string {
  const negative = value < 0n
  const absValue = negative ? -value : value
  const padded = absValue.toString().padStart(DECIMALS + 1, '0')
  const whole = padded.slice(0, -DECIMALS) || '0'
  const fractionRaw = padded.slice(-DECIMALS)
  const fraction = fractionRaw.replace(/0+$/, '')
  const result = fraction ? `${whole}.${fraction}` : whole
  return negative ? `-${result}` : result
}

function toPlainString(value: number | bigint | string): string {
  if (typeof value === 'string') return value
  if (typeof value === 'bigint') return value.toString()

  const str = value.toString()
  if (!str.includes('e') && !str.includes('E')) return str

  const [mantissa, exponentPart] = str.split(/[eE]/)
  const exp = parseInt(exponentPart, 10)
  const isNegative = mantissa.startsWith('-')
  const cleanMantissa = isNegative ? mantissa.slice(1) : mantissa
  const [intPart, fracPart = ''] = cleanMantissa.split('.')
  const digits = intPart + fracPart

  if (exp >= 0) {
    const zerosNeeded = exp - fracPart.length
    const shifted =
      zerosNeeded >= 0
        ? digits + '0'.repeat(zerosNeeded)
        : `${digits.slice(0, intPart.length + exp)}.${digits.slice(intPart.length + exp)}`
    return isNegative ? `-${shifted}` : shifted
  }

  const zeros = -exp - 1
  const shifted = `0.${'0'.repeat(zeros)}${digits}`
  return isNegative ? `-${shifted}` : shifted
}
