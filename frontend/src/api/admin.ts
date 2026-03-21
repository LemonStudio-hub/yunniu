import { apiClient } from './client'
import type { Post } from '../stores/post'

export const adminApi = {
  // 审核相关
  async getPendingPosts(page = 1, limit = 20): Promise<{ posts: Post[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    return apiClient.get<{ posts: Post[]; total: number }>(`/api/admin/posts/pending?${params}`)
  },

  async approvePost(id: string): Promise<Post> {
    return apiClient.post<Post>(`/api/admin/posts/${id}/approve`, {})
  },

  async rejectPost(id: string, reason: string): Promise<Post> {
    return apiClient.post<Post>(`/api/admin/posts/${id}/reject`, { reason })
  },
}
