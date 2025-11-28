import { createRouter, createWebHashHistory } from "vue-router";
import PrivateProfile from "@/templates/PrivateProfile/PrivateProfile.vue";
import PublicProfile from "@/templates/PublicProfile/PublicProfile.vue";
import Dashboard from "@/templates/Dashboard/Dashboard.vue";
import Certificates from "@/templates/Certificates/Certificates.vue";
import BuyEvaluation from "@/templates/BuyEvaluation/BuyEvaluation.vue";
import Setting from "@/templates/Setting/Setting.vue";
import Payouts from "@/templates/Payouts/Payouts.vue";
import FAQ from "@/templates/FAQ/FAQ.vue";
import Leaderboard from "@/templates/Leaderboard/Leaderboard.vue";

export enum ROUTE_NAMES {
  PrivateProfile = "private profile",
  PublicProfile = "public profile",
  Dashboard = "dashboard",
  Certificates = "certificates",
  BuyCredits = "buy credits",
  Settings = "settings",
  Payouts = "payouts",
  FAQ = "faq",
  Leaderboard = "leaderboard",
}

const ROUTER_LIST = [
  {
    path: "/",
    redirect: "/private-profile",
  },
  {
    path: "/private-profile",
    name: ROUTE_NAMES.PrivateProfile,
    component: PrivateProfile,
  },
  {
    path: "/public-profile",
    name: ROUTE_NAMES.PublicProfile,
    component: PublicProfile,
  },
  {
    path: "/dashboard",
    name: ROUTE_NAMES.Dashboard,
    component: Dashboard,
  },
  {
    path: "/certificates",
    name: ROUTE_NAMES.Certificates,
    component: Certificates,
  },
  {
    path: "/buy-evaluation",
    name: ROUTE_NAMES.BuyCredits,
    component: BuyEvaluation,
  },
  {
    path: "/settings",
    name: ROUTE_NAMES.Settings,
    component: Setting,
  },
  {
    path: "/payouts",
    name: ROUTE_NAMES.Payouts,
    component: Payouts,
  },
  {
    path: "/faq",
    name: ROUTE_NAMES.FAQ,
    component: FAQ,
  },
  {
    path: "/leaderboard",
    name: ROUTE_NAMES.Leaderboard,
    component: Leaderboard,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: ROUTER_LIST,
});

export default router;
