import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateDisposableEmail,
  initEmailChecker,
} from '../../utils/validation'

describe('Validation Utils', () => {
  beforeEach(() => {
    initEmailChecker([], [])
  })

  describe('validateUsername', () => {
    it('should accept valid username', () => {
      const result = validateUsername('testuser')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept username with numbers and hyphens', () => {
      const result = validateUsername('user123-abc')
      expect(result.isValid).toBe(true)
    })

    it('should reject too short username', () => {
      const result = validateUsername('ab')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('用户名至少为3个字符')
    })

    it('should reject too long username', () => {
      const result = validateUsername('a'.repeat(21))
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('用户名不能超过20个字符')
    })

    it('should reject username with invalid characters', () => {
      const result = validateUsername('user@name')
      expect(result.isValid).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('邮箱格式不正确')
    })

    it('should reject email without domain', () => {
      const result = validateEmail('test@')
      expect(result.isValid).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should accept strong password', () => {
      const result = validatePassword('Test123!@#')
      expect(result.isValid).toBe(true)
    })

    it('should reject too short password', () => {
      const result = validatePassword('Test1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码长度至少为8个字符')
    })

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('test123!@#')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个大写字母')
    })

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('TEST123!@#')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个小写字母')
    })

    it('should reject password without number', () => {
      const result = validatePassword('Test!@#$%^')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个数字')
    })

    it('should reject password without special character', () => {
      const result = validatePassword('Test123456')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个特殊字符')
    })
  })

  describe('validateDisposableEmail', () => {
    beforeEach(() => {
      initEmailChecker(['tempmail.com', 'throwaway.email'], ['example.com'])
    })

    it('should accept non-disposable email', () => {
      const result = validateDisposableEmail('user@example.com')
      expect(result.isValid).toBe(true)
    })

    it('should reject disposable email', () => {
      const result = validateDisposableEmail('user@tempmail.com')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('不允许使用一次性邮箱注册，请使用您的永久邮箱地址')
    })

    it('should reject another disposable email', () => {
      const result = validateDisposableEmail('user@throwaway.email')
      expect(result.isValid).toBe(false)
    })
  })
})