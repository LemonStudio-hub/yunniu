<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">内容审核管理</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">待审核内容</h2>
        <div class="flex space-x-2">
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            @click="refreshContent"
            :disabled="loading"
          >
            {{ loading ? '加载中...' : '刷新' }}
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标题/内容
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                原因
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作者
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in pendingItems" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  帖子
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ item.title }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ item.content.substring(0, 100) + '...' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'appealed' ? 'bg-purple-100 text-purple-800'
                  ]"
                >
                  {{ item.status === 'pending' ? '待审核' : '申诉中' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600">{{ item.reason || '无' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ item.authorUsername }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(item.createdAt).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button 
                    class="text-green-600 hover:text-green-900"
                    @click="approveItem(item)"
                    :disabled="processingIds.includes(item.id)"
                  >
                    通过
                  </button>
                  <button 
                    class="text-red-600 hover:text-red-900"
                    @click="openRejectModal(item)"
                    :disabled="processingIds.includes(item.id)"
                  >
                    拒绝
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
      
      <div v-else-if="pendingItems.length === 0" class="text-center py-8 text-gray-500">
        暂无待审核内容
      </div>
    </div>
    
    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">敏感词管理</h2>
      
      <div class="mb-4">
        <div class="flex space-x-2">
          <input 
            v-model="newSensitiveWord" 
            type="text" 
            class="flex-1 px-4 py-2 border border-gray-300 rounded" 
            placeholder="添加敏感词"
          />
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            @click="addSensitiveWord"
            :disabled="!newSensitiveWord.trim()"
          >
            添加
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                敏感词
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="word in sensitiveWords" :key="word">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ word }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  class="text-red-600 hover:text-red-900"
                  @click="removeSensitiveWord(word)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="sensitiveWords.length === 0" class="text-center py-8 text-gray-500">
        暂无敏感词
      </div>
    </div>

    <!-- 拒绝模态框 -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">拒绝内容</h3>
        <form @submit.prevent="submitReject">
          <div class="mb-4">
            <label for="rejectReason" class="block text-sm font-medium text-gray-700 mb-1">拒绝原因</label>
            <textarea
              id="rejectReason"
              v-model="rejectReason"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="请输入拒绝原因..."
              required
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="showRejectModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submittingReject"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submittingReject ? '提交中...' : '拒绝' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '../api/admin'

interface PendingItem {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  status: 'pending' | 'appealed'
  reason?: string
  createdAt: string
}

const pendingItems = ref<PendingItem[]>([])
const sensitiveWords = ref<string[]>([])
const newSensitiveWord = ref('')
const loading = ref(false)
const processingIds = ref<string[]>([])
const showRejectModal = ref(false)
const currentItem = ref<PendingItem | null>(null)
const rejectReason = ref('')
const submittingReject = ref(false)
const router = useRouter()

onMounted(() => {
  loadPendingItems()
  loadSensitiveWords()
})

const loadPendingItems = async () => {
  loading.value = true
  try {
    const result = await adminApi.getPendingPosts()
    pendingItems.value = result.posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.author_id,
      authorUsername: post.author.username,
      status: post.status,
      reason: post.reason,
      createdAt: post.created_at
    }))
  } catch (error) {
    console.error('加载待审核内容失败:', error)
  } finally {
    loading.value = false
  }
}

const loadSensitiveWords = () => {
  // 实际项目中，这里应该从API获取敏感词列表
  console.log('加载敏感词列表')
}

const refreshContent = () => {
  loadPendingItems()
  loadSensitiveWords()
}

const approveItem = async (item: PendingItem) => {
  processingIds.value.push(item.id)
  try {
    await adminApi.approvePost(item.id)
    // 从列表中移除
    const index = pendingItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      pendingItems.value.splice(index, 1)
    }
  } catch (error) {
    console.error('批准内容失败:', error)
    alert('批准内容失败，请稍后重试')
  } finally {
    processingIds.value = processingIds.value.filter(id => id !== item.id)
  }
}

const openRejectModal = (item: PendingItem) => {
  currentItem.value = item
  rejectReason.value = ''
  showRejectModal.value = true
}

const submitReject = async () => {
  if (!currentItem.value || !rejectReason.value.trim()) {
    return
  }

  submittingReject.value = true
  try {
    await adminApi.rejectPost(currentItem.value.id, rejectReason.value.trim())
    // 从列表中移除
    const index = pendingItems.value.findIndex(i => i.id === currentItem.value!.id)
    if (index !== -1) {
      pendingItems.value.splice(index, 1)
    }
    showRejectModal.value = false
  } catch (error) {
    console.error('拒绝内容失败:', error)
    alert('拒绝内容失败，请稍后重试')
  } finally {
    submittingReject.value = false
  }
}

const addSensitiveWord = () => {
  if (newSensitiveWord.value.trim()) {
    // 实际项目中，这里应该调用API添加敏感词
    console.log('添加敏感词:', newSensitiveWord.value)
    sensitiveWords.value.push(newSensitiveWord.value.trim())
    newSensitiveWord.value = ''
  }
}

const removeSensitiveWord = (word: string) => {
  // 实际项目中，这里应该调用API删除敏感词
  console.log('删除敏感词:', word)
  const index = sensitiveWords.value.indexOf(word)
  if (index !== -1) {
    sensitiveWords.value.splice(index, 1)
  }
}
</script>
