import { createRouter, createWebHashHistory } from "vue-router";
import WalletView from "@/templates/WalletView.vue";

const ROUTER_LIST = [
  {
    path: "/",
    name: "home",
    component: WalletView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: ROUTER_LIST,
});

export default router;
