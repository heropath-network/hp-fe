<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <component
          v-for="notification in notifications"
          :key="notification.id"
          :is="notification.component"
          v-bind="notification.props"
          @close="removeNotification(notification.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { setNotificationContainer } from '@/composables/useNotification'

export interface NotificationItem {
  id: string
  component: any
  props: Record<string, any>
}

const notifications = ref<NotificationItem[]>([])

function addNotification(notification: NotificationItem) {
  notifications.value.push(notification)
}

function removeNotification(id: string) {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

onMounted(() => {
  setNotificationContainer({ addNotification, removeNotification })
})

onUnmounted(() => {
  setNotificationContainer(null as any)
})

defineExpose({
  addNotification,
  removeNotification,
})
</script>

<style scoped lang="scss">
.notification-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
}

.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>

