<script setup lang="ts">
import "@/style/style.scss";
import { RouterView } from "vue-router";
import GlobalMount from "./GlobalMount.vue";
import Header from "@/views/Header/Header.vue";
import Menu from "@/views/Menu.vue";
</script>

<template>
  <div class="min-h-screen bg-[var(--hp-bg-dark)] text-[var(--hp-white-color)]">
    <Header />
    <div class="flex">
      <Menu />
      <main class="ml-[248px] h-screen flex-1 overflow-auto px-8 pb-12 pt-20">
        <div class="mx-auto w-full max-w-[1160px]">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
  <GlobalMount />
</template>
