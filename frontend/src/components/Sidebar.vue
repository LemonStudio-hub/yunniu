<template>
  <aside class="card-base p-5">
    <nav class="space-y-1">
      <router-link
        to="/"
        class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-primary-500/10 hover:scale-105 hover:-translate-x-1"
      >
        <svg
          class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-all duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span class="group-hover:translate-x-1 transition-transform duration-300">首页</span>
      </router-link>
      <router-link
        v-for="category in categories"
        :key="category.id"
        :to="`/category/${category.id}`"
        class="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-primary-500/10 hover:scale-105 hover:-translate-x-1"
      >
        <svg
          class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-all duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <span class="group-hover:translate-x-1 transition-transform duration-300">{{ category.name }}</span>
      </router-link>
    </nav>

    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        热门标签
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in popularTags"
          :key="tag"
          class="inline-flex items-center px-3 py-1.5 text-xs font-bold text-secondary-700 dark:text-secondary-300 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-full border border-secondary-200 dark:border-secondary-700/50 hover:border-secondary-300 dark:hover:border-secondary-600 transition-all duration-300 cursor-pointer hover:scale-110 hover:shadow-lg hover:shadow-secondary-500/20 hover:-translate-y-0.5"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const categories = ref([
  { id: '1', name: '技术讨论' },
  { id: '2', name: '生活分享' },
  { id: '3', name: '问答专区' },
  { id: '4', name: '资源分享' },
])

const popularTags = ref(['Vue', 'React', 'TypeScript', 'Cloudflare', '前端开发', '后端开发'])
</script>