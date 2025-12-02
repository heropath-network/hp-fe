import { computed, readonly, Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { UserEvaluationsKey, AccountShowInLeaderboardKey, UserPayoutsKey, UserWithdrawalHistoryKey } from './keys'
import { EMPTY_ADDRESS } from '@/constants'
import { UserEvaluation, UserPayouts, UserWithdrawalHistory } from '@/types/heroPath'

export function useAccountShowInLeaderboard(address: Ref<string | undefined>) {
  const key = computed(() => {
    return AccountShowInLeaderboardKey.replace('{addr}', address.value ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<boolean>(key, true)

  return storage
}

export function useUserEvaluationsStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserEvaluationsKey.replace('{addr}', address.value ?? EMPTY_ADDRESS)
  })

  const storage = useLocalStorage<UserEvaluation[]>(key, [])

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
            showDrawdown: show,
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

export function useUserPayoutsStorage(address: Ref<string | undefined>) {
  const key = computed(() => {
    return UserPayoutsKey.replace('{addr}', address.value ?? EMPTY_ADDRESS)
  })

  const defaultPayouts: UserPayouts = { withdrawnAmount: 0 }

  const storage = useLocalStorage<UserPayouts>(key, defaultPayouts)

  function clear() {
    storage.value = defaultPayouts
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
    return UserWithdrawalHistoryKey.replace('{addr}', address.value ?? EMPTY_ADDRESS)
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
