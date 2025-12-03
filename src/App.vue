<script setup lang="ts">
import '@/style/style.scss'
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import GlobalMount from './GlobalMount.vue'
import Header from '@/views/Header/Header.vue'
import Menu from '@/views/Menu.vue'

const route = useRoute()
const showMenu = computed(() => !route.meta?.hideMenu)
const isTradePage = computed(() => route.path === "/trade");
</script>

<template>
  <div v-if="isTradePage" class="min-h-screen bg-[var(--hp-bg-dark)] text-[var(--hp-white-color)]">
    <RouterView />
  </div>
  <div v-else class="min-h-screen bg-[var(--hp-bg-dark)] text-[var(--hp-white-color)]">
    <Header />
    <div class="flex">
      <Menu v-if="showMenu" />
      <main
        class="h-screen flex-1 overflow-auto pb-12 pt-20 relative"
        :class="showMenu ? 'ml-[248px]' : ''"
      >
        <div class="hp-container">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
  <GlobalMount />
</template>
