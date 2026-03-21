import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { PostService } from '../services/postService'
import { NotificationService } from '../services/notificationService'
import { moderationService } from '../services/moderationService'
import { authMiddleware } from '../middleware/auth'
import { csrfProtectionMiddleware } from '../middleware/csrf'

const postsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

postsRouter.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const categoryId = c.req.query('categoryId')
    const authorId = c.req.query('authorId')
    const status = c.req.query('status') as string

    const postService = new PostService(c.env.DB)
    let result

    if (status === 'pending' || status === 'appealed') {
      result = await postService.findPendingPosts({ page, limit })
    } else {
      result = await postService.findAllWithDetails({ page, limit, category_id: categoryId, author_id: authorId })
    }

    return c.json({ posts: result.posts, total: result.total })
  } catch (error: any) {
    return c.json({ error: error.message || '获取帖子列表失败' }, 500)
  }
})

// 获取待审核帖子（管理员）
postsRouter.get('/pending', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({ error: '无权访问' }, 403)
    }

    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')

    const postService = new PostService(c.env.DB)
    const result = await postService.findPendingPosts({ page, limit })

    return c.json({ posts: result.posts, total: result.total })
  } catch (error: any) {
    return c.json({ error: error.message || '获取待审核帖子失败' }, 500)
  }
})

postsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')!
    const postService = new PostService(c.env.DB)

    await postService.incrementViewCount(id)

    const post = await postService.findByIdWithDetails(id)
    if (!post) {
      return c.json({ error: '帖子不存在' }, 404)
    }

    return c.json(post)
  } catch (error: any) {
    return c.json({ error: error.message || '获取帖子失败' }, 500)
  }
})

postsRouter.post('/', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { title, content, categoryId, tags } = await c.req.json()

    if (!title || !content || !categoryId) {
      return c.json({ error: '缺少必要字段' }, 400)
    }

    // 审核内容
    const titleModeration = moderationService.moderate(title)
    const contentModeration = moderationService.moderate(content)

    let status = 'pending'
    let reason: string | undefined

    if (!titleModeration.passed) {
      status = 'rejected'
      reason = `标题包含敏感词: ${titleModeration.sensitiveWords.join(', ')}`
    } else if (!contentModeration.passed) {
      status = 'rejected'
      reason = `内容包含敏感词: ${contentModeration.sensitiveWords.join(', ')}`
    }

    const postService = new PostService(c.env.DB)
    const post = await postService.create({
      title,
      content,
      author_id: user.userId,
      category_id: categoryId,
      tags,
      status,
      reason,
    })

    return c.json(post)
  } catch (error: any) {
    return c.json({ error: error.message || '创建帖子失败' }, 500)
  }
})

postsRouter.put('/:id', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')
    const { title, content, categoryId, tags } = await c.req.json()

    // 审核内容
    if (title) {
      const titleModeration = moderationService.moderate(title)
      if (!titleModeration.passed) {
        return c.json({ error: `标题包含敏感词: ${titleModeration.sensitiveWords.join(', ')}` }, 400)
      }
    }

    if (content) {
      const contentModeration = moderationService.moderate(content)
      if (!contentModeration.passed) {
        return c.json({ error: `内容包含敏感词: ${contentModeration.sensitiveWords.join(', ')}` }, 400)
      }
    }

    const postService = new PostService(c.env.DB)
    const existingPost = await postService.findById(id)

    if (!existingPost) {
      return c.json({ error: '帖子不存在' }, 404)
    }

    if (existingPost.author_id !== user.userId) {
      return c.json({ error: '无权编辑此帖子' }, 403)
    }

    const updatedPost = await postService.update(id, { title, content, category_id: categoryId, tags })
    return c.json(updatedPost)
  } catch (error: any) {
    return c.json({ error: error.message || '更新帖子失败' }, 500)
  }
})

postsRouter.delete('/:id', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const postService = new PostService(c.env.DB)
    const existingPost = await postService.findById(id)

    if (!existingPost) {
      return c.json({ error: '帖子不存在' }, 404)
    }

    if (existingPost.author_id !== user.userId) {
      return c.json({ error: '无权删除此帖子' }, 403)
    }

    await postService.delete(id)
    return c.json({ message: '删除成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '删除帖子失败' }, 500)
  }
})

postsRouter.post('/:id/like', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const existingLike = await c.env.DB
      .prepare('SELECT * FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
      .bind(user.userId, id, 'post')
      .first()

    if (existingLike) {
      return c.json({ error: '已经点赞过' }, 400)
    }

    const likeId = crypto.randomUUID()
    await c.env.DB
      .prepare('INSERT INTO likes (id, user_id, target_id, target_type) VALUES (?, ?, ?, ?)')
      .bind(likeId, user.userId, id, 'post')
      .run()

    const postService = new PostService(c.env.DB)
    const notificationService = new NotificationService(c.env.DB)

    await postService.incrementLikeCount(id)

    const post = await postService.findById(id)
    if (post && post.author_id !== user.userId) {
      const currentUser = await c.env.DB.prepare('SELECT username FROM users WHERE id = ?')
        .bind(user.userId)
        .first<{ username: string }>()

      if (currentUser) {
        await notificationService.create({
          user_id: post.author_id,
          type: 'like',
          title: '点赞通知',
          message: `${currentUser.username} 点赞了你的帖子`,
          link: `/posts/${id}`,
        })
      }
    }

    return c.json({ message: '点赞成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '点赞失败' }, 500)
  }
})

postsRouter.delete('/:id/like', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    await c.env.DB
      .prepare('DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
      .bind(user.userId, id, 'post')
      .run()

    const postService = new PostService(c.env.DB)
    await postService.decrementLikeCount(id)

    return c.json({ message: '取消点赞成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '取消点赞失败' }, 500)
  }
})

postsRouter.get('/:id/comments', async (c) => {
  try {
    const id = c.req.param('id')!
    const postService = new PostService(c.env.DB)
    const comments = await postService.findCommentsWithReplies(id)

    return c.json(comments)
  } catch (error: any) {
    return c.json({ error: error.message || '获取评论失败' }, 500)
  }
})

// 审核通过帖子（管理员）
postsRouter.post('/:id/approve', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({ error: '无权访问' }, 403)
    }

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

// 拒绝帖子（管理员）
postsRouter.post('/:id/reject', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({ error: '无权访问' }, 403)
    }

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

// 申诉帖子（用户）
postsRouter.post('/:id/appeal', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const id = c.req.param('id')!
    const { appealReason } = await c.req.json()

    if (!appealReason) {
      return c.json({ error: '缺少申诉原因' }, 400)
    }

    const postService = new PostService(c.env.DB)
    const existingPost = await postService.findById(id)

    if (!existingPost) {
      return c.json({ error: '帖子不存在' }, 404)
    }

    if (existingPost.author_id !== user.userId) {
      return c.json({ error: '无权申诉此帖子' }, 403)
    }

    if (existingPost.status !== 'rejected') {
      return c.json({ error: '只有被拒绝的帖子才能申诉' }, 400)
    }

    const post = await postService.appealPost(id, appealReason)
    return c.json(post)
  } catch (error: any) {
    return c.json({ error: error.message || '申诉失败' }, 500)
  }
})

export default postsRouter