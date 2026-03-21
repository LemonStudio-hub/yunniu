import { describe, it, expect, beforeEach } from 'vitest'
import { CategoryService } from '../../services/categoryService'
import { createMockD1Database } from '../helpers/db'

describe('CategoryService', () => {
  let mockDb: any
  let categoryService: CategoryService

  beforeEach(() => {
    mockDb = createMockD1Database()
    categoryService = new CategoryService(mockDb)
  })

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: '技术讨论',
          description: '讨论各种技术话题',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: '生活分享',
          description: '分享生活点滴',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('categories', mockCategories)

      const result = await categoryService.findAll()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('技术讨论')
      expect(result[1].name).toBe('生活分享')
    })

    it('should return empty array when no categories exist', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('categories', [])

      const result = await categoryService.findAll()

      expect(result).toEqual([])
    })

    it('should return categories sorted by name', async () => {
      const mockCategories = [
        {
          id: '2',
          name: '生活分享',
          description: '分享生活点滴',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '1',
          name: '技术讨论',
          description: '讨论各种技术话题',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('categories', mockCategories)

      const result = await categoryService.findAll()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('技术讨论')
      expect(result[1].name).toBe('生活分享')
    })
  })

  describe('findById', () => {
    it('should find category by id', async () => {
      const mockCategory = {
        id: '1',
        name: '技术讨论',
        description: '讨论各种技术话题',
        created_at: '2024-01-01T00:00:00Z',
      }

      mockDb.tables = new Map()
      mockDb.tables.set('categories', [mockCategory])

      const category = await categoryService.findById('1')

      expect(category).toBeDefined()
      expect(category?.id).toBe('1')
      expect(category?.name).toBe('技术讨论')
    })

    it('should return null for non-existent category', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('categories', [])

      const category = await categoryService.findById('999')

      expect(category).toBeNull()
    })

    it('should return correct category when multiple exist', async () => {
      const mockCategories = [
        {
          id: '1',
          name: '技术讨论',
          description: '讨论各种技术话题',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: '生活分享',
          description: '分享生活点滴',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('categories', mockCategories)

      const category = await categoryService.findById('2')

      expect(category).toBeDefined()
      expect(category?.id).toBe('2')
      expect(category?.name).toBe('生活分享')
    })
  })
})