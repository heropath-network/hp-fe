import { computed, readonly, Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import {
  UserEvaluationsKey,
  AccountShowInLeaderboardKey,
  UserPrizesKey,
  UserWithdrawalHistoryKey,
  UserQuestDiscountStatusKey,
  UserQuestTaskStatusKey,
  SelectedEvaluationAccountKey,
} from './keys'
import { EMPTY_ADDRESS } from '@/constants'
import { UserEvaluation, UserPrizes, UserWithdrawalHistory, QuestDiscount, QuestTaskId } from '@/types/heroPath'
import { inferPlanFromConfig } from '@/utils/evaluationPlan'

export function useAccountShowInLeaderboard(address: Ref<string | undefined>) {
  const key = computed(() => {
    return AccountShowInLeaderboardKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<boolean>(key, true)

  return storage
}

export function useUserEvaluationsStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserEvaluationsKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<UserEvaluation[]>(key, [])

  // Backfill missing plan values for legacy data if needed
  function hydrateEvaluationPlans() {
    let updated = false
    const hydrated = storage.value.map((evaluation) => {
      if (evaluation.plan) {
        return evaluation
      }
      const inferredPlan = inferPlanFromConfig(evaluation.evaluationConfig)
      if (!inferredPlan) {
        return evaluation
      }
      updated = true
      return {
        ...evaluation,
        plan: inferredPlan,
      }
    })
    if (updated) {
      storage.value = hydrated
    }
  }

  hydrateEvaluationPlans()

  function clear() {
    storage.value = []
  }

  function addEvaluation(evaluation: UserEvaluation) {
    storage.value = [...storage.value, evaluation]
  }

  function updateDisplayDrawdownStatus(accountId: string, show: boolean) {
    const evaluations = storage.value.map((evalItem) => {
      if (evalItem.accountId === accountId) {
        return {
          ...evalItem,
          displayStatus: {
            ...evalItem.displayStatus,
            showDashboard: show,
          },
        }
      }
      return evalItem
    })
    storage.value = evaluations
  }

  function updateDisplayPublicStatus(accountId: string, show: boolean) {
    const evaluations = storage.value.map((evalItem) => {
      if (evalItem.accountId === accountId) {
        return {
          ...evalItem,
          displayStatus: {
            ...evalItem.displayStatus,
            showPublic: show,
          },
        }
      }
      return evalItem
    })
    storage.value = evaluations
  }

  return {
    data: readonly(storage),
    clear,
    addEvaluation,
    updateDisplayDrawdownStatus,
    updateDisplayPublicStatus,
  }
}

export function useUserPrizesStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserPrizesKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const defaultPrizes: UserPrizes = { withdrawnAmount: 0 }

  const storage = useLocalStorage<UserPrizes>(key, defaultPrizes)

  function clear() {
    storage.value = defaultPrizes
  }

  function updateWithdrawnAmount(amount: number) {
    storage.value = {
      ...storage.value,
      withdrawnAmount: amount,
    }
  }

  return {
    data: readonly(storage),
    clear,
    updateWithdrawnAmount,
  }
}

export function useUserWithdrawalHistoryStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserWithdrawalHistoryKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<UserWithdrawalHistory[]>(key, [])

  function clear() {
    storage.value = []
  }

  function addWithdrawalHistory(history: UserWithdrawalHistory) {
    storage.value = [...storage.value, history]
  }

  return {
    data: readonly(storage),
    clear,
    addWithdrawalHistory,
  }
}

export function useUserQuestTaskStatusStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserQuestTaskStatusKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const defaultStatus: Record<QuestTaskId, boolean> = {
    [QuestTaskId.TradeAster]: false,
    [QuestTaskId.SwapPancake]: false,
    [QuestTaskId.DepositVenus]: false,
    [QuestTaskId.TradeMeme]: false,
  }

  const storage = useLocalStorage<Record<QuestTaskId, boolean>>(key, defaultStatus)

  function clear() {
    storage.value = defaultStatus
  }

  function updateTaskStatus(task: QuestTaskId, status: boolean) {
    storage.value = {
      ...storage.value,
      [task]: status,
    }
  }

  return {
    data: readonly(storage),
    clear,
    updateTaskStatus,
  }
}

export function useUserQuestDiscountStatusStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserQuestDiscountStatusKey.replace('{addr}', address.value?.toLowerCase() ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<QuestDiscount[]>(key, [])

  function clear() {
    storage.value = []
  }

  function addDiscountStatus(discount: QuestDiscount) {
    storage.value = [...storage.value, discount]
  }

  function updateDiscountStatus(id: string, isUsed: boolean) {
    const discounts = storage.value.map((discount) => {
      if (discount.id === id) {
        return {
          ...discount,
          isUsed,
        }
      }
      return discount
    })
    storage.value = discounts
  }

  return {
    data: readonly(storage),
    clear,
    addDiscountStatus,
    updateDiscountStatus,
  }
}

export function useSelectedEvaluationAccountStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return SelectedEvaluationAccountKey.replace('{addr}', address.value ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<string | null>(key, null)

  function setSelectedAccount(accountId: string | null) {
    storage.value = accountId
  }

  function clear() {
    storage.value = null
  }

  return {
    data: storage,
    setSelectedAccount,
    clear,
  }
}
