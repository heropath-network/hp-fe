import type { Component } from 'vue'
import type { NotificationItem } from '@/components/Notification/NotificationContainer.vue'

// Global container reference
let notificationContainerRef: { addNotification: (n: NotificationItem) => void; removeNotification: (id: string) => void } | null = null

export function setNotificationContainer(container: { addNotification: (n: NotificationItem) => void; removeNotification: (id: string) => void }) {
  notificationContainerRef = container
}

export function useNotification() {
  function create(options: { content: Component | (() => any); props?: Record<string, any>; duration?: number }) {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const content = typeof options.content === 'function' ? options.content() : options.content
    
    const notification: NotificationItem = {
      id,
      component: content,
      props: options.props || {},
    }

    if (notificationContainerRef) {
      notificationContainerRef.addNotification(notification)
    } else {
      console.warn('Notification container not found. Make sure NotificationContainer is mounted in App.vue')
    }

    // Auto remove after duration
    if (options.duration !== undefined && options.duration > 0) {
      setTimeout(() => {
        if (notificationContainerRef) {
          notificationContainerRef.removeNotification(id)
        }
      }, options.duration)
    }

    return {
      id,
      destroy: () => {
        if (notificationContainerRef) {
          notificationContainerRef.removeNotification(id)
        }
      },
    }
  }

  return {
    create,
  }
}

