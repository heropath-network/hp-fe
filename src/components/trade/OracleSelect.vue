<template>
  <div class="flex items-center gap-3">
    <div class="text-xs text-gray-400">{{ label }}</div>
    <Menu as="div" class="relative inline-block text-left">
      <div>
        <MenuButton
          class="flex items-center gap-2  px-3 py-1.5 text-sm text-gray-300 transition  focus:outline-none"
        >
          <svg class="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h2m4 0h2m4 0h2m4 0h2M5 8v4m4-4v4m4-4v4m4-4v4" />
          </svg>
          <span>{{ selectedValue }}</span>
          <svg class="h-4 w-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </MenuButton>
      </div>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="absolute right-0 z-10 mt-2 w-40 origin-top-right border border-gray-800 bg-gray-900 shadow-lg focus:outline-none"
        >
          <div class="py-1">
            <MenuItem
              v-for="oracle in options"
              :key="oracle.value"
              v-slot="{ active }"
            >
              <button
                @click="$emit('select', oracle.value)"
                :class="[
                  active ? 'bg-gray-800 text-gray-200' : '',
                  oracle.value === selectedValue ? 'text-gray-300' : 'text-white',
                  'group flex w-full items-center px-4 py-2 text-sm transition'
                ]"
              >
                {{ oracle.label }}
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

export interface OracleOption {
  label: string
  value: string
  disabled?: boolean
}

defineProps<{
  options: OracleOption[]
  selectedValue: string
  label?: string
}>()

defineEmits<{
  select: [value: string]
}>()
</script>

