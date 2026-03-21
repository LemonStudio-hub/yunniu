import type { MiddlewareHandler } from 'hono'
import type { Env, Variables } from '../types'
import { AuditService } from '../services/auditService'

/**
 * 审计日志中间件
 * 记录所有请求和响应的审计日志
 */
export const auditLog: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const startTime = Date.now()
  const auditService = new AuditService(c.env.DB)

  // 获取请求信息
  const method = c.req.method
  const path = c.req.path
  const userId = c.get('user')?.userId
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  const userAgent = c.req.header('user-agent') || 'unknown'

  try {
    await next()

    // 记录成功的请求
    const duration = Date.now() - startTime

    // 只记录写操作（POST, PUT, DELETE）
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      await auditService.create({
        user_id: userId,
        action: `${method} ${path}`,
        entity_type: 'api_request',
        entity_id: c.req.path,
        new_values: {
          method,
          path,
          statusCode: c.res.status,
          duration,
        },
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'success',
      })
    }
  } catch (error) {
    // 记录失败的请求
    await auditService.create({
      user_id: userId,
      action: `${method} ${path}`,
      entity_type: 'api_request',
      entity_id: c.req.path,
      new_values: {
        method,
        path,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'failure',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

/**
 * 审计操作记录助手
 * 用于记录特定业务操作的审计日志
 */
export class AuditHelper {
  static async logOperation(
    db: D1Database,
    input: {
      userId?: string
      action: string
      entityType: string
      entityId: string
      oldValues?: Record<string, any>
      newValues?: Record<string, any>
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<void> {
    const auditService = new AuditService(db)
    await auditService.create({
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      old_values: input.oldValues,
      new_values: input.newValues,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
      status: 'success',
    })
  }

  static async logError(
    db: D1Database,
    input: {
      userId?: string
      action: string
      entityType: string
      entityId: string
      errorMessage: string
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<void> {
    const auditService = new AuditService(db)
    await auditService.create({
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
      status: 'failure',
      error_message: input.errorMessage,
    })
  }
}