import { computed, readonly, Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { UserEvaluationsKey } from './keys'
import { EMPTY_ADDRESS } from '@/constants'
import { UserEvaluation } from '@/types/heroPath'

export function useAccountShowInLeaderboard(address: Ref<string | undefined>) {
  const key = computed(() => {
    return `heroPath:accountShowInLeaderboard:${address.value ?? EMPTY_ADDRESS}`
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
