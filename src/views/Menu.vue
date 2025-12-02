<script setup lang="ts">
import { ref, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router'
import { tryOnBeforeMount } from '@vueuse/core'
import dashboardIcon from '@/assets/icons/menu/dashboard.svg'
import leaderboardIcon from '@/assets/icons/menu/leaderboard.svg'
import profitIcon from '@/assets/icons/menu/profit.svg'
import evaluationIcon from '@/assets/icons/menu/evaluation.svg'
import payoutsIcon from '@/assets/icons/menu/payouts.svg'
import questIcon from '@/assets/icons/menu/quest.svg'
import tradingEduIcon from '@/assets/icons/menu/tradingEdu.svg'
import ecosystemIcon from '@/assets/icons/menu/ecosystem.svg'

enum MenuItem {
  Dashboard = 'Dashboard',
  Profile = 'Profile',
  Evaluation = 'Evaluation',
  Quest = 'Quest',
  Payouts = 'Payouts',
  TradingEducation = 'TradingEducation',
  Leaderboard = 'Leaderboard',
  Ecosystem = 'Ecosystem',
}

const DefaultMenuItemId = MenuItem.Dashboard

const router = useRouter()
const route = useRoute()

const menuItems = [
  {
    id: MenuItem.Dashboard,
    label: 'Dashboard',
    icon: dashboardIcon,
    routeName: ROUTE_NAMES.Dashboard,
  },
  {
    id: MenuItem.Profile,
    label: 'Profile',
    icon: profitIcon,
    routeName: ROUTE_NAMES.Profile,
  },
  {
    id: MenuItem.Evaluation,
    label: 'Evaluation',
    icon: evaluationIcon,
    routeName: ROUTE_NAMES.Evaluation,
  },
  {
    id: MenuItem.Quest,
    label: 'Quest',
    icon: questIcon,
    routeName: ROUTE_NAMES.Quest,
  },
  {
    id: MenuItem.Payouts,
    label: 'Payouts',
    icon: payoutsIcon,
    routeName: ROUTE_NAMES.Payouts,
  },
  {
    id: MenuItem.TradingEducation,
    label: 'Trading & Education',
    icon: tradingEduIcon,
    routeName: ROUTE_NAMES.TradingEducation,
  },
  {
    id: MenuItem.Leaderboard,
    label: 'Leaderboard',
    icon: leaderboardIcon,
    routeName: ROUTE_NAMES.Leaderboard,
  },
  {
    id: MenuItem.Ecosystem,
    label: 'Ecosystem & Dashboard',
    icon: ecosystemIcon,
    routeName: ROUTE_NAMES.Ecosystem,
  },
]

const activeItemId: Ref<MenuItem> = ref(MenuItem.Dashboard)

function switchActiveItem(itemId: MenuItem) {
  const selectedItem = menuItems.find((item) => item.id === itemId)
  if (selectedItem) {
    activeItemId.value = itemId
    router.push({ name: selectedItem.routeName })
  }
}

function initializeActiveItem() {
  const routeName = route.name
  const foundItem = menuItems.find((item) => item.routeName === routeName)
  if (foundItem) {
    activeItemId.value = foundItem.id
  } else {
    activeItemId.value = DefaultMenuItemId
    const defaultMenuItem = menuItems.find((item) => item.id === DefaultMenuItemId)
    router.push({ name: defaultMenuItem!.routeName })
  }
}

tryOnBeforeMount(() => {
  initializeActiveItem()
})
</script>

<template>
  <aside
    class="fixed left-0 top-16 z-20 h-[calc(100vh-64px)] w-[262px] overflow-y-auto bg-[var(--hp-bg-dark)] px-6 pt-10 text-sm text-[var(--hp-text-color)]"
  >
    <nav class="space-y-2">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="switchActiveItem(item.id)"
        type="button"
        class="flex w-full items-center gap-3 px-3 py-3 text-left transition"
        :class="
          item.id === activeItemId
            ? 'text-[var(--hp-primary-green)]'
            : 'hover:bg-[var(--hp-line-color)] hover:text-[var(--hp-white-color)]'
        "
      >
        <span
          class="icon-mask"
          :style="{
            '--icon-url': `url(${item.icon})`,
            color: item.id === activeItemId ? 'var(--hp-primary-green)' : 'var(--hp-text-color)',
          }"
        />
        <span
          class="text-[14px] font-semibold"
          :class="item.id === activeItemId ? 'text-[var(--hp-primary-green)]' : 'text-[var(--hp-text-color)]'"
        >
          {{ item.label }}
        </span>
      </button>
    </nav>
  </aside>
</template>
