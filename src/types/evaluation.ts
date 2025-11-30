export enum EvaluationSteps {
  Step1 = 'Step1',
  Step2 = 'Step2',
}

export enum EvaluationPlan {
  Classic = 'Classic',
  Pro = 'Pro',
  Turbo = 'Turbo',
}

export interface EvaluationStep1Config {
  level: number
  accountSize: number
  profitSplit: number
  step1Goal: number
  maxDailyLoss: number
  maxDrawdown: number
  leverage: number
  fee: number
}

export interface EvaluationStep2Config {
  level: number
  accountSize: number
  profitSplit: number
  step1Goal: number
  step2Goal: number
  maxDailyLoss: number
  maxDrawdown: number
  leverage: number
  fee: number
}
