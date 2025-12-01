import { EvaluationStep1Config, EvaluationStep2Config } from './evaluation'

export interface UserEvaluation {
  accountId: number
  evaluationConfig: EvaluationStep1Config | EvaluationStep2Config
  accountType: 'allocation' | 'evaluation'
  accountStatus: 'active' | 'inactive'
}
