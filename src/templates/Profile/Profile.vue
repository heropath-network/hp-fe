<script setup lang="ts">
import { ref } from 'vue'
import { HpTabs } from '@/components'
import PrivateProfile from './PrivateProfile.vue'
import PublicProfile from './PublicProfile.vue'

const tabs = [
  { id: 'private', label: 'Private Profile' },
  { id: 'public', label: 'Public Profile' },
]

const selectId = ref('private')
</script>

<template>
  <HpTabs v-model:selectId="selectId" :tabs="tabs" class="mb-12 mt-6" />
  <PrivateProfile v-if="selectId === 'private'" />
  <PublicProfile v-else />
</template>
