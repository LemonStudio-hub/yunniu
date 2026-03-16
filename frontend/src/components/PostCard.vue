<template>
  <article class="group card-base relative overflow-hidden hover:-translate-y-1 hover:shadow-soft-lg transition-all duration-300">
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:via-primary-500/0 group-hover:to-primary-500/5 transition-all duration-300"></div>
    <div class="relative p-6">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="relative">
            <img
              :src="post.authorAvatar || '/default-avatar.png'"
              :alt="post.authorUsername"
              class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-600 group-hover:ring-primary-300 dark:group-hover:ring-primary-600 transition-all duration-300"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <router-link
              :to="`/user/${post.authorUsername}`"
              class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              {{ post.authorUsername }}
            </router-link>
            <span class="text-xs text-gray-400">·</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(post.createdAt) }}
            </span>
          </div>
          <router-link
            :to="`/post/${post.id}`"
            class="block group"
          >
            <h2 class="text-xl font-display font-semibold text-gray-900 dark:text-white group-hover:text-gradient transition-all duration-300 mb-2.5">
              {{ post.title }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
              {{ post.content }}
            </p>
          </router-link>
          <div class="flex flex-wrap items-center gap-4 text-sm">
            <router-link
              :to="`/category/${post.categoryId}`"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full border border-primary-200 dark:border-primary-700/50 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ post.categoryName }}
            </router-link>
            <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="text-xs">{{ post.viewCount }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="text-xs">{{ post.likeCount }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span class="text-xs">{{ post.commentCount }}</span>
            </div>
          </div>
          <div v-if="post.tags.length > 0" class="flex flex-wrap items-center gap-2 mt-4">
            <span
              v-for="tag in post.tags.slice(0, 3)"
              :key="tag"
              class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-secondary-600 dark:text-secondary-400 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-full border border-secondary-200 dark:border-secondary-700/50 hover:border-secondary-300 dark:hover:border-secondary-600 transition-all duration-200 cursor-pointer hover:scale-105"
            >
              #{{ tag }}
            </span>
            <span v-if="post.tags.length > 3" class="text-xs text-gray-400">
              +{{ post.tags.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Post } from '../stores/post'

defineProps<{
  post: Post
}>()

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes < 1 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}
</script>