import { watch, ref } from 'vue'
import { useConnection } from '@wagmi/vue'
import { UserEvaluation } from '@/types/heroPath'
import { useUserEvaluationsStorage } from '@/storages/heroPath'

export const mockEvaluation: Record<string, UserEvaluation[]> = {
  ['0xfe4493ce82fee8dcf1a4ea59026509237fc4cf75'.toLowerCase()]: [
    {
      accountId: '890332',
      evaluationConfig: {
        level: 2,
        accountSize: 10000,
        profitGoal: 1000,
        fee: 110,
      },
      accountType: 'funded',
      accountStatus: 'active',
      displayStatus: {
        showDashboard: true,
        showPublic: true,
      },
      timestamp: 1764923000,
    },
  ],
}

export function useInitialSetMockEvaluations() {
  const { address } = useConnection()

  function initialSetMockEvaluations(addr: string) {
    const { data: userEvaluations, addEvaluation } = useUserEvaluationsStorage(ref(addr))
    const existingEvals = userEvaluations.value.map((e) => e.accountId)
    const mockEvals = mockEvaluation[addr.toLowerCase()] || []
    mockEvals.forEach((evalItem) => {
      if (!existingEvals.includes(evalItem.accountId)) {
        addEvaluation(evalItem)
      }
    })
  }

  watch(
    () => address.value,
    (newAddress) => {
      if (newAddress) {
        initialSetMockEvaluations(newAddress.toLowerCase())
      }
    },
    { immediate: true },
  )
}
