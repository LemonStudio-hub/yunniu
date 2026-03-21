import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { notificationsApi } from '../notifications'
import type { Notification } from '../notifications'

describe('Notifications API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockResponse: Notification[] = [
        {
          id: '1',
          user_id: 'user1',
          type: 'comment',
          title: '新评论通知',
          message: '有人评论了你的帖子',
          link: '/posts/1',
          is_read: false,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: mockResponse,
          total: 1,
          unread_count: 1,
        }),
      })

      const result = await notificationsApi.getNotifications(1, 20, false)

      expect(result.notifications).toEqual(mockResponse)
      expect(result.total).toBe(1)
      expect(result.unread_count).toBe(1)
    })

    it('should fetch unread notifications only', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: [],
          total: 0,
          unread_count: 0,
        }),
      })

      await notificationsApi.getNotifications(1, 20, true)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('unreadOnly=true'),
        expect.any(Object)
      )
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(notificationsApi.getNotifications()).rejects.toThrow()
    })
  })

  describe('getUnreadCount', () => {
    it('should fetch unread count successfully', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          unread_count: 5,
        }),
      })

      const result = await notificationsApi.getUnreadCount()

      expect(result.unread_count).toBe(5)
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      await expect(notificationsApi.getUnreadCount()).rejects.toThrow()
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockNotification: Notification = {
        id: '1',
        user_id: 'user1',
        type: 'comment',
        title: '新评论通知',
        message: '有人评论了你的帖子',
        link: '/posts/1',
        is_read: true,
        created_at: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotification,
      })

      const result = await notificationsApi.markAsRead('1')

      expect(result).toEqual(mockNotification)
      expect(result.is_read).toBe(true)
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(notificationsApi.markAsRead('1')).rejects.toThrow()
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: '所有通知已标记为已读',
        }),
      })

      const result = await notificationsApi.markAllAsRead()

      expect(result.message).toBe('所有通知已标记为已读')
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      await expect(notificationsApi.markAllAsRead()).rejects.toThrow()
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: '删除成功',
        }),
      })

      const result = await notificationsApi.deleteNotification('1')

      expect(result.message).toBe('删除成功')
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(notificationsApi.deleteNotification('1')).rejects.toThrow()
    })
  })

  describe('deleteAllNotifications', () => {
    it('should delete all notifications successfully', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: '所有通知已删除',
        }),
      })

      const result = await notificationsApi.deleteAllNotifications()

      expect(result.message).toBe('所有通知已删除')
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      await expect(notificationsApi.deleteAllNotifications()).rejects.toThrow()
    })
  })
})