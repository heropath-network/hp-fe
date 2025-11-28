<script setup lang="ts">
import { ref, computed } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import CloseIcon from "@/assets/icons/close.svg";

interface Props {
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
});

interface Emits {
  (e: "close"): void;
}

const emit = defineEmits<Emits>();
defineSlots<{
  title?: () => any;
  default?: () => any;
}>();

const _isOpen = ref(props.show);

const isOpen = computed({
  get() {
    return _isOpen.value;
  },
  set(value: boolean) {
    _isOpen.value = value;
  },
});

function closeModal() {
  isOpen.value = false;
  emit("close");
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-[999]">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/90" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-[400px] transform overflow-hidden bg-[var(--hp-bg-normal)] p-4 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-[var(--hp-white-color)]"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-[var(--hp-white-color)] text-[16px] font-semibold"
                  >
                    <slot name="title">Dialog Title</slot>
                  </span>
                  <span
                    class="icon-mask !bg-[var(--hp-white-color)] cursor-pointer hover:!bg-[var(--hp-text-color)] h-[14px] w-[14px]"
                    @click="isOpen = false"
                    :style="{
                      '--icon-url': `url(${CloseIcon})`,
                    }"
                  />
                </div>
              </DialogTitle>
              <div class="mt-1">
                <slot></slot>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
