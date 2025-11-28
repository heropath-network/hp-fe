<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "@/views/Header.vue";
import Menu from "@/views/Menu.vue";
</script>

<template>
  <div>
    <Header />
    <Menu />
    <main>
      <RouterView />
    </main>
  </div>
</template>
