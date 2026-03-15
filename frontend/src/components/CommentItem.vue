<template>
  <div class="flex gap-3">
    <div class="flex-shrink-0">
      <img
        :src="comment.authorAvatar || '/default-avatar.png'"
        :alt="comment.authorUsername"
        class="w-10 h-10 rounded-full object-cover"
      />
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <router-link
          :to="`/user/${comment.authorUsername}`"
          class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400"
        >
          {{ comment.authorUsername }}
        </router-link>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatDate(comment.createdAt) }}
        </span>
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {{ comment.content }}
      </p>
      <div class="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <button
          @click="toggleLike"
          :class="[
            'flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300',
            isLiked && 'text-red-500 dark:text-red-400'
          ]"
        >
          <svg class="w-4 h-4" :class="{ 'fill-current': isLiked }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {{ comment.likeCount }}
        </button>
        <button
          @click="reply"
          class="hover:text-gray-700 dark:hover:text-gray-300"
        >
          回复
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Comment } from '../stores/post'

const props = defineProps<{
  comment: Comment
}>()

const isLiked = ref(false)

function toggleLike() {
  isLiked.value = !isLiked.value
}

function reply() {
  // TODO: Implement reply functionality
}

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