import { createRouter, createWebHistory } from 'vue-router'

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
        path: "/trade",
        name: "trade",
        component: TradeView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes: ROUTER_LIST,
});

export default router
