<template>
  <button
    type="button"
    :class="[
      'flex justify-center items-center gap-1 px-4 py-3.5 text-base font-medium leading-6 transition-colors',
      isActive
        ? 'bg-stone-900 text-white'
        : 'rounded-xl text-neutral-400 hover:text-white',
    ]"
    @click="$emit('click')"
  >
    <span class="text-center">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isActive: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>



