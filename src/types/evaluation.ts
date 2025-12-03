export enum EvaluationPlan {
  ChampionPlan = 'ChampionPlan',
  HeroPlan = 'HeroPlan',
  LegendPlan = 'LegendPlan',
}

export interface EvaluationConfig {
  level: number
  accountSize: number
  profitSplit: number
  profitGoal: number
  maxDailyLoss: number
  maxDrawdown: number
  leverage: number
  fee: number
}
