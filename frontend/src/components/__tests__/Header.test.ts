import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Header from '../Header.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

describe('Header', () => {
  let pinia: any
  let router: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
        { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
      ],
    })
  })

  it('renders correctly', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('shows logo and title', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('云纽')
  })

  it('shows login and register buttons when not authenticated', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('登录')
    expect(wrapper.text()).toContain('注册')
  })
})