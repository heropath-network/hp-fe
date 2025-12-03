/**
 * Comprehensive PnL calculation utilities
 * Accounts for fees (funding, borrowing, closing) to calculate net PnL
 */

export interface PnLBreakdown {
  grossPnl: bigint
  grossPnlPercent: number
  fundingFee: bigint
  borrowingFee: bigint
  closingFee: bigint
  totalFees: bigint
  netPnl: bigint
  netPnlPercent: number
}

/**
 * Calculate funding fee based on position value and time held
 * Simplified calculation: 0.01% per hour (0.0001 per hour)
 */
export function calculateFundingFee(collateral: bigint, leverage: number, hoursHeld: number): bigint {
  if (hoursHeld <= 0) return BigInt(0)

  // Funding rate: 0.01% per hour = 0.0001 per hour
  const fundingRatePerHour = BigInt(100) // 0.0001 * 10^6 (scaled for precision)
  // Position value = collateral * leverage (both in 18 decimals)
  const positionValue = collateral * BigInt(leverage)

  // Funding fee = position value * funding rate * hours
  // Scale hours by 100 for precision, then divide by 10^6 (for rate) and 10^2 (for hours scaling)
  const fee = (positionValue * fundingRatePerHour * BigInt(Math.floor(hoursHeld * 100))) / BigInt(100000000)

  return fee
}

/**
 * Calculate borrowing fee based on position value
 * Simplified calculation: 0.05% per day (0.0005 per day)
 */
export function calculateBorrowingFee(collateral: bigint, leverage: number, daysHeld: number): bigint {
  if (daysHeld <= 0) return BigInt(0)

  // Borrowing rate: 0.05% per day = 0.0005 per day
  const borrowingRatePerDay = BigInt(500) // 0.0005 * 10^6 (scaled for precision)
  // Position value = collateral * leverage (both in 18 decimals)
  const positionValue = collateral * BigInt(leverage)

  // Borrowing fee = position value * borrowing rate * days
  // Scale days by 100 for precision, then divide by 10^6 (for rate) and 10^2 (for days scaling)
  const fee = (positionValue * borrowingRatePerDay * BigInt(Math.floor(daysHeld * 100))) / BigInt(100000000)

  return fee
}

/**
 * Calculate closing fee (trading fee)
 * Simplified calculation: 0.1% of position value
 */
export function calculateClosingFee(collateral: bigint, leverage: number): bigint {
  // Position value = collateral * leverage (both in 18 decimals)
  const positionValue = collateral * BigInt(leverage)

  // Closing fee: 0.1% = 0.001
  const closingFeeRate = BigInt(1000) // 0.001 * 10^6 (scaled for precision)
  const fee = (positionValue * closingFeeRate) / BigInt(1000000)

  return fee
}

/**
 * Calculate comprehensive PnL breakdown for a position
 */
export function calculatePositionPnL(
  entryPrice: bigint,
  currentPrice: bigint,
  side: 'long' | 'short',
  _size: bigint, // Unused - kept for backward compatibility
  leverage: number,
  collateral: bigint,
  timestamp: number,
  includeFees: boolean = true,
): PnLBreakdown {
  if (entryPrice === BigInt(0)) {
    return {
      grossPnl: BigInt(0),
      grossPnlPercent: 0,
      fundingFee: BigInt(0),
      borrowingFee: BigInt(0),
      closingFee: BigInt(0),
      totalFees: BigInt(0),
      netPnl: BigInt(0),
      netPnlPercent: 0,
    }
  }

  // Validate side parameter - must be exactly 'long' or 'short'
  if (side !== 'long' && side !== 'short') {
    console.error(`Invalid side parameter: "${side}". Expected 'long' or 'short'. Defaulting to 'long'.`)
    side = 'long'
  }

  // Calculate gross PnL
  // Position value = collateral * leverage (in USD terms, with 18 decimals)
  // For long: PnL = (currentPrice - entryPrice) / entryPrice * position value
  //   - Profits when currentPrice > entryPrice (price goes up)
  // For short: PnL = (entryPrice - currentPrice) / entryPrice * position value
  //   - Profits when currentPrice < entryPrice (price goes down)
  //   - Note: NOT multiplied by -1, the sign is handled by the price difference calculation
  const priceDiff = side === 'long' ? currentPrice - entryPrice : entryPrice - currentPrice
  const positionValue = collateral * BigInt(leverage)

  // PnL = (priceDiff / entryPrice) * position value
  // Since all values are in 18 decimals: (priceDiff * positionValue) / entryPrice
  const grossPnl = (priceDiff * positionValue) / entryPrice

  // Calculate gross PnL percentage based on collateral
  // PnL % = (grossPnl / collateral) * 100
  const grossPnlPercent = collateral > BigInt(0) ? Number((grossPnl * BigInt(10000)) / collateral) / 100 : 0

  // Calculate fees if requested
  let fundingFee = BigInt(0)
  let borrowingFee = BigInt(0)
  let closingFee = BigInt(0)

  if (includeFees) {
    const now = Date.now()
    const timeHeldMs = now - timestamp
    const hoursHeld = timeHeldMs / (1000 * 60 * 60)
    const daysHeld = timeHeldMs / (1000 * 60 * 60 * 24)

    fundingFee = calculateFundingFee(collateral, leverage, hoursHeld)
    borrowingFee = calculateBorrowingFee(collateral, leverage, daysHeld)
    closingFee = calculateClosingFee(collateral, leverage)
  }

  const totalFees = fundingFee + borrowingFee + closingFee
  const netPnl = grossPnl - fundingFee

  // Calculate net PnL percentage
  const netPnlPercent = collateral > BigInt(0) ? Number((netPnl * BigInt(10000)) / collateral) / 100 : 0

  return {
    grossPnl,
    grossPnlPercent,
    fundingFee,
    borrowingFee,
    closingFee,
    totalFees,
    netPnl,
    netPnlPercent,
  }
}

/**
 * Calculate PnL for a closed trade (history)
 */
export function calculateTradeHistoryPnL(
  entryPrice: bigint,
  exitPrice: bigint,
  side: 'long' | 'short',
  _size: bigint, // Unused - kept for backward compatibility
  leverage: number,
  collateral: bigint,
  timestamp: number,
  closeTimestamp: number,
  includeFees: boolean = true,
): PnLBreakdown {
  if (entryPrice === BigInt(0)) {
    return {
      grossPnl: BigInt(0),
      grossPnlPercent: 0,
      fundingFee: BigInt(0),
      borrowingFee: BigInt(0),
      closingFee: BigInt(0),
      totalFees: BigInt(0),
      netPnl: BigInt(0),
      netPnlPercent: 0,
    }
  }

  // Validate side parameter - must be exactly 'long' or 'short'
  if (side !== 'long' && side !== 'short') {
    console.error(`Invalid side parameter: "${side}". Expected 'long' or 'short'. Defaulting to 'long'.`)
    side = 'long'
  }

  // Calculate gross PnL
  // Position value = collateral * leverage (in USD terms, with 18 decimals)
  // For long: PnL = (exitPrice - entryPrice) / entryPrice * position value
  //   - Profits when exitPrice > entryPrice (price goes up)
  // For short: PnL = (entryPrice - exitPrice) / entryPrice * position value
  //   - Profits when exitPrice < entryPrice (price goes down)
  //   - Note: NOT multiplied by -1, the sign is handled by the price difference calculation
  const priceDiff = side === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice
  const positionValue = collateral * BigInt(leverage)

  // PnL = (priceDiff / entryPrice) * position value
  // Since all values are in 18 decimals: (priceDiff * positionValue) / entryPrice
  const grossPnl = (priceDiff * positionValue) / entryPrice

  // Calculate gross PnL percentage based on collateral
  // PnL % = (grossPnl / collateral) * 100
  const grossPnlPercent = collateral > BigInt(0) ? Number((grossPnl * BigInt(10000)) / collateral) / 100 : 0

  // Calculate fees if requested
  let fundingFee = BigInt(0)
  let borrowingFee = BigInt(0)
  let closingFee = BigInt(0)

  if (includeFees) {
    const timeHeldMs = closeTimestamp - timestamp
    const hoursHeld = timeHeldMs / (1000 * 60 * 60)
    const daysHeld = timeHeldMs / (1000 * 60 * 60 * 24)

    fundingFee = calculateFundingFee(collateral, leverage, hoursHeld)
    borrowingFee = calculateBorrowingFee(collateral, leverage, daysHeld)
    closingFee = calculateClosingFee(collateral, leverage)
  }

  const totalFees = fundingFee + borrowingFee + closingFee
  const netPnl = grossPnl - totalFees

  // Calculate net PnL percentage
  const netPnlPercent = collateral > BigInt(0) ? Number((netPnl * BigInt(10000)) / collateral) / 100 : 0

  return {
    grossPnl,
    grossPnlPercent,
    fundingFee,
    borrowingFee,
    closingFee,
    totalFees,
    netPnl,
    netPnlPercent,
  }
}

