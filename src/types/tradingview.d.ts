/// <reference types="../vendor/charting_library/charting_library/charting_library" />

export type Bar = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type ResolutionString = string

// Declare TradingView as global namespace
declare global {
  namespace TradingView {
    // Re-export all TradingView types as available globally
  }
  
  const TradingView: any
}
