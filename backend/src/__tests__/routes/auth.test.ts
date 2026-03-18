import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import authRouter from '../../routes/auth'
import { createMockD1Database } from '../helpers/db'
import { initJWT } from '../../utils/jwt'
import { strictAuthRateLimit } from '../../middleware/rateLimit'
import { authMiddleware } from '../../middleware/auth'
import type { Env, Variables } from '../../types'

describe('Auth Router', () => {
  let app: Hono<{ Bindings: Env; Variables: Variables }>
  let mockDb: any

  beforeEach(() => {
    mockDb = createMockD1Database()
    initJWT('test-secret-key-32-characters-long-key')

    app = new Hono<{ Bindings: Env; Variables: Variables }>()
    app.use('*', async (c, next) => {
      if (!c.env) {
        c.env = {} as Env
      }
      c.env.DB = mockDb
      c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
      // Mock KV storage
      c.env.KV = {
        get: async (key: string) => null,
        put: async (key: string, value: string, options?: any) => {},
      } as KVNamespace
      await next()
    })
    app.route('/api/auth', authRouter)
  })

  describe('POST /register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { user: any; token: string }
      expect(json.user).toBeDefined()
      expect(json.user.username).toBe('testuser')
      expect(json.user.email).toBe('test@example.com')
      expect(json.token).toBeDefined()
    })

    it('should return 400 when missing fields', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('missing')
    })

    it('should return 400 for invalid username', async () => {
      const userData = {
        username: 'a',
        email: 'test@example.com',
        password: 'Password123!',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('validation')
    })

    it('should return 400 for invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('validation')
    })

    it('should return 400 for invalid password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('validation')
    })

    it('should return 400 for disposable email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@tempmail.com',
        password: 'Password123!',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('validation')
    })

    it('should return 409 when email already exists', async () => {
      const existingUser = {
        id: '1',
        username: 'existinguser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [existingUser])

      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'Password123!',
      }

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      expect(res.status).toBe(409)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('exists')
    })
  })

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { user: any; token: string }
      expect(json.user).toBeDefined()
      expect(json.user.email).toBe('test@example.com')
      expect(json.token).toBeDefined()
    })

    it('should return 400 when missing fields', async () => {
      const loginData = {
        email: 'test@example.com',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(400)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('missing')
    })

    it('should return 401 for invalid email', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('users', [])

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(401)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('邮箱或密码错误')
    })

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      expect(res.status).toBe(401)
      const json = await res.json() as { error: string }
      expect(json.error).toContain('邮箱或密码错误')
    })
  })

  describe('GET /me', () => {
    it('should return current user data when authenticated', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('users', [mockUser])

      const appWithAuth = new Hono<{ Bindings: Env; Variables: Variables }>()
      appWithAuth.use('*', async (c, next) => {
        if (!c.env) {
          c.env = {} as Env
        }
        c.env.DB = mockDb
        c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
        await next()
      })
      appWithAuth.route('/api/auth', authRouter)

      const token = await import('../../utils/jwt').then(m => m.generateToken({ userId: '1', username: 'testuser', role: 'user' }))

      const res = await appWithAuth.request('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { username: string }
      expect(json.username).toBe('testuser')
    })

    it('should return 401 when not authenticated', async () => {
      const res = await app.request('/api/auth/me', {
        method: 'GET',
      })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /logout', () => {
    it('should logout successfully when authenticated', async () => {
      const appWithAuth = new Hono<{ Bindings: Env; Variables: Variables }>()
      appWithAuth.use('*', async (c, next) => {
        if (!c.env) {
          c.env = {} as Env
        }
        c.env.DB = mockDb
        c.env.JWT_SECRET = 'test-secret-key-32-characters-long-key'
        await next()
      })
      appWithAuth.route('/api/auth', authRouter)

      const token = await import('../../utils/jwt').then(m => m.generateToken({ userId: '1', username: 'testuser', role: 'user' }))

      const res = await appWithAuth.request('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      expect(res.status).toBe(200)
      const json = await res.json() as { message: string }
      expect(json.message).toBe('退出成功')
    })

    it('should return 401 when not authenticated', async () => {
      const res = await app.request('/api/auth/logout', {
        method: 'POST',
      })

      expect(res.status).toBe(401)
    })
  })
})