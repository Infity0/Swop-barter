import api from './axios'

export interface Review {
  id: string
  rating: number
  comment?: string
  reviewerId: string
  revieweeId: string
  tradeOfferId: string
  reviewer: { id: string; username: string; avatar?: string }
  createdAt: string
}

export interface CreateReviewDto {
  revieweeId: string
  tradeOfferId: string
  rating: number
  comment?: string
}

export const reviewsApi = {
  getByUser: (userId: string) => api.get<Review[]>(`/reviews/user/${userId}`),
  create: (dto: CreateReviewDto) => api.post<Review>('/reviews', dto),
}
