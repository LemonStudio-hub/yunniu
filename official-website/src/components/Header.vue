<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)
const isMenuOpen = ref(false)

const navigation = [
  { name: '首页', href: '/' },
  { name: '关于我们', href: '/about' },
  { name: '产品介绍', href: '/product' },
  { name: '联系我们', href: '/contact' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    ]"
  >
    <div class="container">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="text-2xl font-bold gradient-text">CloudLink</span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="text-gray-700 hover:text-primary-500 transition-colors font-medium"
            :class="{ 'text-primary-500': route.path === item.href }"
          >
            {{ item.name }}
          </RouterLink>
          <a
            href="https://forum.winuel.com"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary"
          >
            访问论坛
          </a>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div
      v-show="isMenuOpen"
      class="md:hidden bg-white border-t border-gray-200"
    >
      <div class="container py-4 space-y-2">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          :class="{ 'bg-primary-50 text-primary-500': route.path === item.href }"
          @click="isMenuOpen = false"
        >
          {{ item.name }}
        </RouterLink>
        <a
          href="https://forum.winuel.com"
          target="_blank"
          rel="noopener noreferrer"
          class="block px-4 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center font-medium"
          @click="isMenuOpen = false"
        >
          访问论坛
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
</style>