import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { authApi } from '../auth'
import type { AuthResponse } from '../auth'

describe('Auth API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          avatar: '/avatar.png',
          createdAt: '2024-01-01T00:00:00Z',
        },
        token: 'test-token',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await authApi.login({
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(result.user).toEqual(mockResponse.user)
      expect(result.token).toBe('test-token')
    })

    it('should handle login failure', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      })

      await expect(
        authApi.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow()
    })

    it('should send correct request data', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'user', avatar: '/avatar.png', createdAt: '2024-01-01T00:00:00Z' },
          token: 'test-token',
        }),
      })

      await authApi.login({
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123!',
          }),
        })
      )
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          avatar: '/avatar.png',
          createdAt: '2024-01-01T00:00:00Z',
        },
        token: 'test-token',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await authApi.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(result.user).toEqual(mockResponse.user)
      expect(result.token).toBe('test-token')
    })

    it('should handle registration failure', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      })

      await expect(
        authApi.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak',
        })
      ).rejects.toThrow()
    })

    it('should send correct request data', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'user', avatar: '/avatar.png', createdAt: '2024-01-01T00:00:00Z' },
          token: 'test-token',
        }),
      })

      await authApi.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!',
          }),
        })
      )
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        avatar: '/avatar.png',
        createdAt: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      const result = await authApi.getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('should handle unauthorized access', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      })

      await expect(authApi.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '退出成功' }),
      })

      await expect(authApi.logout()).resolves.not.toThrow()
    })

    it('should handle logout failure', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      await expect(authApi.logout()).rejects.toThrow()
    })
  })
})