import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 从 localStorage 读取保存的主题，默认为 'dark'
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  const theme = ref<'light' | 'dark'>(savedTheme || 'dark')
  const sidebarOpen = ref(true)
  const notifications = ref<Notification[]>([])

  // 初始化主题：立即应用到 HTML 元素
  if (typeof document !== 'undefined') {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    
    // 更新 HTML 元素的 class
    if (typeof document !== 'undefined') {
      if (theme.value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // 保存到 localStorage
    localStorage.setItem('theme', theme.value)
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function addNotification(notification: Notification) {
    notifications.value.push({
      ...notification,
      id: Date.now().toString(),
    })
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearNotifications() {
    notifications.value = []
  }

  return {
    theme,
    sidebarOpen,
    notifications,
    toggleTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
  }
})

interface Notification {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}