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
    <template #title>About Hero Account</template>
    <template #default>
      <div class="mt-4 text-[14px] leading-[22px] text-[var(--hp-text-color)] space-y-2">
        <div>
          The protocol combines all hero account activity into aggregated insights that help inform the protocol’s own
          independent trading strategy.
        </div>
        <div>
          The protocol never mirrors or duplicates any individual hero account’s trades, never manages user funds, and
          never provides personalized investment advice.
        </div>
        <div>
          All data is blended and anonymized so no single user’s actions can be identified.Participation is optional,
          and users always retain full control over their own hero accounts.
        </div>
      </div>
    </template>
  </HpDialog>
</template>
