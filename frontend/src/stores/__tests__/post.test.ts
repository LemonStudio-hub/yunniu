import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePostStore } from '../post'
import type { Post, Comment } from '../post'

describe('Post Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = usePostStore()

    expect(store.posts).toEqual([])
    expect(store.currentPost).toBeNull()
    expect(store.comments).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('sets posts', () => {
    const store = usePostStore()
    const mockPosts: Post[] = [
      {
        id: '1',
        title: 'Test Post 1',
        content: 'Content 1',
        authorId: 'user1',
        authorUsername: 'user1',
        authorAvatar: '/avatar1.png',
        categoryId: 'cat1',
        categoryName: 'Category 1',
        tags: ['tag1'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      },
      {
        id: '2',
        title: 'Test Post 2',
        content: 'Content 2',
        authorId: 'user2',
        authorUsername: 'user2',
        authorAvatar: '/avatar2.png',
        categoryId: 'cat2',
        categoryName: 'Category 2',
        tags: ['tag2'],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      },
    ]

    store.setPosts(mockPosts)

    expect(store.posts).toEqual(mockPosts)
    expect(store.posts.length).toBe(2)
  })

  it('sets current post', () => {
    const store = usePostStore()
    const mockPost: Post = {
      id: '1',
      title: 'Test Post',
      content: 'Content',
      authorId: 'user1',
      authorUsername: 'user1',
      authorAvatar: '/avatar.png',
      categoryId: 'cat1',
      categoryName: 'Category 1',
      tags: ['tag1'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    }

    store.setCurrentPost(mockPost)

    expect(store.currentPost).toEqual(mockPost)
  })

  it('sets comments', () => {
    const store = usePostStore()
    const mockComments: Comment[] = [
      {
        id: '1',
        postId: 'post1',
        authorId: 'user1',
        authorUsername: 'user1',
        authorAvatar: '/avatar1.png',
        content: 'Comment 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        likeCount: 0,
      },
      {
        id: '2',
        postId: 'post1',
        authorId: 'user2',
        authorUsername: 'user2',
        authorAvatar: '/avatar2.png',
        content: 'Comment 2',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        likeCount: 0,
      },
    ]

    store.setComments(mockComments)

    expect(store.comments).toEqual(mockComments)
    expect(store.comments.length).toBe(2)
  })

  it('adds post to the beginning of posts array', () => {
    const store = usePostStore()
    const existingPost: Post = {
      id: '1',
      title: 'Existing Post',
      content: 'Existing Content',
      authorId: 'user1',
      authorUsername: 'user1',
      authorAvatar: '/avatar.png',
      categoryId: 'cat1',
      categoryName: 'Category 1',
      tags: ['tag1'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    }

    store.setPosts([existingPost])

    const newPost: Post = {
      id: '2',
      title: 'New Post',
      content: 'New Content',
      authorId: 'user2',
      authorUsername: 'user2',
      authorAvatar: '/avatar2.png',
      categoryId: 'cat2',
      categoryName: 'Category 2',
      tags: ['tag2'],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    }

    store.addPost(newPost)

    expect(store.posts.length).toBe(2)
    expect(store.posts[0].id).toBe('2')
    expect(store.posts[1].id).toBe('1')
  })

  it('updates post in posts array', () => {
    const store = usePostStore()
    const mockPost: Post = {
      id: '1',
      title: 'Test Post',
      content: 'Content',
      authorId: 'user1',
      authorUsername: 'user1',
      authorAvatar: '/avatar.png',
      categoryId: 'cat1',
      categoryName: 'Category 1',
      tags: ['tag1'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    }

    store.setPosts([mockPost])

    store.updatePost('1', { title: 'Updated Title', likeCount: 10 })

    expect(store.posts[0].title).toBe('Updated Title')
    expect(store.posts[0].likeCount).toBe(10)
  })

  it('updates current post', () => {
    const store = usePostStore()
    const mockPost: Post = {
      id: '1',
      title: 'Test Post',
      content: 'Content',
      authorId: 'user1',
      authorUsername: 'user1',
      authorAvatar: '/avatar.png',
      categoryId: 'cat1',
      categoryName: 'Category 1',
      tags: ['tag1'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    }

    store.setCurrentPost(mockPost)

    store.updatePost('1', { viewCount: 100 })

    expect(store.currentPost?.viewCount).toBe(100)
  })

  it('deletes post from posts array', () => {
    const store = usePostStore()
    const mockPosts: Post[] = [
      {
        id: '1',
        title: 'Post 1',
        content: 'Content 1',
        authorId: 'user1',
        authorUsername: 'user1',
        authorAvatar: '/avatar1.png',
        categoryId: 'cat1',
        categoryName: 'Category 1',
        tags: ['tag1'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      },
      {
        id: '2',
        title: 'Post 2',
        content: 'Content 2',
        authorId: 'user2',
        authorUsername: 'user2',
        authorAvatar: '/avatar2.png',
        categoryId: 'cat2',
        categoryName: 'Category 2',
        tags: ['tag2'],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      },
    ]

    store.setPosts(mockPosts)

    store.deletePost('1')

    expect(store.posts.length).toBe(1)
    expect(store.posts[0].id).toBe('2')
  })

  it('clears current post when deleted', () => {
    const store = usePostStore()
    const mockPost: Post = {
      id: '1',
      title: 'Test Post',
      content: 'Content',
      authorId: 'user1',
      authorUsername: 'user1',
      authorAvatar: '/avatar.png',
      categoryId: 'cat1',
      categoryName: 'Category 1',
      tags: ['tag1'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    }

    store.setCurrentPost(mockPost)

    store.deletePost('1')

    expect(store.currentPost).toBeNull()
  })

  it('adds comment to comments array', () => {
    const store = usePostStore()
    const mockComment: Comment = {
      id: '1',
      postId: 'post1',
      authorId: 'user1',
      authorUsername: 'user1',
      authorAvatar: '/avatar.png',
      content: 'Test Comment',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      likeCount: 0,
    }

    store.addComment(mockComment)

    expect(store.comments).toHaveLength(1)
    expect(store.comments[0]).toEqual(mockComment)
  })

  it('updates comment in comments array', () => {
    const store = usePostStore()
    const mockComment: Comment = {
      id: '1',
      postId: 'post1',
      authorId: 'user1',
      authorUsername: 'user1',
      authorAvatar: '/avatar.png',
      content: 'Original Content',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      likeCount: 0,
    }

    store.setComments([mockComment])

    store.updateComment('1', { content: 'Updated Content', likeCount: 5 })

    expect(store.comments[0].content).toBe('Updated Content')
    expect(store.comments[0].likeCount).toBe(5)
  })

  it('deletes comment from comments array', () => {
    const store = usePostStore()
    const mockComments: Comment[] = [
      {
        id: '1',
        postId: 'post1',
        authorId: 'user1',
        authorUsername: 'user1',
        authorAvatar: '/avatar1.png',
        content: 'Comment 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        likeCount: 0,
      },
      {
        id: '2',
        postId: 'post1',
        authorId: 'user2',
        authorUsername: 'user2',
        authorAvatar: '/avatar2.png',
        content: 'Comment 2',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        likeCount: 0,
      },
    ]

    store.setComments(mockComments)

    store.deleteComment('1')

    expect(store.comments.length).toBe(1)
    expect(store.comments[0].id).toBe('2')
  })
})