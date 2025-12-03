import { EvaluationConfig } from './evaluation'

export interface UserEvaluation {
  accountId: string
  evaluationConfig: EvaluationConfig
  accountType: 'funded' | 'evaluation' | 'trading'
  accountStatus: 'active' | 'inactive'
  displayStatus: {
    showDrawdown: boolean
    showPublic: boolean
  }
  timestamp: number
}

export interface UserWithdrawalHistory {
  timestamp: number
  amount: number
  address: string
  status: 'success' | 'pending' | 'failed'
}

export interface UserPayouts {
  withdrawnAmount: number
}

export enum QuestTaskId {
  FollowX = 'follow-x',
  TradePerp = 'trade-perp',
  SwapPancake = 'swap-pancake',
  TradeMeme = 'trade-meme',
}

export interface QuestDiscount {
  id: string
  isUsed: boolean
}
