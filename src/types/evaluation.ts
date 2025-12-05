export enum EvaluationPlan {
  ChampionPlan = 'ChampionPlan',
  WarriorPlan = 'WarriorPlan',
  LegendPlan = 'LegendPlan',
}

export interface EvaluationPlanBaseConfig {
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
