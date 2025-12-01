import { ref } from 'vue'
import { useGainsWebSocketPrice } from './useGainsWebSocketPrice'
import { GAINS_PAIR_INDEX_MAP } from '../constants'

const BNB_PAIR_INDEX = GAINS_PAIR_INDEX_MAP['BNB/USD']

export function useBnbUsdPrice(refreshInterval = 200) {
  const pairIndexRef = ref(BNB_PAIR_INDEX)
  const { price, status, isConnected } = useGainsWebSocketPrice(pairIndexRef, refreshInterval)

  return {
    price,
    status,
    isConnected,
  }
}
