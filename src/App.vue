<script setup lang="ts">
import '@/style/style.scss'
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import GlobalMount from './GlobalMount.vue'
import Header from '@/views/Header/Header.vue'
import Menu from '@/views/Menu.vue'

const route = useRoute()
const showMenu = computed(() => !route.meta?.hideMenu)
</script>

<template>
  <div class="min-h-screen bg-[var(--hp-bg-dark)] text-[var(--hp-white-color)]">
    <Header />
    <div class="flex">
      <Menu v-if="showMenu" />
      <main class="h-screen flex-1 overflow-auto pb-12 pt-20" :class="showMenu ? 'ml-[248px] px-8' : 'px-4 sm:px-6'">
        <div v-if="showMenu" class="mx-auto w-full max-w-[1160px]">
          <RouterView />
        </div>
        <RouterView v-else />
      </main>
    </div>
  </div>
  <GlobalMount />
</template>
