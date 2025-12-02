<template>
  <div
    class="flex items-center gap-[2px] px-2 py-1 absolute top-0 left-0 bg-[#373737]"
  >
    <div class="relative shrink-0 w-4 h-4">
      <img
        :src="chainIcon"
        :alt="chainName"
        class="block w-full h-full object-contain"
      />
    </div>
    <div class="text-[12px] leading-[16px] text-[#9b9b9b] font-normal whitespace-nowrap">
      {{ liquiditySourceName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { arbitrum, bsc, optimism } from '@wagmi/vue/chains'
import ArbitrumIcon from '@/assets/img/arbitrum.svg'
import BSCIcon from '@/assets/img/BSC.svg'
import OptimismIcon from '@/assets/img/optimism.svg'
import { LIQUIDITY_SOURCES, type LiquiditySourceId } from '@/constants/liquiditySources'

interface Props {
  chainId: number
  liquiditySource: LiquiditySourceId
}

const props = defineProps<Props>()

const chainConfig = {
  [bsc.id]: { name: 'BNB Chain', icon: BSCIcon },
  [arbitrum.id]: { name: 'Arbitrum', icon: ArbitrumIcon },
  [optimism.id]: { name: 'Optimism', icon: OptimismIcon },
}

const chainInfo = computed(() => {
  return chainConfig[props.chainId] || chainConfig[bsc.id] // Default to BNB Chain
})

const chainName = computed(() => chainInfo.value.name)
const chainIcon = computed(() => chainInfo.value.icon)

const liquiditySourceName = computed(() => {
  const source = LIQUIDITY_SOURCES.find((s) => s.id === props.liquiditySource)
  return source?.name || props.liquiditySource
})
</script>

