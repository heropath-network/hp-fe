import { EvaluationGlobalConfig } from './../types/evaluation'
import { EvaluationPlan, EvaluationConfig } from '@/types/evaluation'

export const EvaluationGlobalConfigInfo: EvaluationGlobalConfig = {
  profitSplit: 90,
  maxDailyLoss: 5,
  maxDrawdown: 10,
  leverage: 5,
}

const ChampionPlan: EvaluationConfig[] = [
  {
    level: 1,
    accountSize: 5000,
    profitGoal: 500,
    fee: 60,
  },
  {
    level: 2,
    accountSize: 10000,
    profitGoal: 1000,
    fee: 110,
  },
  {
    level: 3,
    accountSize: 25000,
    profitGoal: 2500,
    fee: 275,
  },
  {
    level: 4,
    accountSize: 50000,
    profitGoal: 5000,
    fee: 495,
  },
  {
    level: 5,
    accountSize: 100000,
    profitGoal: 10000,
    fee: 999,
  },
]

const WarriorPlan: EvaluationConfig[] = [
  {
    level: 1,
    accountSize: 5000,
    profitGoal: 600,
    fee: 50,
  },
  {
    level: 2,
    accountSize: 10000,
    profitGoal: 1200,
    fee: 90,
  },
  {
    level: 3,
    accountSize: 25000,
    profitGoal: 3000,
    fee: 200,
  },
  {
    level: 4,
    accountSize: 50000,
    profitGoal: 6000,
    fee: 375,
  },
  {
    level: 5,
    accountSize: 100000,
    profitGoal: 12000,
    fee: 750,
  },
  {
    level: 6,
    accountSize: 200000,
    profitGoal: 24000,
    fee: 1500,
  },
]

const LegendPlan: EvaluationConfig[] = [
  {
    level: 1,
    accountSize: 5000,
    profitGoal: 450,
    fee: 45,
  },
  {
    level: 2,
    accountSize: 10000,
    profitGoal: 600,
    fee: 85,
  },
  {
    level: 3,
    accountSize: 25000,
    profitGoal: 2250,
    fee: 190,
  },
  {
    level: 4,
    accountSize: 50000,
    profitGoal: 4500,
    fee: 360,
  },
  {
    level: 5,
    accountSize: 100000,
    profitGoal: 9000,
    fee: 720,
  },
  {
    level: 6,
    accountSize: 200000,
    profitGoal: 18000,
    fee: 1440,
  },
]

export const EvaluationPlanConfig: { [key in EvaluationPlan]: EvaluationConfig[] } = {
  [EvaluationPlan.ChampionPlan]: ChampionPlan,
  [EvaluationPlan.WarriorPlan]: WarriorPlan,
  [EvaluationPlan.LegendPlan]: LegendPlan,
}
