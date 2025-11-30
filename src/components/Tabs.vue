<template>
  <div class="flex items-center justify-center">
    <TabGroup>
      <TabList class="flex bg-[var(--hp-bg-light)]">
        <Tab v-for="tab in tabs" as="template" :key="tab.id" :id="tab.id">
          <div
            class="flex items-center justify-center cursor-pointer h-[44px] w-[166px] text-[16px] font-[500] leading-6 text-[var(--hp-text-color)] hover:text-[var(--hp-white-color)]"
            :style="[
              selectId === tab.id ? 'background-color: var(--hp-primary-green); color:var(--hp-black-color)' : '',
            ]"
            @click="$emit('update:selectId', tab.id)"
          >
            {{ tab.label }}
          </div>
        </Tab>
      </TabList>
    </TabGroup>
  </div>
</template>

<script lang="ts" setup>
import { TabGroup, TabList, Tab } from '@headlessui/vue'

interface Props {
  tabs: {
    id: string
    label: string
  }[]
  selectId: string
}

withDefaults(defineProps<Props>(), {})
</script>
