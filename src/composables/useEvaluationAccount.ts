import { computed, ref, watch } from 'vue'
import { useConnection } from '@wagmi/vue'
import { useUserEvaluationsStorage } from '@/storages/heroPath'

/**
 * Composable for managing evaluation account selection and balance calculations
 * Used in both Dashboard and TradeHeader to maintain consistent logic
 */
export function useEvaluationAccount() {
  const { address } = useConnection()
  const { data: evaluations } = useUserEvaluationsStorage(address)

  const evaluationList = computed(() => {
    return evaluations.value || []
  })

  // Get selected evaluation
  const selectedEvaluationId = ref<string | null>(null)
  const selectedEvaluation = computed(
    () => evaluationList.value.find((evaluation) => evaluation.accountId === selectedEvaluationId.value) || null,
  )

  // Calculate account size
  const accountSize = computed(() => {
    if (!selectedEvaluation.value) {
      return 0
    }
    return selectedEvaluation.value.evaluationConfig.accountSize
  })

  // Calculate PnL (TODO: Calculate actual PnL from positions/trades)
  const pnl = computed(() => {
    // TODO: Calculate actual PnL from positions/trades for this specific account
    return 0
  })

  // Calculate account balance (accountSize + pnl)
  const accountBalance = computed(() => {
    if (!selectedEvaluation.value) {
      return 0
    }
    return selectedEvaluation.value.evaluationConfig.accountSize + pnl.value
  })

  // Prior day balance (for daily loss calculations)
  const priorDayBalance = computed(() => {
    if (!selectedEvaluation.value) {
      return 0
    }
    return selectedEvaluation.value.evaluationConfig.accountSize
  })

  // Watch for changes in evaluation list and auto-select first one
  watch(
    evaluationList,
    (list) => {
      if (!list.length) {
        selectedEvaluationId.value = null
        return
      }
      if (!selectedEvaluationId.value || !list.some((item) => item.accountId === selectedEvaluationId.value)) {
        selectedEvaluationId.value = list[0].accountId
      }
    },
    { immediate: true },
  )

  function selectEvaluation(id: string) {
    selectedEvaluationId.value = id
  }

  return {
    evaluations,
    evaluationList,
    selectedEvaluationId,
    selectedEvaluation,
    accountSize,
    pnl,
    accountBalance,
    priorDayBalance,
    selectEvaluation,
  }
}

