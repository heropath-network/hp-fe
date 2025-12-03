<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import Positions from './Positions.vue'
import Traders from './Traders.vue'

type TabKey = 'traders' | 'positions'
type TabItem = {
  key: TabKey
  label: string
  component: Component
}

const tabs: TabItem[] = [
  { key: 'traders', label: 'Traders', component: Traders },
  { key: 'positions', label: 'Positions', component: Positions },
]

const activeTab = ref<TabKey>('traders')

const activeComponent = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.component || Traders)
</script>

<template>
  <section class="flex flex-col items-center gap-8 text-[var(--hp-white-color)]">
    <div class="flex w-full items-center justify-center">
      <div class="flex w-[320px] overflow-hidden rounded-sm bg-[var(--hp-bg-light)]">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="flex-1 px-4 py-3 text-center text-base font-medium transition"
          :class="[
            activeTab === tab.key
              ? 'bg-[var(--hp-primary-green)] text-[var(--hp-black-color)]'
              : 'text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]',
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <component :is="activeComponent" />
  </section>
</template>
