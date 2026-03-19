import type { Post, Comment } from '../db/models'
import { generateId } from '../utils/crypto'

export interface CreatePostInput {
  title: string
  content: string
  author_id: string
  category_id: string
  tags?: string[]
}

export interface UpdatePostInput {
  title?: string
  content?: string
  category_id?: string
  tags?: string[]
}

export interface CreateCommentInput {
  post_id: string
  author_id: string
  content: string
  parent_id?: string
}

export class PostService {
  constructor(private db: D1Database) {}

  async create(input: CreatePostInput): Promise<Post> {
    const id = generateId()

    await this.db
      .prepare(
        'INSERT INTO posts (id, title, content, author_id, category_id) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, input.title, input.content, input.author_id, input.category_id)
      .run()

    if (input.tags && input.tags.length > 0) {
      await this.addTagsToPost(id, input.tags)
    }

    return this.findById(id) as Promise<Post>
  }

  async findById(id: string): Promise<Post | null> {
    return this.db.prepare('SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL').bind(id).first<Post>()
  }

  async findAll(options: {
    page?: number
    limit?: number
    category_id?: string
    author_id?: string
  } = {}): Promise<{ posts: Post[]; total: number }> {
    const { page = 1, limit = 20, category_id, author_id } = options
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM posts WHERE deleted_at IS NULL'
    const params: any[] = []

    if (category_id) {
      query += ' AND category_id = ?'
      params.push(category_id)
    }

    if (author_id) {
      query += ' AND author_id = ?'
      params.push(author_id)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const posts = await this.db.prepare(query).bind(...params).all<Post>()

    let countQuery = 'SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL'
    const countParams: any[] = []

    if (category_id) {
      countQuery += ' AND category_id = ?'
      countParams.push(category_id)
    } else if (author_id) {
      countQuery += ' AND author_id = ?'
      countParams.push(author_id)
    }

    const countResult = await this.db.prepare(countQuery).bind(...countParams).first<{ count: number }>()

    return {
      posts: posts.results || [],
      total: countResult?.count || 0,
    }
  }

  async update(id: string, input: UpdatePostInput): Promise<Post | null> {
    const updates: string[] = []
    const params: any[] = []

    if (input.title) {
      updates.push('title = ?')
      params.push(input.title)
    }
    if (input.content) {
      updates.push('content = ?')
      params.push(input.content)
    }
    if (input.category_id) {
      updates.push('category_id = ?')
      params.push(input.category_id)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    await this.db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

    if (input.tags) {
      await this.updatePostTags(id, input.tags)
    }

    return this.findById(id)
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run()
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async decrementLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET like_count = like_count - 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async incrementCommentCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').bind(id).run()
  }

  async decrementCommentCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET comment_count = comment_count - 1 WHERE id = ?').bind(id).run()
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const id = generateId()

    await this.db
      .prepare(
        'INSERT INTO comments (id, post_id, author_id, content, parent_id) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, input.post_id, input.author_id, input.content, input.parent_id || null)
      .run()

    await this.incrementCommentCount(input.post_id)

    return this.findCommentById(id) as Promise<Comment>
  }

  async findCommentById(id: string): Promise<Comment | null> {
    return this.db.prepare('SELECT * FROM comments WHERE id = ? AND deleted_at IS NULL').bind(id).first<Comment>()
  }

  async findCommentsByPostId(postId: string): Promise<Comment[]> {
    const result = await this.db
      .prepare('SELECT * FROM comments WHERE post_id = ? AND deleted_at IS NULL ORDER BY created_at ASC')
      .bind(postId)
      .all<Comment>()

    return result.results || []
  }

  async updateComment(id: string, content: string): Promise<Comment | null> {
    await this.db
      .prepare('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(content, id)
      .run()

    return this.findCommentById(id)
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.findCommentById(id)
    if (comment) {
      await this.db.prepare('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run()
      await this.decrementCommentCount(comment.post_id)
    }
  }

  async incrementCommentLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async decrementCommentLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE comments SET like_count = like_count - 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  private async addTagsToPost(postId: string, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      const tagId = generateId()
      await this.db.prepare('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)').bind(tagId, tagName).run()

      const tag = await this.db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName).first<{ id: string }>()
      if (tag) {
        await this.db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(postId, tag.id).run()
      }
    }
  }

  private async updatePostTags(postId: string, tagNames: string[]): Promise<void> {
    await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId).run()
    await this.addTagsToPost(postId, tagNames)
  }
}