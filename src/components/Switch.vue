<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { computed } from 'vue'

interface Props {
  enabled: boolean
}

const props = withDefaults(defineProps<Props>(), {})

const emits = defineEmits<{
  (e: 'update:enabled', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const isEnabled = computed({
  get: () => props.enabled,
  set: (value: boolean) => {
    emits('change', value)
    emits('update:enabled', value)
  },
})
</script>

<template>
  <Switch
    v-model="isEnabled"
    :class="isEnabled ? 'bg-[var(--hp-primary-green)]' : 'bg-[var(--hp-line-normal-color)]'"
    class="relative flex items-center h-[16px] w-[28px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
  >
    <span
      aria-hidden="true"
      :class="isEnabled ? 'translate-x-[14px]' : 'translate-x-[2px]'"
      class="pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
    />
  </Switch>
</template>
