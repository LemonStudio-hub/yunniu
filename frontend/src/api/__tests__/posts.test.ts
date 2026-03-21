import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { postsApi } from '../posts'
import type { Post, Comment } from '../../stores/post'

describe('Posts API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getPosts', () => {
    it('should fetch posts successfully', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Test Post 1',
          content: 'Content 1',
          authorId: '1',
          authorUsername: 'user1',
          authorAvatar: '/avatar1.png',
          categoryId: '1',
          categoryName: '技术讨论',
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          tags: ['tag1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: mockPosts, total: 1 }),
      })

      const result = await postsApi.getPosts()

      expect(result.posts).toEqual(mockPosts)
      expect(result.total).toBe(1)
    })

    it('should fetch posts with pagination', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [], total: 0 }),
      })

      await postsApi.getPosts(2, 10)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      )
    })

    it('should fetch posts with category filter', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [], total: 0 }),
      })

      await postsApi.getPosts(1, 20, 'category-1')

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('categoryId=category-1'),
        expect.any(Object)
      )
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      await expect(postsApi.getPosts()).rejects.toThrow()
    })
  })

  describe('getPost', () => {
    it('should fetch post by id', async () => {
      const mockPost: Post = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        authorId: '1',
        authorUsername: 'user1',
        authorAvatar: '/avatar.png',
        categoryId: '1',
        categoryName: '技术讨论',
        viewCount: 10,
        likeCount: 5,
        commentCount: 3,
        tags: ['tag1', 'tag2'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      })

      const result = await postsApi.getPost('1')

      expect(result).toEqual(mockPost)
    })

    it('should handle not found error', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(postsApi.getPost('999')).rejects.toThrow()
    })
  })

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockPost: Post = {
        id: '1',
        title: 'New Post',
        content: 'New content',
        authorId: '1',
        authorUsername: 'user1',
        authorAvatar: '/avatar.png',
        categoryId: '1',
        categoryName: '技术讨论',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        tags: ['tag1'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      })

      const result = await postsApi.createPost({
        title: 'New Post',
        content: 'New content',
        categoryId: '1',
        tags: ['tag1'],
      })

      expect(result).toEqual(mockPost)
    })

    it('should handle validation errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      })

      await expect(
        postsApi.createPost({
          title: '',
          content: '',
          categoryId: '',
        })
      ).rejects.toThrow()
    })
  })

  describe('updatePost', () => {
    it('should update a post', async () => {
      const mockPost: Post = {
        id: '1',
        title: 'Updated Title',
        content: 'Updated content',
        authorId: '1',
        authorUsername: 'user1',
        authorAvatar: '/avatar.png',
        categoryId: '1',
        categoryName: '技术讨论',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        tags: ['tag1'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      })

      const result = await postsApi.updatePost('1', {
        title: 'Updated Title',
        content: 'Updated content',
      })

      expect(result).toEqual(mockPost)
    })

    it('should handle not found error', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(
        postsApi.updatePost('999', {
          title: 'Updated Title',
        })
      ).rejects.toThrow()
    })
  })

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '删除成功' }),
      })

      await expect(postsApi.deletePost('1')).resolves.not.toThrow()
    })

    it('should handle not found error', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(postsApi.deletePost('999')).rejects.toThrow()
    })
  })

  describe('getComments', () => {
    it('should fetch comments for a post', async () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          postId: '1',
          authorId: '1',
          authorUsername: 'user1',
          authorAvatar: '/avatar.png',
          content: 'Test comment',
          parentId: undefined,
          likeCount: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      })

      const result = await postsApi.getComments('1')

      expect(result).toEqual(mockComments)
    })

    it('should handle API errors', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      await expect(postsApi.getComments('1')).rejects.toThrow()
    })
  })

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const mockComment: Comment = {
        id: '1',
        postId: '1',
        authorId: '1',
        authorUsername: 'user1',
        authorAvatar: '/avatar.png',
        content: 'Test comment',
        parentId: undefined,
        likeCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      })

      const result = await postsApi.createComment({
        postId: '1',
        content: 'Test comment',
      })

      expect(result).toEqual(mockComment)
    })

    it('should create a reply comment', async () => {
      const mockComment: Comment = {
        id: '1',
        postId: '1',
        authorId: '1',
        authorUsername: 'user1',
        authorAvatar: '/avatar.png',
        content: 'Test reply',
        parentId: 'parent-1',
        likeCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      })

      const result = await postsApi.createComment({
        postId: '1',
        content: 'Test reply',
        parentId: 'parent-1',
      })

      expect(result).toEqual(mockComment)
    })
  })

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const mockComment: Comment = {
        id: '1',
        postId: '1',
        authorId: '1',
        authorUsername: 'user1',
        authorAvatar: '/avatar.png',
        content: 'Updated comment',
        parentId: undefined,
        likeCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      })

      const result = await postsApi.updateComment('1', 'Updated comment')

      expect(result).toEqual(mockComment)
    })
  })

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '删除成功' }),
      })

      await expect(postsApi.deleteComment('1')).resolves.not.toThrow()
    })
  })

  describe('likePost', () => {
    it('should like a post', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '点赞成功' }),
      })

      await expect(postsApi.likePost('1')).resolves.not.toThrow()
    })

    it('should handle already liked error', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      })

      await expect(postsApi.likePost('1')).rejects.toThrow()
    })
  })

  describe('unlikePost', () => {
    it('should unlike a post', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '取消点赞成功' }),
      })

      await expect(postsApi.unlikePost('1')).resolves.not.toThrow()
    })
  })

  describe('likeComment', () => {
    it('should like a comment', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '点赞成功' }),
      })

      await expect(postsApi.likeComment('1')).resolves.not.toThrow()
    })
  })

  describe('unlikeComment', () => {
    it('should unlike a comment', async () => {
      const fetchMock = global.fetch as any
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '取消点赞成功' }),
      })

      await expect(postsApi.unlikeComment('1')).resolves.not.toThrow()
    })
  })
})