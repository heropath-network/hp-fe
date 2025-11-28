<script setup lang="ts">
import { ref, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import privateIcon from "@/assets/icons/menu/privateProfit.svg";
import publicIcon from "@/assets/icons/menu/publicProfile.svg";
import dashboardIcon from "@/assets/icons/menu/dashboard.svg";
import certificatesIcon from "@/assets/icons/menu/certificates.svg";
import buyEvaluationIcon from "@/assets/icons/menu/buyEvaluation.svg";
import settingsIcon from "@/assets/icons/menu/setting.svg";
import payoutsIcon from "@/assets/icons/menu/payouts.svg";
import faqIcon from "@/assets/icons/menu/faq.svg";
import leaderboardIcon from "@/assets/icons/menu/leaderboard.svg";
import { ROUTE_NAMES } from "@/router";
import { tryOnBeforeMount } from "@vueuse/core";

enum MenuItem {
  PrivateProfile = "Private Profile",
  PublicProfile = "Public Profile",
  Dashboard = "Dashboard",
  Certificates = "Certificates",
  BuyEvaluation = "Buy Evaluation",
  Settings = "Settings",
  Payouts = "Payouts",
  FAQ = "FAQ",
  Leaderboard = "Leaderboard",
}

const DefaultMenuItemId = MenuItem.PrivateProfile;

const router = useRouter();
const route = useRoute();

const menuItems = [
  {
    id: MenuItem.PrivateProfile,
    label: "Private Profile",
    icon: privateIcon,
    routeName: ROUTE_NAMES.PrivateProfile,
  },
  {
    id: MenuItem.PublicProfile,
    label: "Public Profile",
    icon: publicIcon,
    routeName: ROUTE_NAMES.PublicProfile,
  },
  {
    id: MenuItem.Dashboard,
    label: "Dashboard",
    icon: dashboardIcon,
    routeName: ROUTE_NAMES.Dashboard,
  },
  {
    id: MenuItem.Certificates,
    label: "Certificates",
    icon: certificatesIcon,
    routeName: ROUTE_NAMES.Certificates,
  },
  {
    id: MenuItem.BuyEvaluation,
    label: "Buy Evaluation",
    icon: buyEvaluationIcon,
    routeName: ROUTE_NAMES.BuyCredits,
  },
  {
    id: MenuItem.Settings,
    label: "Settings",
    icon: settingsIcon,
    routeName: ROUTE_NAMES.Settings,
  },
  {
    id: MenuItem.Payouts,
    label: "Payouts",
    icon: payoutsIcon,
    routeName: ROUTE_NAMES.Payouts,
  },
  { id: MenuItem.FAQ, label: "FAQ", icon: faqIcon, routeName: ROUTE_NAMES.FAQ },
  {
    id: MenuItem.Leaderboard,
    label: "Leaderboard",
    icon: leaderboardIcon,
    routeName: ROUTE_NAMES.Leaderboard,
  },
];

const activeItemId: Ref<MenuItem> = ref(MenuItem.PrivateProfile);

function switchActiveItem(itemId: MenuItem) {
  const selectedItem = menuItems.find((item) => item.id === itemId);
  if (selectedItem) {
    activeItemId.value = itemId;
    router.push({ name: selectedItem.routeName });
  }
}

function initializeActiveItem() {
  const routeName = route.name;
  const foundItem = menuItems.find((item) => item.routeName === routeName);
  if (foundItem) {
    activeItemId.value = foundItem.id;
  } else {
    activeItemId.value = DefaultMenuItemId;
    const defaultMenuItem = menuItems.find(
      (item) => item.id === DefaultMenuItemId
    );
    router.push({ name: defaultMenuItem!.routeName });
  }
}

tryOnBeforeMount(() => {
  initializeActiveItem();
});
</script>

<template>
  <aside
    class="fixed left-0 top-16 z-20 h-[calc(100vh-64px)] w-[248px] overflow-y-auto border-r border-[var(--hp-line-color)] bg-[var(--hp-bg-dark)] px-6 pt-10 text-sm text-[var(--hp-text-color)]"
  >
    <nav class="space-y-2">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="switchActiveItem(item.id)"
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition"
        :class="
          item.id === activeItemId
            ? 'bg-[var(--hp-line-color)] text-[var(--hp-primary-green)]'
            : 'hover:bg-[var(--hp-line-color)] hover:text-[var(--hp-white-color)]'
        "
      >
        <span
          class="icon-mask"
          :style="{
            '--icon-url': `url(${item.icon})`,
            color:
              item.id === activeItemId
                ? 'var(--hp-primary-green)'
                : 'var(--hp-text-color)',
          }"
        />
        <span
          class="text-[14px] font-semibold"
          :class="
            item.id === activeItemId
              ? 'text-[var(--hp-primary-green)]'
              : 'text-[var(--hp-text-color)]'
          "
        >
          {{ item.label }}
        </span>
      </button>
    </nav>
  </aside>
</template>
