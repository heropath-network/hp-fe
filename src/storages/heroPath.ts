import { computed, readonly, Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { UserEvaluationsKey } from './keys'
import { EMPTY_ADDRESS } from '@/constants'
import { UserEvaluation } from '@/types/heroPath'

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

  return {
    data: readonly(storage),
    clear,
    addEvaluation,
  }
}
