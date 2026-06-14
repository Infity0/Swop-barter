import api from './axios'
import type { Message } from '../types/chat'

export const chatApi = {
  getMessages: (tradeId: string) => api.get<Message[]>(`/chat/trades/${tradeId}/messages`),
  sendMessage: (tradeId: string, content: string) =>
    api.post<Message>(`/chat/trades/${tradeId}/messages`, { content }),
  markRead: (tradeId: string) => api.patch(`/chat/trades/${tradeId}/read`),
  uploadImage: (tradeId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ url: string }>(`/chat/trades/${tradeId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
