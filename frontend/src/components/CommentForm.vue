<template>
  <form @submit.prevent="handleSubmit" class="mb-6">
    <textarea
      v-model="content"
      placeholder="写下你的评论..."
      rows="3"
      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
    ></textarea>
    <div class="flex justify-end mt-2">
      <button
        type="submit"
        :disabled="!content.trim() || submitting"
        class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitting ? '提交中...' : '发表评论' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePostStore } from '../stores/post'

const props = defineProps<{
  postId: string
}>()

const postStore = usePostStore()
const content = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (!content.value.trim()) return

  submitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        postId: props.postId,
        content: content.value,
      }),
    })

    if (response.ok) {
      const comment = await response.json()
      postStore.addComment(comment)
      content.value = ''
    }
  } catch (error) {
    console.error('Failed to create comment:', error)
  } finally {
    submitting.value = false
  }
}
</script>