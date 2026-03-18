import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { PostService } from '../services/postService'
import { NotificationService } from '../services/notificationService'
import { authMiddleware } from '../middleware/auth'

const postsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

postsRouter.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const categoryId = c.req.query('categoryId')
    const authorId = c.req.query('authorId')

    const postService = new PostService(c.env.DB)
    const result = await postService.findAll({ page, limit, category_id: categoryId, author_id: authorId })

    // 为每个帖子添加作者信息和分类信息
    const postsWithDetails = await Promise.all(
      result.posts.map(async (post) => {
        const author = await c.env.DB.prepare('SELECT id, username, avatar FROM users WHERE id = ?')
          .bind(post.author_id)
          .first()
        const category = await c.env.DB.prepare('SELECT id, name FROM categories WHERE id = ?')
          .bind(post.category_id)
          .first()
        const tags = await c.env.DB
          .prepare(
            'SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?'
          )
          .bind(post.id)
          .all()

        return {
          ...post,
          authorUsername: author?.username || '',
          authorAvatar: author?.avatar,
          categoryName: category?.name || '',
          tags: tags.results?.map((t: any) => t.name) || [],
        }
      })
    )

    return c.json({ posts: postsWithDetails, total: result.total })
  } catch (error: any) {
    return c.json({ error: error.message || '获取帖子列表失败' }, 500)
  }
})

postsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')!
    const postService = new PostService(c.env.DB)

    await postService.incrementViewCount(id)

    const post = await postService.findById(id)
    if (!post) {
      return c.json({ error: '帖子不存在' }, 404)
    }

    const author = await c.env.DB.prepare('SELECT id, username, avatar FROM users WHERE id = ?')
      .bind(post.author_id)
      .first()
    const category = await c.env.DB.prepare('SELECT id, name FROM categories WHERE id = ?')
      .bind(post.category_id)
      .first()
    const tags = await c.env.DB
      .prepare('SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?')
      .bind(post.id)
      .all()

    return c.json({
      ...post,
      authorUsername: author?.username || '',
      authorAvatar: author?.avatar,
      categoryName: category?.name || '',
      tags: tags.results?.map((t: any) => t.name) || [],
    })
  } catch (error: any) {
    return c.json({ error: error.message || '获取帖子失败' }, 500)
  }
})

postsRouter.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { title, content, categoryId, tags } = await c.req.json()

    if (!title || !content || !categoryId) {
      return c.json({ error: '缺少必要字段' }, 400)
    }

    const postService = new PostService(c.env.DB)
    const post = await postService.create({
      title,
      content,
      author_id: user.userId,
      category_id: categoryId,
      tags,
    })

    return c.json(post)
  } catch (error: any) {
    return c.json({ error: error.message || '创建帖子失败' }, 500)
  }
})

postsRouter.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')
    const { title, content, categoryId, tags } = await c.req.json()

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

postsRouter.delete('/:id', authMiddleware, async (c) => {
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

postsRouter.post('/:id/like', authMiddleware, async (c) => {
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

postsRouter.delete('/:id/like', authMiddleware, async (c) => {
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
    const comments = await postService.findCommentsByPostId(id)

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await c.env.DB.prepare('SELECT id, username, avatar FROM users WHERE id = ?')
          .bind(comment.author_id)
          .first()
        return {
          ...comment,
          authorUsername: author?.username || '',
          authorAvatar: author?.avatar,
        }
      })
    )

    return c.json(commentsWithAuthors)
  } catch (error: any) {
    return c.json({ error: error.message || '获取评论失败' }, 500)
  }
})

export default postsRouter