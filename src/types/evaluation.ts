export enum EvaluationPlan {
  ChampionPlan = 'ChampionPlan',
  HeroPlan = 'HeroPlan',
  LegendPlan = 'LegendPlan',
}

export interface EvaluationGlobalConfig {
  profitSplit: number
  maxDailyLoss: number
  maxDrawdown: number
  leverage: number
}

export interface EvaluationConfig {
  level: number
  accountSize: number
  profitGoal: number
  fee: number
}
