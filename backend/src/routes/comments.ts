import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { PostService } from '../services/postService'
import { authMiddleware } from '../middleware/auth'

const commentsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

commentsRouter.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { postId, content, parentId } = await c.req.json()

    if (!postId || !content) {
      return c.json({ error: '缺少必要字段' }, 400)
    }

    const postService = new PostService(c.env.DB)
    const comment = await postService.createComment({
      post_id: postId,
      author_id: user.userId,
      content,
      parent_id: parentId,
    })

    const author = await c.env.DB.prepare('SELECT id, username, avatar FROM users WHERE id = ?')
      .bind(comment.author_id)
      .first()

    return c.json({
      ...comment,
      authorUsername: author?.username || '',
      authorAvatar: author?.avatar,
    })
  } catch (error: any) {
    return c.json({ error: error.message || '创建评论失败' }, 500)
  }
})

commentsRouter.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!!
    const user = c.get('user')
    const { content } = await c.req.json()

    const postService = new PostService(c.env.DB)
    const existingComment = await postService.findCommentById(id)

    if (!existingComment) {
      return c.json({ error: '评论不存在' }, 404)
    }

    if (existingComment.author_id !== user.userId) {
      return c.json({ error: '无权编辑此评论' }, 403)
    }

    const updatedComment = await postService.updateComment(id, content)
    return c.json(updatedComment)
  } catch (error: any) {
    return c.json({ error: error.message || '更新评论失败' }, 500)
  }
})

commentsRouter.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const postService = new PostService(c.env.DB)
    const existingComment = await postService.findCommentById(id)

    if (!existingComment) {
      return c.json({ error: '评论不存在' }, 404)
    }

    if (existingComment.author_id !== user.userId) {
      return c.json({ error: '无权删除此评论' }, 403)
    }

    await postService.deleteComment(id)
    return c.json({ message: '删除成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '删除评论失败' }, 500)
  }
})

commentsRouter.post('/:id/like', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const existingLike = await c.env.DB
      .prepare('SELECT * FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
      .bind(user.userId, id, 'comment')
      .first()

    if (existingLike) {
      return c.json({ error: '已经点赞过' }, 400)
    }

    const likeId = crypto.randomUUID()
    await c.env.DB
      .prepare('INSERT INTO likes (id, user_id, target_id, target_type) VALUES (?, ?, ?, ?)')
      .bind(likeId, user.userId, id, 'comment')
      .run()

    const postService = new PostService(c.env.DB)
    await postService.incrementCommentLikeCount(id)

    return c.json({ message: '点赞成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '点赞失败' }, 500)
  }
})

commentsRouter.delete('/:id/like', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    await c.env.DB
      .prepare('DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
      .bind(user.userId, id, 'comment')
      .run()

    const postService = new PostService(c.env.DB)
    await postService.decrementCommentLikeCount(id)

    return c.json({ message: '取消点赞成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '取消点赞失败' }, 500)
  }
})

export default commentsRouter