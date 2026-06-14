import api from './axios'
import type { User } from '../types/user'
import type { Item } from '../types/item'
import type { Category } from '../types/category'
import type { Review } from './reviews.api'

export interface AdminStats {
  usersCount: number
  itemsCount: number
  tradesCount: number
  reviewsCount: number
}

export interface AdminDetailedStats {
  tradesByStatus: { status: string; count: number }[]
  itemsByCategory: { name: string; count: number }[]
  itemsByCondition: { condition: string; count: number }[]
  usersOverTime: { date: string; count: number }[]
  itemsOverTime: { date: string; count: number }[]
}

export interface AdminReview extends Review {
  reviewee: { id: string; username: string; avatar?: string }
}

export interface CreateCategoryDto {
  name: string
  description?: string
  icon?: string
  slug?: string
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  isActive?: boolean
}

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getDetailedStats: () => api.get<AdminDetailedStats>('/admin/stats/detailed'),
  getUsers: (search?: string) => api.get<User[]>('/admin/users', { params: { search } }),
  toggleUserBlock: (id: string) => api.patch<User>(`/admin/users/${id}/block`),
  getItems: (search?: string) => api.get<Item[]>('/admin/items', { params: { search } }),
  deleteItem: (id: string) => api.delete(`/admin/items/${id}`),
  getCategories: () => api.get<Category[]>('/admin/categories'),
  createCategory: (data: CreateCategoryDto) => api.post<Category>('/admin/categories', data),
  updateCategory: (id: string, data: UpdateCategoryDto) => api.patch<Category>(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  getReviews: () => api.get<AdminReview[]>('/admin/reviews'),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
}
