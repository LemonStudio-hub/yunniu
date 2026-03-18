import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { NotificationService } from '../services/notificationService'
import { authMiddleware } from '../middleware/auth'
import { createError, handleError, formatErrorResponse } from '../utils/errorHandler'

const notificationsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

notificationsRouter.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const unreadOnly = c.req.query('unreadOnly') === 'true'

    const notificationService = new NotificationService(c.env.DB)
    const result = await notificationService.findByUserId(user.userId, {
      page,
      limit,
      unread_only: unreadOnly,
    })

    return c.json(result)
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

notificationsRouter.get('/unread-count', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const notificationService = new NotificationService(c.env.DB)
    const result = await notificationService.findByUserId(user.userId, {
      page: 1,
      limit: 1,
    })

    return c.json({ unread_count: result.unread_count })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

notificationsRouter.patch('/:id/read', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const notificationService = new NotificationService(c.env.DB)
    const notification = await notificationService.markAsRead(id, user.userId)

    if (!notification) {
      throw createError.notFound('notification')
    }

    return c.json(notification)
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

notificationsRouter.patch('/read-all', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const notificationService = new NotificationService(c.env.DB)
    await notificationService.markAllAsRead(user.userId)

    return c.json({ message: '所有通知已标记为已读' })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

notificationsRouter.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const notificationService = new NotificationService(c.env.DB)
    await notificationService.delete(id, user.userId)

    return c.json({ message: '删除成功' })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

notificationsRouter.delete('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const notificationService = new NotificationService(c.env.DB)
    await notificationService.deleteAll(user.userId)

    return c.json({ message: '所有通知已删除' })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

export default notificationsRouter