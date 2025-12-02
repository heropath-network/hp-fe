<template>
  <svg
    v-if="name"
    class="hp-icon"
    aria-hidden="true"
    focusable="false"
    :style="{
      width: normalizedSize,
      height: normalizedSize,
      color: color ?? undefined,
    }"
  >
    <use :href="`#hp-${name}`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  name: string;
  size?: number | string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
});

const normalizedSize = computed(() => {
  if (typeof props.size === "number") return `${props.size}px`;
  return /^\d+$/.test(props.size) ? `${props.size}px` : props.size;
});
</script>

<style scoped>
.hp-icon {
  display: inline-block;
  fill: currentColor;
}
</style>
