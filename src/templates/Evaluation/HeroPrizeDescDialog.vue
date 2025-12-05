<script lang="ts" setup>
import { ref } from 'vue'
import { tryOnMounted } from '@vueuse/core'
import { HpDialog } from '@/components'

const emits = defineEmits<{
  (e: 'close'): void
}>()

const visible = ref(false)

function onCloseDialog() {
  visible.value = false
  emits('close')
}

tryOnMounted(() => {
  visible.value = true
})
</script>

<template>
  <HpDialog :show="visible" @close="onCloseDialog">
    <template #title>About Hero Prize</template>
    <template #default>
      <div class="mt-4 text-[14px] leading-[22px] text-[var(--hp-text-color)] space-y-2">
        <div>
          The protocol combines all hero account activity into aggregated insights that help inform the protocol’s own
          independent trading strategy.
        </div>
        <div>
          After contributing trading signals/insights to the protocol’s own independent trading strategy, the protocol
          will distribute hero prizes to hero account owners every 7 days. The prizes for each hero account are
          calculated based on the contribution to the protocol’s trading strategy.
        </div>
      </div>
    </template>
  </HpDialog>
</template>
