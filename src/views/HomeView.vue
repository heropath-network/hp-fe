<script setup lang="ts">
import { ref } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { useCounterStore } from '@/stores/counter'
import { runtimeConfig } from '@/config/runtimeConfig'

const stackItems = [
  { name: 'Vue 3 + Vite', desc: 'Modern build with fast HMR' },
  { name: 'TypeScript', desc: 'Type-safe with better DX' },
  { name: 'Tailwind CSS + Sass', desc: 'Atomic utilities plus flexible preprocessor' },
  { name: 'Pinia + Vue Router', desc: 'Official duo for state and routing' },
  { name: 'Headless UI', desc: 'Unstyled composable interaction primitives' }
]

const selectedStack = ref(stackItems[0])
const features = [
  {
    title: 'Extendable routing',
    body: 'Uses hash mode by default for static hosting; extend the route map as needed.'
  },
  {
    title: 'State management sample',
    body: 'Pinia with the composition API, ready to use and hot-reload friendly.'
  },
  {
    title: 'Styling conventions',
    body: 'Tailwind handles layout and rhythm, Sass keeps variables and small custom tweaks.'
  }
]

const faqs = [
  {
    question: 'How to switch to history routing?',
    answer: 'Change createWebHashHistory to createWebHistory and set up server fallback.'
  },
  {
    question: 'How to override Tailwind styles?',
    answer: 'Add custom layers or variables in src/assets/main.scss for global effect.'
  }
]

const counter = useCounterStore()
</script>

<template>
  <section class="space-y-8">
    <div class="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 p-[1px] shadow-lg">
      <div class="flex flex-col gap-6 rounded-3xl bg-white p-8 md:flex-row md:items-center md:justify-between">
        <div class="space-y-2">
          <p class="text-sm uppercase tracking-[0.2em] text-blue-500">Starter ready</p>
          <h1 class="text-3xl font-semibold text-slate-900 md:text-4xl">Vue 3 + TypeScript starter template</h1>
          <p class="max-w-2xl text-slate-600">
            Bundled with Vite, Tailwind, Sass, Pinia, Vue Router (hash), and Headless UI. Run `pnpm install` and start building right away.
          </p>
          <div class="flex flex-wrap gap-2 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span class="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Vite</span>
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">TS</span>
            <span class="rounded-full bg-slate-100 px-3 py-1">Tailwind</span>
            <span class="rounded-full bg-orange-50 px-3 py-1 text-orange-700">Sass</span>
            <span class="rounded-full bg-purple-50 px-3 py-1 text-purple-700">Pinia</span>
          </div>
        </div>
        <div class="w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
          <Listbox v-model="selectedStack">
            <div class="relative">
              <ListboxButton
                class="relative w-full cursor-default rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm outline-none transition hover:border-blue-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
              >
                <span class="block truncate text-sm font-medium">{{ selectedStack.name }}</span>
                <span class="block truncate text-xs text-slate-500">{{ selectedStack.desc }}</span>
              </ListboxButton>
              <ListboxOptions
                class="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none"
              >
                <ListboxOption v-for="item in stackItems" :key="item.name" :value="item" v-slot="{ active, selected }">
                  <li
                    :class="[
                      'cursor-default select-none space-y-0.5 px-4 py-2 transition',
                      active ? 'bg-blue-50 text-blue-700' : 'text-slate-800'
                    ]"
                  >
                    <div class="flex items-center justify-between">
                      <span :class="selected ? 'font-semibold' : 'font-medium'">{{ item.name }}</span>
                      <span v-if="selected" class="text-xs font-semibold text-blue-600">Selected</span>
                    </div>
                    <p class="text-xs text-slate-500">{{ item.desc }}</p>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <h3 class="text-lg font-semibold text-slate-900">{{ feature.title }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ feature.body }}</p>
      </article>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Runtime config</p>
          <p class="text-lg font-semibold text-slate-900">Environment-aware defaults</p>
        </div>
        <span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {{ runtimeConfig.env }}
        </span>
      </div>
      <dl class="mt-4 grid gap-4 sm:grid-cols-2">
        <div class="space-y-1">
          <dt class="text-xs uppercase tracking-[0.15em] text-slate-500">App title (static)</dt>
          <dd class="text-sm font-medium text-slate-800">{{ runtimeConfig.appTitle }}</dd>
        </div>
      </dl>
      <p class="mt-3 text-xs text-slate-500">
        Switch VITE_APP_ENV in .env.development or .env.production to see the environment badge change.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">FAQ</h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Headless UI Disclosure</span>
        </div>
        <div class="divide-y divide-slate-200">
          <Disclosure v-for="item in faqs" :key="item.question" v-slot="{ open }">
            <DisclosureButton
              class="flex w-full items-center justify-between py-3 text-left text-base font-medium text-slate-800 transition hover:text-blue-600"
            >
              <span>{{ item.question }}</span>
              <span class="text-sm text-slate-500">{{ open ? 'Collapse' : 'Expand' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="pb-3 text-sm text-slate-600">{{ item.answer }}</DisclosurePanel>
          </Disclosure>
        </div>
      </div>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Pinia example</p>
            <p class="text-lg font-semibold text-slate-900">Counter</p>
          </div>
          <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">State</span>
        </div>
        <div class="flex items-baseline gap-3">
          <p class="text-4xl font-semibold text-slate-900">{{ counter.count }}</p>
          <p class="text-sm text-slate-500">x2 = {{ counter.double }}</p>
        </div>
        <div class="flex gap-3">
          <button
            class="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 active:translate-y-[1px]"
            type="button"
            @click="counter.increment()"
          >
            Increment
          </button>
          <button
            class="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            type="button"
            @click="counter.reset()"
          >
            Reset
          </button>
        </div>
        <p class="text-xs text-slate-500">Counter state lives in the Pinia store with HMR and TS inference.</p>
      </div>
    </div>
  </section>
</template>
