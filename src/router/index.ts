import { createRouter, createWebHashHistory } from 'vue-router'
import Profile from '@/templates/Profile/Profile.vue'
import Dashboard from '@/templates/Dashboard/Dashboard.vue'
import Evaluation from '@/templates/Evaluation/Evaluation.vue'
import Payouts from '@/templates/Payouts/Payouts.vue'
import TradingEducation from '@/templates/TradingEducation/TradingEducation.vue'
import Leaderboard from '@/templates/Leaderboard/Leaderboard.vue'
import Ecosystem from '@/templates/Ecosystem/Ecosystem.vue'

export enum ROUTE_NAMES {
  Dashboard = 'dashboard',
  Profile = 'profile',
  Evaluation = 'evaluation',
  Payouts = 'payouts',
  TradingEducation = 'trading-education',
  Leaderboard = 'leaderboard',
  Ecosystem = 'ecosystem',
}

const ROUTER_LIST = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: ROUTE_NAMES.Dashboard,
    component: Dashboard,
  },
  {
    path: '/profile',
    name: ROUTE_NAMES.Profile,
    component: Profile,
  },
  {
    path: '/evaluation',
    name: ROUTE_NAMES.Evaluation,
    component: Evaluation,
  },
  {
    path: '/payouts',
    name: ROUTE_NAMES.Payouts,
    component: Payouts,
  },
  {
    path: '/trading-education',
    name: ROUTE_NAMES.TradingEducation,
    component: TradingEducation,
  },
  {
    path: '/leaderboard',
    name: ROUTE_NAMES.Leaderboard,
    component: Leaderboard,
  },
  {
    path: '/ecosystem',
    name: ROUTE_NAMES.Ecosystem,
    component: Ecosystem,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: ROUTER_LIST,
})

export default router
