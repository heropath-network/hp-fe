import { EvaluationPlanConfig } from '@/config/evaluation'
import { EvaluationConfig, EvaluationPlan } from '@/types/evaluation'

/**
 * Infer the evaluation plan based on its configuration.
 * Returns null if no matching plan is found.
 */
export function inferPlanFromConfig(config: EvaluationConfig): EvaluationPlan | null {
  const matchedEntry = Object.entries(EvaluationPlanConfig).find(([, planConfig]) =>
    planConfig.levels.some(
      (level) =>
        level.level === config.level &&
        level.accountSize === config.accountSize &&
        level.profitGoal === config.profitGoal &&
        level.fee === config.fee,
    ),
  )

  return (matchedEntry?.[0] as EvaluationPlan) ?? null
}
