import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PostCard from '../PostCard.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Post } from '../../stores/post'

describe('PostCard', () => {
  const mockPost: Post = {
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    authorId: 'user1',
    authorUsername: 'testuser',
    authorAvatar: '/avatar.png',
    categoryId: 'cat1',
    categoryName: '技术讨论',
    viewCount: 100,
    likeCount: 10,
    commentCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['vue', 'typescript'],
  }

  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/posts/:id', name: 'post-detail', component: { template: '<div>Post Detail</div>' } },
    ],
  })

  it('renders post correctly', () => {
    const wrapper = mount(PostCard, {
      props: { post: mockPost },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('Test Post')
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('技术讨论')
  })

  it('displays correct statistics', () => {
    const wrapper = mount(PostCard, {
      props: { post: mockPost },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('5')
  })

  it('displays tags', () => {
    const wrapper = mount(PostCard, {
      props: { post: mockPost },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('vue')
    expect(wrapper.text()).toContain('typescript')
  })
})