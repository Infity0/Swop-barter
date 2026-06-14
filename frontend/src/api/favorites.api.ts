import api from './axios'
import type { Item } from '../types/item'

export const favoritesApi = {
  getAll: () => api.get<Item[]>('/favorites'),
  getIds: () => api.get<string[]>('/favorites/ids'),
  add: (itemId: string) => api.post<{ favorited: boolean }>(`/favorites/${itemId}`),
  remove: (itemId: string) => api.delete<{ favorited: boolean }>(`/favorites/${itemId}`),
}
