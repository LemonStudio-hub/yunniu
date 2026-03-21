<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">系统设置</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        管理系统配置
      </p>
    </div>

    <!-- Settings Cards -->
    <div class="space-y-6">
      <!-- General Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">通用设置</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              站点名称
            </label>
            <input
              v-model="settings.siteName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              站点描述
            </label>
            <textarea
              v-model="settings.siteDescription"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                允许新用户注册
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                关闭后将禁止新用户注册
              </p>
            </div>
            <button
              @click="toggleRegistration"
              :class="settings.allowRegistration ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'"
              class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
            >
              <span
                :class="settings.allowRegistration ? 'translate-x-5' : 'translate-x-0'"
                class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Content Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">内容设置</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              最大置顶帖子数
            </label>
            <input
              v-model.number="settings.maxPinnedPosts"
              type="number"
              min="1"
              max="20"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                启用评论审核
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                新评论需要审核后才能显示
              </p>
            </div>
            <button
              @click="toggleCommentModeration"
              :class="settings.enableCommentModeration ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'"
              class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
            >
              <span
                :class="settings.enableCommentModeration ? 'translate-x-5' : 'translate-x-0'"
                class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const settings = ref({
  siteName: '云纽论坛',
  siteDescription: '一个现代化的社区论坛',
  allowRegistration: true,
  maxPinnedPosts: 5,
  enableCommentModeration: false,
})

const saving = ref(false)

const toggleRegistration = () => {
  settings.value.allowRegistration = !settings.value.allowRegistration
}

const toggleCommentModeration = () => {
  settings.value.enableCommentModeration = !settings.value.enableCommentModeration
}

const saveSettings = async () => {
  saving.value = true
  try {
    // 这里应该调用保存设置的 API
    // const response = await axios.put('/api/admin/settings', settings.value)
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('设置已保存')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // 这里应该从 API 加载设置
  // fetchSettings()
})
</script>