import { watch, ref } from 'vue'
import { useConnection } from '@wagmi/vue'
import { UserEvaluation, UserWithdrawalHistory } from '@/types/heroPath'
import { EvaluationPlan } from '@/types/evaluation'
import { useUserWithdrawalHistoryStorage, useUserEvaluationsStorage } from '@/storages/heroPath'

const mockEvaluation: Record<string, UserEvaluation[]> = {
  ['0xfe4493ce82fee8dcf1a4ea59026509237fc4cf75'.toLowerCase()]: [
    {
      accountId: '891322',
      evaluationConfig: {
        level: 2,
        accountSize: 10000,
        profitGoal: 1200,
        fee: 90,
      },
      plan: EvaluationPlan.WarriorPlan,
      accountType: 'funded',
      accountStatus: 'active',
      displayStatus: {
        showDashboard: true,
        showPublic: true,
      },
      timestamp: 1764923000,
    },
  ],
  ['0xadda9017fd0e032001f6c3520770d922606c096d'.toLowerCase()]: [
    {
      accountId: '890332',
      evaluationConfig: {
        level: 2,
        accountSize: 10000,
        profitGoal: 1200,
        fee: 90,
      },
      plan: EvaluationPlan.WarriorPlan,
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

const mockWithdrawals: Record<string, UserWithdrawalHistory[]> = {
  ['0xadda9017fd0e032001f6c3520770d922606c096d'.toLowerCase()]: [
    {
      id: 'with-176495799aaslkkjljn9',
      timestamp: 1764957979,
      amount: 794.61,
      address: '0xadda9017fd0e032001f6c3520770d922606c096d',
      status: 'success',
      tokenSymbol: 'HERO',
    },
  ],
}

export function useInitialSetMockWithdrawals() {
  const { address } = useConnection()

  function initialSetMockEvaluations(addr: string) {
    const { data: useWithdrawalHistory, addWithdrawalHistory } = useUserWithdrawalHistoryStorage(ref(addr))
    const existingWithdrawals = useWithdrawalHistory.value.map((e) => e.id)
    const mockWithdraws = mockWithdrawals[addr.toLowerCase()] || []
    mockWithdraws.forEach((withdrawItem) => {
      if (!existingWithdrawals.includes(withdrawItem.id)) {
        addWithdrawalHistory(withdrawItem)
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
