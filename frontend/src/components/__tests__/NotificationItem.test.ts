import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import NotificationItem from '../NotificationItem.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Notification } from '../../api/notifications'

describe('NotificationItem', () => {
  const mockNotification: Notification = {
    id: '1',
    user_id: 'user1',
    type: 'comment',
    title: '新评论通知',
    message: 'testuser 评论了你的帖子',
    link: '/posts/1',
    is_read: false,
    created_at: '2024-01-01T00:00:00Z',
  }

  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/posts/:id', name: 'post-detail', component: { template: '<div>Post Detail</div>' } },
    ],
  })

  it('renders notification correctly', () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('新评论通知')
    expect(wrapper.text()).toContain('testuser 评论了你的帖子')
  })

  it('emits markAsRead when mark as read button is clicked', async () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification },
      global: {
        plugins: [pinia, router],
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('markAsRead')).toBeTruthy()
    expect(wrapper.emitted('markAsRead')![0]).toEqual(['1'])
  })

  it('emits delete when delete button is clicked', async () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: mockNotification },
      global: {
        plugins: [pinia, router],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[buttons.length - 1].trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual(['1'])
  })

  it('applies correct styles for unread notification', () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: { ...mockNotification, is_read: false } },
      global: {
        plugins: [pinia, router],
      },
    })

    const div = wrapper.find('div')
    expect(div.classes()).toContain('bg-blue-50')
  })

  it('applies correct styles for read notification', () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: { ...mockNotification, is_read: true } },
      global: {
        plugins: [pinia, router],
      },
    })

    const div = wrapper.find('div')
    expect(div.classes()).toContain('bg-white')
  })

  it('does not show mark as read button for read notification', () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: { ...mockNotification, is_read: true } },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).not.toContain('标为已读')
  })

  it('shows mark as read button for unread notification', () => {
    const wrapper = mount(NotificationItem, {
      props: { notification: { ...mockNotification, is_read: false } },
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('标为已读')
  })
})