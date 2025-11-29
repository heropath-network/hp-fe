<script setup lang="ts">
import { ref } from 'vue'
import { HpTabs } from '@/components'

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
]

const selectId = ref('profile')
</script>

<template><HpTabs :tabs="tabs" v-model:selectId="selectId" /></template>
