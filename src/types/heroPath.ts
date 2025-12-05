import { EvaluationConfig, EvaluationPlan } from './evaluation'

export interface UserEvaluation {
  accountId: string
  evaluationConfig: EvaluationConfig
  plan: EvaluationPlan
  accountType: 'funded' | 'evaluation' | 'trading'
  accountStatus: 'active' | 'inactive'
  displayStatus: {
    showDashboard: boolean
    showPublic: boolean
  }
  timestamp: number
}

export interface UserWithdrawalHistory {
  timestamp: number
  amount: number
  address: string
  status: 'success' | 'pending' | 'failed'
  tokenSymbol: string
}

export interface UserPrizes {
  withdrawnAmount: number
}

export enum QuestTaskId {
  TradeAster = 'trade-aster',
  SwapPancake = 'swap-pancake',
  DepositVenus = 'deposit-venus',
  TradeMeme = 'trade-meme',
}

export interface QuestDiscount {
  id: string
  isUsed: boolean
}
