import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with default state', () => {
    const store = useUserStore()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('sets user and token', () => {
    const store = useUserStore()
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as const,
      avatar: '/avatar.png',
      createdAt: '2024-01-01T00:00:00Z',
    }

    store.setUser(mockUser)
    store.setToken('test-token')

    expect(store.user).toEqual(mockUser)
    expect(store.token).toBe('test-token')
    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('auth_token')).toBe('test-token')
  })

  it('clears user and token on logout', () => {
    const store = useUserStore()
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as const,
      avatar: '/avatar.png',
      createdAt: '2024-01-01T00:00:00Z',
    }

    store.setUser(mockUser)
    store.setToken('test-token')
    store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})