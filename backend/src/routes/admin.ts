import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { PostService } from '../services/postService'
import { authMiddleware } from '../middleware/auth'
import { csrfProtectionMiddleware } from '../middleware/csrf'

const adminRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// 管理员权限验证中间件
const adminAuthMiddleware = async (c: any, next: any) => {
  await authMiddleware(c, async () => {
    const user = c.get('user')
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({ error: '无权访问' }, 403)
    }
    await next()
  })
}

// 获取待审核帖子
adminRouter.get('/posts/pending', adminAuthMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')

    const postService = new PostService(c.env.DB)
    const result = await postService.findPendingPosts({ page, limit })

    return c.json({ posts: result.posts, total: result.total })
  } catch (error: any) {
    return c.json({ error: error.message || '获取待审核帖子失败' }, 500)
  }
})

// 审核通过帖子
adminRouter.post('/posts/:id/approve', adminAuthMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const postService = new PostService(c.env.DB)

    const post = await postService.approvePost(id)
    if (!post) {
      return c.json({ error: '帖子不存在' }, 404)
    }

    return c.json(post)
  } catch (error: any) {
    return c.json({ error: error.message || '审核通过失败' }, 500)
  }
})

// 拒绝帖子
adminRouter.post('/posts/:id/reject', adminAuthMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const { reason } = await c.req.json()

    if (!reason) {
      return c.json({ error: '缺少拒绝原因' }, 400)
    }

    const postService = new PostService(c.env.DB)
    const post = await postService.rejectPost(id, reason)
    if (!post) {
      return c.json({ error: '帖子不存在' }, 404)
    }

    return c.json(post)
  } catch (error: any) {
    return c.json({ error: error.message || '拒绝帖子失败' }, 500)
  }
})

export default adminRouter
