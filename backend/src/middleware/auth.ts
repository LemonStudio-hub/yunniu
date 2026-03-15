import type { Context, Next } from 'hono'
import { verifyToken } from '../utils/jwt'
import type { JWTPayload } from '../db/models'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权访问' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token)

  if (!payload) {
    return c.json({ error: '无效的令牌' }, 401)
  }

  c.set('user', payload)
  await next()
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JWTPayload

    if (!user || !roles.includes(user.role)) {
      return c.json({ error: '权限不足' }, 403)
    }

    await next()
  }
}