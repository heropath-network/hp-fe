import { ProjectId } from '@/constants'
import { MUX_V3_SUPPORTED_MARKETS } from '@/packages/mux-v3/constants'
import { GAINS_PAIR_INDEX_MAP } from '@/packages/gains/constants'

export function isMarketAvailableInMuxV3(market: string): boolean {
  return MUX_V3_SUPPORTED_MARKETS.has(market.toUpperCase())
}

export function isMarketAvailableInGains(market: string): boolean {
  return market.toUpperCase() in GAINS_PAIR_INDEX_MAP
}

export function autoSelectOracle(market: string): ProjectId | null {
  const upperMarket = market.toUpperCase()
  
  if (isMarketAvailableInMuxV3(upperMarket)) {
    return ProjectId.MUX_V3
  }
  
  if (isMarketAvailableInGains(upperMarket)) {
    return ProjectId.GAINS
  }
  
  return null
}


export function getAvailableOraclesForMarket(market: string): ProjectId[] {
  const upperMarket = market.toUpperCase()
  const oracles: ProjectId[] = []
  
  if (isMarketAvailableInMuxV3(upperMarket)) {
    oracles.push(ProjectId.MUX_V3)
  }
  
  if (isMarketAvailableInGains(upperMarket)) {
    oracles.push(ProjectId.GAINS)
  }
  
  return oracles
}

