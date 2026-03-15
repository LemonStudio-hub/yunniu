import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { UserService } from '../services/userService'
import { authMiddleware } from '../middleware/auth'

const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

authRouter.post('/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json()

    if (!username || !email || !password) {
      return c.json({ error: '缺少必要字段' }, 400)
    }

    const userService = new UserService(c.env.DB)
    const existingUser = await userService.findByEmail(email)

    if (existingUser) {
      return c.json({ error: '邮箱已被注册' }, 400)
    }

    const result = await userService.create({ username, email, password })
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message || '注册失败' }, 500)
  }
})

authRouter.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: '缺少必要字段' }, 400)
    }

    const userService = new UserService(c.env.DB)
    const result = await userService.login({ email, password })
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message || '登录失败' }, 401)
  }
})

authRouter.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userService = new UserService(c.env.DB)
    const userData = await userService.getPublicUser(user.userId)

    if (!userData) {
      return c.json({ error: '用户不存在' }, 404)
    }

    return c.json(userData)
  } catch (error: any) {
    return c.json({ error: error.message || '获取用户信息失败' }, 500)
  }
})

authRouter.post('/logout', authMiddleware, async (c) => {
  return c.json({ message: '退出成功' })
})

export default authRouter