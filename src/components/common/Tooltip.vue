<script setup lang="ts">
import { ref } from "vue";
import { Popover, PopoverButton } from "@headlessui/vue";

interface Props {
  content: string;
  width?: number;
}

defineProps<Props>(

);

const isOpen = ref(false);

function setOpen(value: boolean) {
  isOpen.value = value;
}
</script>

<template>
  <Popover class="relative inline-flex">
    <PopoverButton
      as="span"
      class="tooltip-trigger inline-flex"
      @click.prevent
      @mouseenter="setOpen(true)"
      @mouseleave="setOpen(false)"
    >
      <slot />
    </PopoverButton>
    <transition
      enter-active-class="tooltip-enter-active"
      enter-from-class="tooltip-enter-from"
      enter-to-class="tooltip-enter-to"
      leave-active-class="tooltip-leave-active"
      leave-from-class="tooltip-leave-from"
      leave-to-class="tooltip-leave-to"
    >
      <div
        v-show="isOpen"
        class="tooltip-panel"
        :style="{ width: width ? `${width}px` : '200px' }"
        @mouseenter="setOpen(true)"
        @mouseleave="setOpen(false)"
      >
        <div class="tooltip-content whitespace-pre-wrap">{{ content }}</div>
      </div>
    </transition>
  </Popover>
</template>

<style scoped>
.tooltip-trigger {
  display: inline-flex;
  align-items: center;
}

.tooltip-panel {
  position: absolute;
  z-index: 50;
  bottom: 100%;
  margin-bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

.tooltip-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.tooltip-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.tooltip-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

.tooltip-content {
  padding: 8px 12px;
  background-color: var(--hp-bg-dark);
  border: 1px solid var(--hp-line-color);
  border-radius: 4px;
  color: #e5e7eb;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: left;
}
</style>

