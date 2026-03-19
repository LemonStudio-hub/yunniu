<template>
  <Transition name="fade">
    <div
      v-if="showUpdate"
      class="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              新版本可用
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              有新内容可用，点击下方按钮更新到最新版本。
            </p>
            <div class="flex gap-2">
              <button
                @click="updateApp"
                class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                立即更新
              </button>
              <button
                @click="dismiss"
                class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors duration-300"
              >
                稍后
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showUpdate = ref(false)
let newWorker: ServiceWorker | null = null

// 监听 Service Worker 更新
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // 当新的 Service Worker 激活时，刷新页面
    window.location.reload()
  })
}

// 注册更新监听
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker?.state === 'installed' && navigator.serviceWorker.controller) {
            // 新版本已安装，显示更新提示
            showUpdate.value = true
          }
        })
      }
    })
  })
}

// 更新应用
const updateApp = () => {
  if (newWorker) {
    // 通知新的 Service Worker 跳过等待，立即激活
    newWorker.postMessage({ type: 'SKIP_WAITING' })
  }
  showUpdate.value = false
}

// 关闭提示
const dismiss = () => {
  showUpdate.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>