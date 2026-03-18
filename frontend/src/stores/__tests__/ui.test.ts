import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUIStore } from '../ui'

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with default state', () => {
    const store = useUIStore()

    expect(store.theme).toBe('dark')
    expect(store.sidebarOpen).toBe(true)
    expect(store.notifications).toEqual([])
  })

  it('initializes theme from localStorage', () => {
    localStorage.setItem('theme', 'light')

    const store = useUIStore()

    expect(store.theme).toBe('light')
  })

  it('toggles theme between light and dark', () => {
    localStorage.setItem('theme', 'light')

    const store = useUIStore()

    expect(store.theme).toBe('light')

    store.toggleTheme()

    expect(store.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    store.toggleTheme()

    expect(store.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggles sidebar', () => {
    const store = useUIStore()

    expect(store.sidebarOpen).toBe(true)

    store.toggleSidebar()

    expect(store.sidebarOpen).toBe(false)

    store.toggleSidebar()

    expect(store.sidebarOpen).toBe(true)
  })

  it('adds notification', () => {
    const store = useUIStore()

    store.addNotification({
      id: '1',
      title: 'Success',
      type: 'success',
      message: 'Test notification',
    })

    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0].message).toBe('Test notification')
  })

  it('removes notification', () => {
    const store = useUIStore()

    store.addNotification({
      type: 'success',
      title: 'Test',
      message: 'Test notification',
    })

    expect(store.notifications).toHaveLength(1)
    const notificationId = store.notifications[0].id

    store.removeNotification(notificationId!)

    expect(store.notifications).toHaveLength(0)
  })

  it('clears all notifications', () => {
    const store = useUIStore()

    store.addNotification({
      id: '1',
      title: 'Success',
      type: 'success',
      message: 'Notification 1',
    })

    store.addNotification({
      id: '2',
      title: 'Error',
      type: 'error',
      message: 'Notification 2',
    })

    expect(store.notifications).toHaveLength(2)

    store.clearNotifications()

    expect(store.notifications).toHaveLength(0)
  })
})