import { describe, it, expect, beforeEach } from 'vitest'
import { NotificationService } from '../../services/notificationService'
import { createMockD1Database } from '../helpers/db'

describe('NotificationService', () => {
  let mockDb: any
  let notificationService: NotificationService

  beforeEach(() => {
    mockDb = createMockD1Database()
    notificationService = new NotificationService(mockDb)
  })

  describe('create', () => {
    it('should create a new notification', async () => {
      const mockNotification = {
        id: '1',
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
        is_read: false,
        created_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', [mockNotification])

      const notification = await notificationService.create({
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
      })

      expect(notification).toBeDefined()
      expect(notification.user_id).toBe('user1')
      expect(notification.type).toBe('comment')
      expect(notification.title).toBe('新评论通知')
      expect(notification.is_read).toBe(false)
    })
  })

  describe('findById', () => {
    it('should find notification by id', async () => {
      const mockNotification = {
        id: '1',
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
        is_read: false,
        created_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', [mockNotification])

      const notification = await notificationService.findById('1')

      expect(notification).toBeDefined()
      expect(notification?.id).toBe('1')
      expect(notification?.type).toBe('comment')
    })

    it('should return null for non-existent notification', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('notifications', [])

      const notification = await notificationService.findById('999')

      expect(notification).toBeNull()
    })
  })

  describe('findByUserId', () => {
    it('should return paginated notifications for user', async () => {
      const mockNotifications = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        user_id: 'user1',
        type: i % 2 === 0 ? 'comment' : 'like',
        title: `Notification ${i + 1}`,
        message: `Message ${i + 1}`,
        link: '/posts/1',
        is_read: i < 10,
        created_at: new Date().toISOString(),
      }))

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      const result = await notificationService.findByUserId('user1', { page: 1, limit: 20 })

      expect(result.notifications).toBeDefined()
      expect(result.notifications.length).toBe(20)
      expect(result.total).toBe(25)
      expect(result.unread_count).toBe(15)
    })

    it('should filter unread notifications only', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: 'Notification 1',
          message: 'Message 1',
          link: '/posts/1',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: 'Notification 2',
          message: 'Message 2',
          link: '/posts/1',
          is_read: true,
          created_at: new Date().toISOString(),
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      const result = await notificationService.findByUserId('user1', {
        page: 1,
        limit: 20,
        unread_only: true,
      })

      expect(result.notifications.length).toBe(1)
      expect(result.notifications[0].is_read).toBe(false)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: '1',
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
        is_read: false,
        created_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', [mockNotification])

      const notification = await notificationService.markAsRead('1', 'user1')

      expect(notification).toBeDefined()
      expect(notification?.is_read).toBe(true)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: 'Notification 1',
          message: 'Message 1',
          link: '/posts/1',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: 'Notification 2',
          message: 'Message 2',
          link: '/posts/1',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      await notificationService.markAllAsRead('user1')

      const notifications = mockDb.tables.get('notifications')
      expect(notifications.every((n: any) => n.is_read === true)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete notification', async () => {
      const mockNotification = {
        id: '1',
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
        is_read: false,
        created_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', [mockNotification])

      await notificationService.delete('1', 'user1')

      expect(mockDb.tables.get('notifications').length).toBe(0)
    })
  })

  describe('deleteAll', () => {
    it('should delete all notifications for user', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: 'Notification 1',
          message: 'Message 1',
          link: '/posts/1',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user1',
          type: 'like',
          title: 'Notification 2',
          message: 'Message 2',
          link: '/posts/1',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('notifications', mockNotifications)

      await notificationService.deleteAll('user1')

      expect(mockDb.tables.get('notifications').length).toBe(0)
    })
  })
})