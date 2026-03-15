<template>
  <aside class="space-y-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">热门帖子</h3>
      <div class="space-y-3">
        <div v-for="post in hotPosts" :key="post.id" class="group">
          <router-link :to="`/post/${post.id}`" class="block">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {{ post.title }}
            </h4>
            <div class="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ post.authorUsername }}</span>
              <span>·</span>
              <span>{{ post.viewCount }} 次浏览</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">活跃用户</h3>
      <div class="space-y-3">
        <div v-for="user in activeUsers" :key="user.id" class="flex items-center gap-3">
          <img
            :src="user.avatar || '/default-avatar.png'"
            :alt="user.username"
            class="w-8 h-8 rounded-full object-cover"
          />
          <div class="flex-1 min-w-0">
            <router-link :to="`/user/${user.username}`" class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              {{ user.username }}
            </router-link>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.postsCount }} 篇帖子</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4 text-white">
      <h3 class="text-sm font-semibold mb-2">加入云纽</h3>
      <p class="text-xs text-primary-100 mb-3">分享你的想法，与社区成员交流互动</p>
      <router-link
        to="/register"
        class="inline-block px-4 py-2 text-xs font-medium bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
      >
        立即注册
      </router-link>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hotPosts = ref([
  { id: '1', title: '如何使用 Cloudflare Workers 构建全栈应用', authorUsername: 'devuser', viewCount: 1234 },
  { id: '2', title: 'Vue 3 Composition 最佳实践', authorUsername: 'vuedev', viewCount: 892 },
  { id: '3', title: 'TypeScript 高级类型技巧', authorUsername: 'tsmaster', viewCount: 756 },
  { id: '4', title: '前端性能优化指南', authorUsername: 'perfexpert', viewCount: 634 },
  { id: '5', title: 'R2 对象存储使用心得', authorUsername: 'clouduser', viewCount: 521 },
])

const activeUsers = ref([
  { id: '1', username: 'devuser', avatar: '', postsCount: 45 },
  { id: '2', username: 'vuedev', avatar: '', postsCount: 38 },
  { id: '3', username: 'tsmaster', avatar: '', postsCount: 32 },
  { id: '4', username: 'perfexpert', avatar: '', postsCount: 28 },
])
</script>