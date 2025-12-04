<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useConnection } from '@wagmi/vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/BaseIcon.vue'
import { generateUUID } from '@/utils/common'
import { QuestTaskId } from '@/types/heroPath'
import TradeAsterIcon from '@/assets/icons/quest/tradeAster.svg'
import SwapPancakeIcon from '@/assets/icons/quest/swapPancake.svg'
import DepositVenusIcon from '@/assets/icons/quest/depositVenus.svg'
import TradeMemeIcon from '@/assets/icons/quest/tradeMeme.svg'
import TradingLogoIcon from '@/assets/icons/quest/tradingLogo.svg'
import { useUserQuestTaskStatusStorage, useUserQuestDiscountStatusStorage } from '@/storages/heroPath'
import { ROUTE_NAMES } from '@/router'

type QuestTask = {
  id: QuestTaskId
  title: string
  description?: string
  icon: string
  status: 'pending' | 'completed'
}

const router = useRouter()

// Responsive container width handling
const containerDom = ref<HTMLElement | null>(null)
const containerWidth = ref(0)

function updateContainerWidth() {
  if (containerDom.value) {
    containerWidth.value = containerDom.value.clientWidth
  }
}

watch(
  containerDom,
  (newVal, _, onCleanup) => {
    if (newVal) {
      updateContainerWidth()
      const handler = () => updateContainerWidth()
      window.addEventListener('resize', handler)
      onCleanup(() => {
        window.removeEventListener('resize', handler)
      })
    }
  },
  { immediate: true },
)
watch(containerDom, (newVal) => {
  if (newVal) {
    containerWidth.value = newVal.clientWidth
  }
})
// End of responsive container width handling

const { isConnected, address } = useConnection()

const { data: taskStatus, updateTaskStatus, clear: clearTaskStatus } = useUserQuestTaskStatusStorage(address)
const { addDiscountStatus } = useUserQuestDiscountStatusStorage(address)

const tasks = ref<QuestTask[]>([
  {
    id: QuestTaskId.TradeAster,
    title: 'Long/Short 2 markets on Aster with more than $50 collateral',
    description: 'Long/Short 2 markets on Aster with more than $50 collateral.',
    status: 'pending',
    icon: TradeAsterIcon,
  },
  {
    id: QuestTaskId.SwapPancake,
    title: 'Swap on Pancake for more than 5 times',
    description: 'Swap on Pancake for more than 5 times.',
    status: 'pending',
    icon: SwapPancakeIcon,
  },
  {
    id: QuestTaskId.DepositVenus,
    title: 'Deposit more than $50 on Venus protocol for more than 1 week',
    description: 'Deposit more than $50 on Venus protocol for more than 1 week.',
    status: 'pending',
    icon: DepositVenusIcon,
  },
  {
    id: QuestTaskId.TradeMeme,
    title: 'Trade 5 meme coins on Four.meme',
    description: 'Trade 5 meme coins on Four.meme.',
    status: 'pending',
    icon: TradeMemeIcon,
  },
])

const allTasksIsCompleted = computed(() => {
  return tasks.value.every((task) => task.status === 'completed')
})

const openTasks = ref<Set<QuestTaskId>>(new Set([QuestTaskId.TradeMeme]))

function toggleTask(id: QuestTaskId) {
  const next = new Set(openTasks.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  openTasks.value = next
}

function isOpen(id: QuestTaskId) {
  return openTasks.value.has(id)
}

function setAllTasksCompleted() {
  if (!isConnected.value || allTasksIsCompleted.value) {
    return
  }
  tasks.value = tasks.value.map((task) => ({ ...task, status: 'completed' }))
  tasks.value.forEach((task) => {
    updateTaskStatus(task.id, true)
  })
  addDiscountStatus({
    id: generateUUID(),
    isUsed: false,
  })
}

function resetAllTasksCompleted() {
  if (!isConnected.value || !allTasksIsCompleted.value) {
    return
  }
  tasks.value = tasks.value.map((task) => ({ ...task, status: 'pending' }))
  tasks.value.forEach((task) => {
    updateTaskStatus(task.id, true)
  })
  clearTaskStatus()
}

function initialTaskStatus() {
  const v = tasks.value.map((task) => {
    const completed = taskStatus.value ? taskStatus.value[task.id] : false
    return {
      ...task,
      status: completed ? 'completed' : 'pending',
    }
  })
  const isAllCompleted = v.every((task) => task.status === 'completed')
  if (isAllCompleted) {
    openTasks.value.add(QuestTaskId.TradeMeme)
  }
  tasks.value = v as QuestTask[]
}

watch(
  address,
  () => {
    initialTaskStatus()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <section ref="containerDom" class="mt-4 flex flex-col gap-6 pb-28 text-[var(--hp-white-color)]">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold leading-8">Hero's Rebirth - Get Evaluation Discounts</h1>
      <p class="text-sm leading-5 text-[var(--hp-text-color)]">
        Complete the following tasks to get a discounted
        <span @click="resetAllTasksCompleted">evaluation</span>
        <span @click="setAllTasksCompleted"> opportunity</span>.
      </p>
    </header>

    <div class="flex items-center gap-2 text-sm leading-5 text-[var(--hp-text-color)]">
      <BaseIcon name="time" size="16" class="text-[var(--hp-text-color)]" />
      <span>2025/12/05 00:00- 2026/01/05 16:00 GMT+0</span>
    </div>

    <div class="flex flex-col gap-4">
      <article v-for="task in tasks" :key="task.id" class="bg-[var(--hp-bg-normal)]">
        <button
          type="button"
          class="flex w-full items-center justify-between px-6 py-5 text-left group"
          @click="toggleTask(task.id)"
        >
          <div class="flex items-center gap-6">
            <BaseIcon
              name="arrow"
              size="16"
              class="shrink-0 transition-transform text-[var(--hp-text-color)] group-hover:text-[var(--hp-primary-green)]"
              :class="[isOpen(task.id) ? 'rotate-180' : '']"
            />

            <div class="flex items-center gap-3">
              <img :src="task.icon" alt="" class="w-[24px] h-[24px]" />
              <p class="text-base font-medium leading-6">{{ task.title }}</p>
            </div>
          </div>

          <template v-if="task.status === 'completed'">
            <BaseIcon name="completed" size="18" class="text-[var(--hp-primary-green)]" />
          </template>
          <template v-else>
            <BaseIcon
              name="retry"
              size="18"
              class="text-[var(--hp-text-color)] transition-colors hover:text-[var(--hp-primary-green)]"
              @click.stop="() => {}"
            />
          </template>
        </button>

        <div v-if="isOpen(task.id)" class="px-14 pb-5 ml-[10px] text-sm leading-5 text-[var(--hp-text-color)]">
          {{ task.description }}
        </div>
      </article>
    </div>
  </section>

  <div class="fixed bottom-4 absolute-translate-x-1/2" :style="{ width: `${containerWidth}px` }" role="presentation">
    <div
      class="flex items-center justify-between relative bg-[var(--hp-bg-normal)] h-[100px] px-6 py-5 shadow-lg shadow-black/40"
    >
      <img :src="TradingLogoIcon" alt="" class="w-[96px] h-[96px] absolute left-6 top-[-20px] z-[1]" />
      <p class="text-xl font-semibold leading-7 pl-[12%]">A Free Evaluation Opportunity</p>
      <template v-if="allTasksIsCompleted">
        <button
          type="button"
          class="flex items-center gap-2 bg-[var(--hp-primary-green)] px-6 py-[14px] text-base font-medium text-[var(--hp-black-color)] transition hover:bg-[var(--hp-primary-green-hover)]"
          @click="
            () => {
              router.push({ name: ROUTE_NAMES.Evaluation })
            }
          "
        >
          Discounted Evaluation
          <BaseIcon name="arrow" size="18" class="rotate-[270deg] text-[var(--hp-black-color)]" />
        </button>
      </template>
      <template v-else>
        <span class="font-[600] leading-6 text-[18px] text-[var(--hp-text-color)]"> Tasks Incomplete </span>
      </template>
    </div>
  </div>
</template>
