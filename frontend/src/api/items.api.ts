import api from './axios'
import type { Item, CreateItemDto, UpdateItemDto, ItemsResponse, QueryItemsParams } from '../types/item'

export interface ItemMatch {
  item: Item
  mutual: boolean
  matchedOn: string[]
}

export const itemsApi = {
  getAll: (params?: QueryItemsParams) => api.get<ItemsResponse>('/items', { params }),
  getOne: (id: string) => api.get<Item>(`/items/${id}`),
  getMyItems: () => api.get<Item[]>('/items/my/items'),
  getMatches: () => api.get<ItemMatch[]>('/items/matches/for-me'),
  create: (data: CreateItemDto) => api.post<Item>('/items', data),
  update: (id: string, data: UpdateItemDto) => api.patch<Item>(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
  uploadImages: (id: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    return api.post<Item>(`/items/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage: (imageId: string) => api.delete(`/items/images/${imageId}`),
}
