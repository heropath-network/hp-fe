import { ResolutionString } from '@/types/tradingview'

export const DefaultSupportedResolutions: ResolutionString[] = [
  '1' as ResolutionString,
  '3' as ResolutionString,
  '5' as ResolutionString,
  '15' as ResolutionString,
  '30' as ResolutionString,
  '60' as ResolutionString,
  '240' as ResolutionString,
  '1D' as ResolutionString,
  '1W' as ResolutionString,
]

export function getProjectSupportedResolutions(): ResolutionString[] {
  return DefaultSupportedResolutions
}

