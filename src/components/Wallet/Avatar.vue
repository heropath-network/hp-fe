<template>
  <span
    ref="container"
    class="inline-block rounded-[50%] overflow-hidden"
    :style="inlineStyle"
  >
  </span>
</template>

<script lang="ts" setup>
import { computed, Ref, ref, watchEffect } from "vue";
import jazzicon from "@metamask/jazzicon";

const colors = [
  "rgb(183, 251, 255)",
  "rgb(246, 65, 206)",
  "rgb(255, 133, 221)",
  "rgb(134, 43, 250)",
  "rgb(133, 255, 167)",
  "rgb(43, 151, 250)",
  "rgb(183, 203, 255)",
  "rgb(65, 116, 246)",
  "rgb(104, 82, 237)",
];

interface Props {
  address?: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 36,
});

const container: Ref<HTMLSpanElement | null> = ref(null);

const backgroundColor = computed(() => {
  if (props.address) {
    const index =
      BigInt(
        `0x${props.address.slice(
          props.address.length - 2,
          props.address.length
        )}`
      ) % BigInt(colors.length);
    return colors[Number(index)] || null;
  }
  return null;
});

const icon = computed(() => {
  return props.address && props.size
    ? jazzicon(props.size, parseInt(props.address.slice(2, 10), 16))
    : null;
});

const inlineStyle = computed(() => {
  return {
    backgroundColor: backgroundColor.value!,
    height: props.size + "px",
    width: props.size + "px",
  };
});

watchEffect((onCleanup) => {
  const iconEle = icon.value;
  const containerEle = container.value;
  if (iconEle && containerEle) {
    containerEle?.appendChild(iconEle);
  }
  onCleanup(() => {
    if (containerEle && iconEle) {
      containerEle?.removeChild(iconEle);
    }
  });
});
</script>
