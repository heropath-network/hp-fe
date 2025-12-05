<script setup lang="ts">
import { ref, Ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router'
import BaseIcon from '@/components/BaseIcon.vue'

enum MenuItem {
  Dashboard = 'Dashboard',
  Profile = 'Profile',
  Evaluation = 'Evaluation',
  Quest = 'Quest',
  Prizes = 'Prizes',
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
    icon: 'menu-dashboard',
    routeName: ROUTE_NAMES.Dashboard,
  },

  {
    id: MenuItem.Evaluation,
    label: 'Evaluation',
    icon: 'menu-evaluation',
    routeName: ROUTE_NAMES.Evaluation,
  },
  {
    id: MenuItem.Quest,
    label: 'Quest',
    icon: 'menu-quest',
    routeName: ROUTE_NAMES.Quest,
  },
  {
    id: MenuItem.Prizes,
    label: 'Prizes',
    icon: 'menu-prizes',
    routeName: ROUTE_NAMES.Prizes,
  },
  {
    id: MenuItem.Profile,
    label: 'Profile',
    icon: 'menu-profit',
    routeName: ROUTE_NAMES.Profile,
  },
  {
    id: MenuItem.TradingEducation,
    label: 'Trading & Education',
    icon: 'menu-tradingEdu',
    routeName: ROUTE_NAMES.TradingEducation,
  },
  {
    id: MenuItem.Leaderboard,
    label: 'Leaderboard',
    icon: 'menu-leaderboard',
    routeName: ROUTE_NAMES.Leaderboard,
  },
  {
    id: MenuItem.Ecosystem,
    label: 'Ecosystem Dashboard',
    icon: 'menu-ecosystem',
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

watch(
  () => route.name,
  (routeName) => {
    if (routeName && routeName !== ROUTE_NAMES.Trade) {
      initializeActiveItem()
    }
  },
  { immediate: true },
)
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
        class="group flex w-full items-center gap-3 px-3 py-3 text-left transition"
        :class="
          item.id === activeItemId
            ? 'text-[var(--hp-primary-green)]'
            : 'hover:bg-[var(--hp-line-color)] hover:text-[var(--hp-white-color)]'
        "
      >
        <BaseIcon
          :name="item.icon"
          size="20"
          class="shrink-0 transition-colors"
          :class="
            item.id === activeItemId
              ? 'text-[var(--hp-primary-green)] stroke-[var(--hp-primary-green)]'
              : 'text-[var(--hp-text-color)] group-hover:text-[var(--hp-white-color)]'
          "
        />
        <span
          class="text-[14px] font-semibold"
          :class="
            item.id === activeItemId
              ? 'text-[var(--hp-primary-green)]'
              : 'text-[var(--hp-text-color)] group-hover:text-[var(--hp-white-color)]'
          "
        >
          {{ item.label }}
        </span>
      </button>
    </nav>
  </aside>
</template>
