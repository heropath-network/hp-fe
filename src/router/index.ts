import { createRouter, createWebHistory } from 'vue-router'
import TradeView from "@/views/TradeView.vue";
import TcTestRemoveMeG from '@/views/TcTestRemoveMeG.vue'
import TcTestRemoveMeCFourMeme from '@/views/TcTestRemoveMeCFourMeme.vue'
import TcTestRemoveMeO from '@/views/TcTestRemoveMeO.vue'

export enum ROUTE_NAMES {
  Dashboard = 'dashboard',
  Profile = 'profile',
  Evaluation = 'evaluation',
  PurchaseEvaluation = 'purchase-evaluation',
  Quest = 'quest',
  Payouts = 'payouts',
  TradingEducation = 'trading-education',
  Leaderboard = 'leaderboard',
  Ecosystem = 'ecosystem',
  Trade = "trade",
}

const ROUTER_LIST: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: ROUTE_NAMES.Dashboard,
    component: () => import('@/templates/Dashboard/Dashboard.vue'),
  },
  {
    path: '/profile',
    name: ROUTE_NAMES.Profile,
    component: () => import('@/templates/Profile/Profile.vue'),
  },
  {
    path: '/evaluation',
    name: ROUTE_NAMES.Evaluation,
    component: () => import('@/templates/Evaluation/Evaluation.vue'),
  },
  {
    path: '/purchase-evaluation',
    name: ROUTE_NAMES.PurchaseEvaluation,
    component: () => import('@/templates/Evaluation/PurchaseEvaluation.vue'),
    meta: {
      hideMenu: true,
    },
  },
  {
    path: '/quest',
    name: ROUTE_NAMES.Quest,
    component: () => import('@/templates/Quest/Quest.vue'),
  },
  {
    path: '/payouts',
    name: ROUTE_NAMES.Payouts,
    component: () => import('@/templates/Payouts/Payouts.vue'),
  },
  {
    path: '/trading-education',
    name: ROUTE_NAMES.TradingEducation,
    component: () => import('@/templates/TradingEducation/TradingEducation.vue'),
  },
  {
    path: '/leaderboard',
    name: ROUTE_NAMES.Leaderboard,
    component: () => import('@/templates/Leaderboard/Leaderboard.vue'),
  },
  {
    path: '/ecosystem',
    name: ROUTE_NAMES.Ecosystem,
    component: () => import('@/templates/Ecosystem/Ecosystem.vue'),
  },
  {
    path: '/trade',
    name: ROUTE_NAMES.Trade,
    component: TradeView,
  },
  {
    path: '/tc-g',
    name: "tc-g",
    component: TcTestRemoveMeG,
  },
  {
    path: '/tc-c',
    name: "tc-c",
    component: TcTestRemoveMeCFourMeme,
  },
  {
    path: '/tc-o',
    name: "tc-o",
    component: TcTestRemoveMeO,
  },
]

const router = createRouter({
    history: createWebHistory(),
    routes: ROUTER_LIST,
});

export default router
