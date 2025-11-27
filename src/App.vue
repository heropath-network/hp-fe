<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
    <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-2 font-semibold text-xl">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow">V</span>
          <div class="leading-tight">
            <p>Vue 3</p>
            <p class="text-xs font-normal text-slate-500">Vite · TS · Tailwind</p>
          </div>
        </div>
        <nav class="flex items-center gap-4 text-sm font-medium text-slate-600">
          <RouterLink class="rounded px-3 py-2 transition hover:bg-slate-100" to="/">Home</RouterLink>
          <a
            class="rounded px-3 py-2 text-blue-600 transition hover:bg-blue-50"
            href="https://vuejs.org/"
            target="_blank"
            rel="noreferrer"
          >
            Vue Docs
          </a>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-10">
      <RouterView />
    </main>
  </div>
</template>
