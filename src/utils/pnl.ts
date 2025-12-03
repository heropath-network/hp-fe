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
 * Calculate funding fee based on position size and time held
 * Simplified calculation: 0.01% per hour (0.0001 per hour)
 */
export function calculateFundingFee(
  positionSize: bigint,
  entryPrice: bigint,
  leverage: number,
  hoursHeld: number
): bigint {
  if (hoursHeld <= 0) return BigInt(0)
  
  // Funding rate: 0.01% per hour = 0.0001 per hour
  const fundingRatePerHour = BigInt(100) // 0.0001 * 10^6 (scaled for precision)
  const positionValue = (positionSize * BigInt(leverage)) / entryPrice
  
  // Funding fee = position value * funding rate * hours
  const fee = (positionValue * fundingRatePerHour * BigInt(Math.floor(hoursHeld * 100))) / BigInt(1000000)
  
  return fee
}

/**
 * Calculate borrowing fee based on position size
 * Simplified calculation: 0.05% per day (0.0005 per day)
 */
export function calculateBorrowingFee(
  positionSize: bigint,
  entryPrice: bigint,
  leverage: number,
  daysHeld: number
): bigint {
  if (daysHeld <= 0) return BigInt(0)
  
  // Borrowing rate: 0.05% per day = 0.0005 per day
  const borrowingRatePerDay = BigInt(500) // 0.0005 * 10^6 (scaled for precision)
  const positionValue = (positionSize * BigInt(leverage)) / entryPrice
  
  // Borrowing fee = position value * borrowing rate * days
  const fee = (positionValue * borrowingRatePerDay * BigInt(Math.floor(daysHeld * 100))) / BigInt(1000000)
  
  return fee
}

/**
 * Calculate closing fee (trading fee)
 * Simplified calculation: 0.1% of position value
 */
export function calculateClosingFee(
  positionSize: bigint,
  entryPrice: bigint,
  leverage: number
): bigint {
  const positionValue = (positionSize * BigInt(leverage)) / entryPrice
  
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
  size: bigint,
  leverage: number,
  collateral: bigint,
  timestamp: number,
  includeFees: boolean = true
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

  // Calculate gross PnL
  // Position value = size * price (in USD terms, with 18 decimals)
  // For long: PnL = (currentPrice - entryPrice) * size
  // For short: PnL = (entryPrice - currentPrice) * size
  const priceDiff = currentPrice - entryPrice
  const multiplier = side === 'long' ? BigInt(1) : BigInt(-1)
  
  // Calculate position value change: (priceDiff * size) / 10^18 to normalize decimals
  // Since prices and size are in 18 decimals, we need to divide by 10^18
  const DECIMAL_MULTIPLIER = BigInt(10 ** 18)
  const grossPnl = ((priceDiff * size) / DECIMAL_MULTIPLIER) * multiplier
  
  // Calculate gross PnL percentage based on collateral
  // PnL % = (grossPnl / collateral) * 100
  const grossPnlPercent = collateral > BigInt(0)
    ? Number((grossPnl * BigInt(10000)) / collateral) / 100
    : 0

  // Calculate fees if requested
  let fundingFee = BigInt(0)
  let borrowingFee = BigInt(0)
  let closingFee = BigInt(0)
  
  if (includeFees) {
    const now = Date.now()
    const timeHeldMs = now - timestamp
    const hoursHeld = timeHeldMs / (1000 * 60 * 60)
    const daysHeld = timeHeldMs / (1000 * 60 * 60 * 24)
    
    fundingFee = calculateFundingFee(size, entryPrice, leverage, hoursHeld)
    borrowingFee = calculateBorrowingFee(size, entryPrice, leverage, daysHeld)
    closingFee = calculateClosingFee(size, entryPrice, leverage)
  }
  
  const totalFees = fundingFee + borrowingFee + closingFee
  const netPnl = grossPnl - totalFees
  
  // Calculate net PnL percentage
  const netPnlPercent = collateral > BigInt(0)
    ? Number((netPnl * BigInt(10000)) / collateral) / 100
    : 0

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
  size: bigint,
  leverage: number,
  collateral: bigint,
  timestamp: number,
  closeTimestamp: number,
  includeFees: boolean = true
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

  // Calculate gross PnL
  // Position value = size * price (in USD terms, with 18 decimals)
  // For long: PnL = (exitPrice - entryPrice) * size
  // For short: PnL = (entryPrice - exitPrice) * size
  const priceDiff = exitPrice - entryPrice
  const multiplier = side === 'long' ? BigInt(1) : BigInt(-1)
  
  // Calculate position value change: (priceDiff * size) / 10^18 to normalize decimals
  // Since prices and size are in 18 decimals, we need to divide by 10^18
  const DECIMAL_MULTIPLIER = BigInt(10 ** 18)
  const grossPnl = ((priceDiff * size) / DECIMAL_MULTIPLIER) * multiplier
  
  // Calculate gross PnL percentage based on collateral
  // PnL % = (grossPnl / collateral) * 100
  const grossPnlPercent = collateral > BigInt(0)
    ? Number((grossPnl * BigInt(10000)) / collateral) / 100
    : 0

  // Calculate fees if requested
  let fundingFee = BigInt(0)
  let borrowingFee = BigInt(0)
  let closingFee = BigInt(0)
  
  if (includeFees) {
    const timeHeldMs = closeTimestamp - timestamp
    const hoursHeld = timeHeldMs / (1000 * 60 * 60)
    const daysHeld = timeHeldMs / (1000 * 60 * 60 * 24)
    
    fundingFee = calculateFundingFee(size, entryPrice, leverage, hoursHeld)
    borrowingFee = calculateBorrowingFee(size, entryPrice, leverage, daysHeld)
    closingFee = calculateClosingFee(size, entryPrice, leverage)
  }
  
  const totalFees = fundingFee + borrowingFee + closingFee
  const netPnl = grossPnl - totalFees
  
  // Calculate net PnL percentage
  const netPnlPercent = collateral > BigInt(0)
    ? Number((netPnl * BigInt(10000)) / collateral) / 100
    : 0

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

