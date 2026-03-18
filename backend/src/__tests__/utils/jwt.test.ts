import { describe, it, expect, beforeEach } from 'vitest'
import { initJWT, generateToken, verifyToken } from '../../utils/jwt'

describe('JWT Utils', () => {
  beforeEach(() => {
    initJWT('test-secret-key-32-characters-long-key')
  })

  describe('initJWT', () => {
    it('should initialize JWT with valid secret', () => {
      expect(() => initJWT('test-secret-key-32-characters-long-key')).not.toThrow()
    })

    it('should throw error for secret shorter than 32 characters', () => {
      expect(() => initJWT('short')).toThrow('JWT_SECRET must be at least 32 characters long')
    })

    it('should throw error for empty secret', () => {
      expect(() => initJWT('')).toThrow('JWT_SECRET must be at least 32 characters long')
    })
  })

  describe('generateToken', () => {
    it('should generate a token with valid payload', async () => {
      const payload = { userId: '1' }
      const token = await generateToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate different tokens for same payload', async () => {
      const payload = { userId: '1' }
      const token1 = await generateToken(payload)
      const token2 = await generateToken(payload)

      expect(token1).not.toBe(token2)
    })

    it('should generate token with complex payload', async () => {
      const payload = {
        userId: '1',
        email: 'test@example.com',
        role: 'admin',
      }
      const token = await generateToken(payload)

      expect(token).toBeDefined()
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = { userId: '1' }
      const token = await generateToken(payload)
      const decoded = await verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('1')
    })

    it('should return null for invalid token', async () => {
      const decoded = await verifyToken('invalid.token.string')

      expect(decoded).toBeNull()
    })

    it('should return null for empty token', async () => {
      const decoded = await verifyToken('')

      expect(decoded).toBeNull()
    })

    it('should return null for token with wrong secret', async () => {
      initJWT('different-secret-key-32-characters-long')
      const payload = { userId: '1' }
      const token = await generateToken(payload)

      initJWT('test-secret-key-32-characters-long-key')
      const decoded = await verifyToken(token)

      expect(decoded).toBeNull()
    })

    it('should verify token with multiple payload fields', async () => {
      const payload = {
        userId: '1',
        email: 'test@example.com',
        role: 'admin',
      }
      const token = await generateToken(payload)
      const decoded = await verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe('1')
      expect(decoded?.email).toBe('test@example.com')
      expect(decoded?.role).toBe('admin')
    })
  })

  describe('generateToken and verifyToken integration', () => {
    it('should work together correctly', async () => {
      const originalPayload = { userId: '123', email: 'user@example.com' }
      const token = await generateToken(originalPayload)
      const decodedPayload = await verifyToken(token)

      expect(decodedPayload).toBeDefined()
      expect(decodedPayload?.userId).toBe(originalPayload.userId)
      expect(decodedPayload?.email).toBe(originalPayload.email)
    })

    it('should preserve payload data through generation and verification', async () => {
      const originalPayload = {
        userId: '456',
        email: 'test@test.com',
        role: 'user',
        extra: 'data',
      }
      const token = await generateToken(originalPayload)
      const decodedPayload = await verifyToken(token)

      expect(decodedPayload).toMatchObject(originalPayload)
    })
  })
})