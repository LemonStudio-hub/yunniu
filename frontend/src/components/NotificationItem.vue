<template>
  <div
    :class="[
      'flex gap-3 p-4 rounded-xl transition-all duration-300 cursor-pointer',
      notification.is_read
        ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
        : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
    ]"
    @click="handleClick"
  >
    <div class="flex-shrink-0">
      <div
        :class="[
          'w-10 h-10 rounded-full flex items-center justify-center',
          getNotificationIconClasses()
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getNotificationIconPath()" />
        </svg>
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2 mb-1">
        <h4
          :class="[
            'text-sm font-semibold',
            notification.is_read
              ? 'text-gray-900 dark:text-white'
              : 'text-blue-900 dark:text-blue-100'
          ]"
        >
          {{ notification.title }}
        </h4>
        <span
          :class="[
            'text-xs whitespace-nowrap',
            notification.is_read
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-blue-700 dark:text-blue-300'
          ]"
        >
          {{ formatDate(notification.created_at) }}
        </span>
      </div>
      <p
        :class="[
          'text-sm',
          notification.is_read
            ? 'text-gray-600 dark:text-gray-400'
            : 'text-blue-800 dark:text-blue-200'
        ]"
      >
        {{ notification.message }}
      </p>
    </div>
    <div class="flex-shrink-0 flex flex-col items-center gap-2">
      <button
        v-if="!notification.is_read"
        @click.stop="markAsRead"
        class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
        title="标记为已读"
      >
        标为已读
      </button>
      <button
        @click.stop="deleteNotification"
        class="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        title="删除"
      >
        删除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Notification } from '../api/notifications'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  markAsRead: [id: string]
  delete: [id: string]
}>()

const router = useRouter()

function handleClick() {
  if (props.notification.link) {
    if (!props.notification.is_read) {
      markAsRead()
    }
    router.push(props.notification.link)
  }
}

function markAsRead() {
  emit('markAsRead', props.notification.id)
}

function deleteNotification() {
  emit('delete', props.notification.id)
}

function getNotificationIconClasses(): string {
  switch (props.notification.type) {
    case 'comment':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    case 'reply':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'like':
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }
}

function getNotificationIconPath(): string {
  switch (props.notification.type) {
    case 'comment':
      return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    case 'reply':
      return 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6'
    case 'like':
      return 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    default:
      return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  }
}

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes < 1 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}
</script>