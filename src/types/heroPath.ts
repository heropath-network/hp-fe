import { EvaluationStep1Config, EvaluationStep2Config } from './evaluation'

export interface UserEvaluation {
  accountId: string
  evaluationConfig: EvaluationStep1Config | EvaluationStep2Config
  accountType: 'funded' | 'evaluation'
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
