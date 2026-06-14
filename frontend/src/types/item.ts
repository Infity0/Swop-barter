import type { User } from './user'
import type { Category } from './category'

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'
export type ItemStatus = 'active' | 'in_trade' | 'traded' | 'archived'

export interface ItemImage {
  id: string
  url: string
  isPrimary: boolean
  order: number
}

export interface Item {
  id: string
  title: string
  description: string
  condition: ItemCondition
  status: ItemStatus
  estimatedValue?: number
  city?: string
  desiredItems?: string[]
  viewsCount: number
  owner: User
  ownerId: string
  category?: Category
  categoryId?: string
  images: ItemImage[]
  createdAt: string
  updatedAt: string
}

export interface CreateItemDto {
  title: string
  description: string
  condition: ItemCondition
  estimatedValue?: number
  city?: string
  categoryId?: string
  desiredItems?: string[]
}

export interface UpdateItemDto extends Partial<CreateItemDto> {
  status?: ItemStatus
}

export interface ItemsResponse {
  data: Item[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface QueryItemsParams {
  search?: string
  categoryId?: string
  condition?: ItemCondition
  city?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: 'Новое',
  like_new: 'Как новое',
  good: 'Хорошее',
  fair: 'Удовлетворительное',
  poor: 'Плохое',
}
