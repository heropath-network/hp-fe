<template>
  <button
    :class="[
      'border border-solid box-border cursor-pointer px-[7px] py-[5px] text-xs leading-4 font-medium text-white whitespace-nowrap transition-all bg-transparent',
      active ? 'border-[#6ce99e]' : 'border-[#373737]'
    ]"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  active?: boolean
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

